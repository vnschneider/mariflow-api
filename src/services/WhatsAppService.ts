import { Client, LocalAuth, Message, Contact, GroupChat, MessageMedia, QRCodeEvent, ReadyEvent } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { EventEmitter } from 'events';
import { WhatsAppConfig, SessionStatus, WhatsAppEvent, WhatsAppError } from '@/types';
import { logger } from '@/utils/logger';
import * as fs from 'fs';
import * as path from 'path';

export class WhatsAppService extends EventEmitter {
  private client: Client;
  private config: WhatsAppConfig;
  private isReady: boolean = false;
  private isAuthenticated: boolean = false;
  private qrCode: string | null = null;
  private phoneNumber: string | null = null;
  private name: string | null = null;
  private lastSeen: number = 0;

  constructor(config: WhatsAppConfig) {
    super();
    this.config = config;
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      // Cria diretório de sessões se não existir
      if (!fs.existsSync(this.config.sessionPath)) {
        fs.mkdirSync(this.config.sessionPath, { recursive: true });
      }

      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'whatsapp-api',
          dataPath: this.config.sessionPath
        }),
        puppeteer: this.config.puppeteerOptions
      });

      this.setupEventListeners();
      logger.info('Cliente WhatsApp inicializado');
    } catch (error) {
      logger.error('Erro ao inicializar cliente WhatsApp:', error);
      throw new WhatsAppError('Falha ao inicializar cliente WhatsApp', 'INIT_ERROR');
    }
  }

  private setupEventListeners(): void {
    // Evento de QR Code
    this.client.on('qr', (qr: string) => {
      this.qrCode = qr;
      this.emit('qr', qr);
      logger.info('QR Code gerado');
      
      // Exibe QR Code no terminal
      console.log('\n📱 Escaneie o QR Code abaixo com seu WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    // Evento de autenticação
    this.client.on('authenticated', () => {
      this.isAuthenticated = true;
      this.emit('authenticated');
      logger.info('WhatsApp autenticado com sucesso');
    });

    // Evento de falha na autenticação
    this.client.on('auth_failure', (msg: string) => {
      this.isAuthenticated = false;
      this.emit('auth_failure', msg);
      logger.error('Falha na autenticação WhatsApp:', msg);
    });

    // Evento de pronto
    this.client.on('ready', () => {
      this.isReady = true;
      this.isAuthenticated = true;
      this.lastSeen = Date.now();
      this.phoneNumber = this.client.info?.wid?.user || null;
      this.name = this.client.info?.pushname || null;
      this.qrCode = null;
      
      this.emit('ready');
      logger.info(`WhatsApp pronto! Número: ${this.phoneNumber}, Nome: ${this.name}`);
    });

    // Evento de desconexão
    this.client.on('disconnected', (reason: string) => {
      this.isReady = false;
      this.isAuthenticated = false;
      this.emit('disconnected', reason);
      logger.warn('WhatsApp desconectado:', reason);
    });

    // Evento de mensagem recebida
    this.client.on('message', (message: Message) => {
      this.emit('message', message);
      this.lastSeen = Date.now();
      logger.debug('Mensagem recebida:', message.id._serialized);
    });

    // Evento de mensagem criada
    this.client.on('message_create', (message: Message) => {
      this.emit('message_create', message);
      this.lastSeen = Date.now();
      logger.debug('Mensagem criada:', message.id._serialized);
    });

    // Evento de confirmação de mensagem
    this.client.on('message_ack', (message: Message, ack: any) => {
      this.emit('message_ack', message, ack);
      logger.debug('Confirmação de mensagem:', message.id._serialized, ack);
    });

    // Evento de reação
    this.client.on('message_reaction', (reaction: any) => {
      this.emit('message_reaction', reaction);
      logger.debug('Reação recebida:', reaction);
    });

    // Evento de grupo
    this.client.on('group_join', (notification: any) => {
      this.emit('group_join', notification);
      logger.info('Usuário entrou no grupo:', notification);
    });

    this.client.on('group_leave', (notification: any) => {
      this.emit('group_leave', notification);
      logger.info('Usuário saiu do grupo:', notification);
    });

    // Evento de mudança de bateria
    this.client.on('battery_changed', (battery: any) => {
      this.emit('battery_changed', battery);
      logger.debug('Bateria alterada:', battery);
    });

    // Evento de mudança de estado
    this.client.on('state_changed', (state: string) => {
      this.emit('state_changed', state);
      logger.info('Estado alterado:', state);
    });
  }

  public async initialize(): Promise<void> {
    try {
      await this.client.initialize();
      logger.info('Inicializando cliente WhatsApp...');
    } catch (error) {
      logger.error('Erro ao inicializar cliente WhatsApp:', error);
      throw new WhatsAppError('Falha ao inicializar cliente WhatsApp', 'INIT_ERROR');
    }
  }

  public async destroy(): Promise<void> {
    try {
      if (this.client) {
        await this.client.destroy();
        this.isReady = false;
        this.isAuthenticated = false;
        logger.info('Cliente WhatsApp destruído');
      }
    } catch (error) {
      logger.error('Erro ao destruir cliente WhatsApp:', error);
    }
  }

  public getStatus(): SessionStatus {
    return {
      isReady: this.isReady,
      isAuthenticated: this.isAuthenticated,
      qrCode: this.qrCode,
      phoneNumber: this.phoneNumber,
      name: this.name,
      lastSeen: this.lastSeen
    };
  }

  public async sendMessage(to: string, content: string): Promise<Message> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const message = await this.client.sendMessage(to, content);
      this.lastSeen = Date.now();
      logger.info(`Mensagem enviada para ${to}:`, message.id._serialized);
      return message;
    } catch (error) {
      logger.error('Erro ao enviar mensagem:', error);
      throw new WhatsAppError('Falha ao enviar mensagem', 'SEND_ERROR');
    }
  }

  public async sendMedia(to: string, media: MessageMedia, caption?: string): Promise<Message> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const message = await this.client.sendMessage(to, media, { caption });
      this.lastSeen = Date.now();
      logger.info(`Mídia enviada para ${to}:`, message.id._serialized);
      return message;
    } catch (error) {
      logger.error('Erro ao enviar mídia:', error);
      throw new WhatsAppError('Falha ao enviar mídia', 'SEND_MEDIA_ERROR');
    }
  }

  public async getContacts(): Promise<Contact[]> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const contacts = await this.client.getContacts();
      logger.debug(`Retornando ${contacts.length} contatos`);
      return contacts;
    } catch (error) {
      logger.error('Erro ao obter contatos:', error);
      throw new WhatsAppError('Falha ao obter contatos', 'GET_CONTACTS_ERROR');
    }
  }

  public async getChats(): Promise<any[]> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const chats = await this.client.getChats();
      logger.debug(`Retornando ${chats.length} chats`);
      return chats;
    } catch (error) {
      logger.error('Erro ao obter chats:', error);
      throw new WhatsAppError('Falha ao obter chats', 'GET_CHATS_ERROR');
    }
  }

  public async getChatById(chatId: string): Promise<any> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const chat = await this.client.getChatById(chatId);
      logger.debug(`Chat obtido: ${chatId}`);
      return chat;
    } catch (error) {
      logger.error('Erro ao obter chat:', error);
      throw new WhatsAppError('Falha ao obter chat', 'GET_CHAT_ERROR');
    }
  }

  public async createGroup(name: string, participants: string[]): Promise<GroupChat> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const group = await this.client.createGroup(name, participants);
      this.lastSeen = Date.now();
      logger.info(`Grupo criado: ${name} com ${participants.length} participantes`);
      return group;
    } catch (error) {
      logger.error('Erro ao criar grupo:', error);
      throw new WhatsAppError('Falha ao criar grupo', 'CREATE_GROUP_ERROR');
    }
  }

  public async getGroupInviteLink(groupId: string): Promise<string> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const chat = await this.getChatById(groupId);
      if (!chat.isGroup) {
        throw new WhatsAppError('Chat não é um grupo', 'NOT_GROUP');
      }
      
      const inviteLink = await chat.getInviteCode();
      logger.info(`Link de convite gerado para grupo: ${groupId}`);
      return inviteLink;
    } catch (error) {
      logger.error('Erro ao obter link de convite:', error);
      throw new WhatsAppError('Falha ao obter link de convite', 'GET_INVITE_ERROR');
    }
  }

  public async joinGroup(inviteCode: string): Promise<GroupChat> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const group = await this.client.acceptInvite(inviteCode);
      this.lastSeen = Date.now();
      logger.info(`Entrou no grupo via convite: ${inviteCode}`);
      return group;
    } catch (error) {
      logger.error('Erro ao entrar no grupo:', error);
      throw new WhatsAppError('Falha ao entrar no grupo', 'JOIN_GROUP_ERROR');
    }
  }

  public async getProfilePicture(contactId: string): Promise<string | null> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const contact = await this.client.getContactById(contactId);
      const profilePicUrl = await contact.getProfilePicUrl();
      logger.debug(`Foto de perfil obtida para: ${contactId}`);
      return profilePicUrl;
    } catch (error) {
      logger.error('Erro ao obter foto de perfil:', error);
      return null;
    }
  }

  public async setStatus(status: string): Promise<void> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      await this.client.setStatus(status);
      this.lastSeen = Date.now();
      logger.info(`Status alterado para: ${status}`);
    } catch (error) {
      logger.error('Erro ao alterar status:', error);
      throw new WhatsAppError('Falha ao alterar status', 'SET_STATUS_ERROR');
    }
  }

  public async blockContact(contactId: string): Promise<void> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const contact = await this.client.getContactById(contactId);
      await contact.block();
      this.lastSeen = Date.now();
      logger.info(`Contato bloqueado: ${contactId}`);
    } catch (error) {
      logger.error('Erro ao bloquear contato:', error);
      throw new WhatsAppError('Falha ao bloquear contato', 'BLOCK_CONTACT_ERROR');
    }
  }

  public async unblockContact(contactId: string): Promise<void> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const contact = await this.client.getContactById(contactId);
      await contact.unblock();
      this.lastSeen = Date.now();
      logger.info(`Contato desbloqueado: ${contactId}`);
    } catch (error) {
      logger.error('Erro ao desbloquear contato:', error);
      throw new WhatsAppError('Falha ao desbloquear contato', 'UNBLOCK_CONTACT_ERROR');
    }
  }

  public async getMessages(chatId: string, limit: number = 50): Promise<Message[]> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const chat = await this.getChatById(chatId);
      const messages = await chat.fetchMessages({ limit });
      logger.debug(`Retornando ${messages.length} mensagens do chat: ${chatId}`);
      return messages;
    } catch (error) {
      logger.error('Erro ao obter mensagens:', error);
      throw new WhatsAppError('Falha ao obter mensagens', 'GET_MESSAGES_ERROR');
    }
  }

  public async markAsRead(chatId: string): Promise<void> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const chat = await this.getChatById(chatId);
      await chat.sendSeen();
      logger.debug(`Chat marcado como lido: ${chatId}`);
    } catch (error) {
      logger.error('Erro ao marcar como lido:', error);
      throw new WhatsAppError('Falha ao marcar como lido', 'MARK_READ_ERROR');
    }
  }

  public async muteChat(chatId: string, duration?: number): Promise<void> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const chat = await this.getChatById(chatId);
      await chat.mute(duration);
      this.lastSeen = Date.now();
      logger.info(`Chat silenciado: ${chatId}`);
    } catch (error) {
      logger.error('Erro ao silenciar chat:', error);
      throw new WhatsAppError('Falha ao silenciar chat', 'MUTE_CHAT_ERROR');
    }
  }

  public async unmuteChat(chatId: string): Promise<void> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const chat = await this.getChatById(chatId);
      await chat.unmute();
      this.lastSeen = Date.now();
      logger.info(`Chat desilenciado: ${chatId}`);
    } catch (error) {
      logger.error('Erro ao desilenciar chat:', error);
      throw new WhatsAppError('Falha ao desilenciar chat', 'UNMUTE_CHAT_ERROR');
    }
  }

  public async archiveChat(chatId: string): Promise<void> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const chat = await this.getChatById(chatId);
      await chat.archive();
      this.lastSeen = Date.now();
      logger.info(`Chat arquivado: ${chatId}`);
    } catch (error) {
      logger.error('Erro ao arquivar chat:', error);
      throw new WhatsAppError('Falha ao arquivar chat', 'ARCHIVE_CHAT_ERROR');
    }
  }

  public async unarchiveChat(chatId: string): Promise<void> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const chat = await this.getChatById(chatId);
      await chat.unarchive();
      this.lastSeen = Date.now();
      logger.info(`Chat desarquivado: ${chatId}`);
    } catch (error) {
      logger.error('Erro ao desarquivar chat:', error);
      throw new WhatsAppError('Falha ao desarquivar chat', 'UNARCHIVE_CHAT_ERROR');
    }
  }

  public async deleteChat(chatId: string): Promise<void> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const chat = await this.getChatById(chatId);
      await chat.delete();
      this.lastSeen = Date.now();
      logger.info(`Chat deletado: ${chatId}`);
    } catch (error) {
      logger.error('Erro ao deletar chat:', error);
      throw new WhatsAppError('Falha ao deletar chat', 'DELETE_CHAT_ERROR');
    }
  }

  public async pinChat(chatId: string): Promise<void> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const chat = await this.getChatById(chatId);
      await chat.pin();
      this.lastSeen = Date.now();
      logger.info(`Chat fixado: ${chatId}`);
    } catch (error) {
      logger.error('Erro ao fixar chat:', error);
      throw new WhatsAppError('Falha ao fixar chat', 'PIN_CHAT_ERROR');
    }
  }

  public async unpinChat(chatId: string): Promise<void> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      const chat = await this.getChatById(chatId);
      await chat.unpin();
      this.lastSeen = Date.now();
      logger.info(`Chat desfixado: ${chatId}`);
    } catch (error) {
      logger.error('Erro ao desfixar chat:', error);
      throw new WhatsAppError('Falha ao desfixar chat', 'UNPIN_CHAT_ERROR');
    }
  }

  public async getClientInfo(): Promise<any> {
    if (!this.isReady) {
      throw new WhatsAppError('Cliente WhatsApp não está pronto', 'NOT_READY');
    }

    try {
      return this.client.info;
    } catch (error) {
      logger.error('Erro ao obter informações do cliente:', error);
      throw new WhatsAppError('Falha ao obter informações do cliente', 'GET_CLIENT_INFO_ERROR');
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.client.logout();
      this.isReady = false;
      this.isAuthenticated = false;
      this.phoneNumber = null;
      this.name = null;
      this.qrCode = null;
      logger.info('Logout realizado com sucesso');
    } catch (error) {
      logger.error('Erro ao fazer logout:', error);
      throw new WhatsAppError('Falha ao fazer logout', 'LOGOUT_ERROR');
    }
  }

  public async restart(): Promise<void> {
    try {
      await this.destroy();
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2 segundos
      this.initializeClient();
      await this.initialize();
      logger.info('Cliente WhatsApp reiniciado');
    } catch (error) {
      logger.error('Erro ao reiniciar cliente WhatsApp:', error);
      throw new WhatsAppError('Falha ao reiniciar cliente WhatsApp', 'RESTART_ERROR');
    }
  }
}
