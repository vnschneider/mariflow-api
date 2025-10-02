import { Request, Response } from 'express';
import { WhatsAppService } from '@/services/WhatsAppService';
import { ApiResponse, ContactResponse, PaginatedResponse } from '@/types';
import { logger } from '@/utils/logger';

export class ContactController {
  private whatsappService: WhatsAppService;

  constructor(whatsappService: WhatsAppService) {
    this.whatsappService = whatsappService;
  }

  // GET /api/v1/contacts
  public getContacts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 50, search, filter = 'all' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let contacts = await this.whatsappService.getContacts();

      // Aplicar filtros
      if (filter === 'blocked') {
        contacts = contacts.filter(contact => contact.isBlocked);
      } else if (filter === 'business') {
        contacts = contacts.filter(contact => contact.isBusiness);
      } else if (filter === 'groups') {
        contacts = contacts.filter(contact => contact.isGroup);
      } else if (filter === 'individuals') {
        contacts = contacts.filter(contact => !contact.isGroup);
      }

      // Aplicar busca
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        contacts = contacts.filter(contact => 
          contact.name?.toLowerCase().includes(searchTerm) ||
          contact.number?.includes(searchTerm) ||
          contact.pushname?.toLowerCase().includes(searchTerm)
        );
      }

      // Paginação
      const total = contacts.length;
      const paginatedContacts = contacts.slice(offset, offset + limitNum);

      const contactResponses: ContactResponse[] = paginatedContacts.map(contact => ({
        id: contact.id._serialized,
        name: contact.name || contact.pushname || 'Sem nome',
        number: contact.number || '',
        isGroup: contact.isGroup,
        isBlocked: contact.isBlocked,
        isBusiness: contact.isBusiness,
        profilePicUrl: undefined // Será preenchido se necessário
      }));

      const paginatedResponse: PaginatedResponse<ContactResponse> = {
        data: contactResponses,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      };

      const response: ApiResponse<PaginatedResponse<ContactResponse>> = {
        success: true,
        data: paginatedResponse,
        message: 'Contatos obtidos com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao obter contatos:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao obter contatos',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // GET /api/v1/contacts/:contactId
  public getContact = async (req: Request, res: Response): Promise<void> => {
    try {
      const { contactId } = req.params;

      const contacts = await this.whatsappService.getContacts();
      const contact = contacts.find(c => c.id._serialized === contactId);

      if (!contact) {
        const response: ApiResponse = {
          success: false,
          error: 'Contato não encontrado',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      const contactResponse: ContactResponse = {
        id: contact.id._serialized,
        name: contact.name || contact.pushname || 'Sem nome',
        number: contact.number || '',
        isGroup: contact.isGroup,
        isBlocked: contact.isBlocked,
        isBusiness: contact.isBusiness,
        profilePicUrl: undefined
      };

      const response: ApiResponse<ContactResponse> = {
        success: true,
        data: contactResponse,
        message: 'Contato obtido com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao obter contato:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao obter contato',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // GET /api/v1/contacts/:contactId/profile-picture
  public getProfilePicture = async (req: Request, res: Response): Promise<void> => {
    try {
      const { contactId } = req.params;

      const profilePicUrl = await this.whatsappService.getProfilePicture(contactId);

      if (!profilePicUrl) {
        const response: ApiResponse = {
          success: false,
          error: 'Foto de perfil não encontrada',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<{ profilePicUrl: string }> = {
        success: true,
        data: { profilePicUrl },
        message: 'Foto de perfil obtida com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao obter foto de perfil:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao obter foto de perfil',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/contacts/:contactId/block
  public blockContact = async (req: Request, res: Response): Promise<void> => {
    try {
      const { contactId } = req.params;

      await this.whatsappService.blockContact(contactId);

      const response: ApiResponse = {
        success: true,
        message: 'Contato bloqueado com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao bloquear contato:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao bloquear contato',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/contacts/:contactId/unblock
  public unblockContact = async (req: Request, res: Response): Promise<void> => {
    try {
      const { contactId } = req.params;

      await this.whatsappService.unblockContact(contactId);

      const response: ApiResponse = {
        success: true,
        message: 'Contato desbloqueado com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao desbloquear contato:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao desbloquear contato',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // GET /api/v1/contacts/:contactId/chat
  public getContactChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { contactId } = req.params;

      const chat = await this.whatsappService.getChatById(contactId);

      const response: ApiResponse = {
        success: true,
        data: {
          id: chat.id._serialized,
          name: chat.name,
          isGroup: chat.isGroup,
          isReadOnly: chat.isReadOnly,
          unreadCount: chat.unreadCount,
          lastMessage: chat.lastMessage ? {
            id: chat.lastMessage.id._serialized,
            body: chat.lastMessage.body,
            timestamp: chat.lastMessage.timestamp,
            fromMe: chat.lastMessage.fromMe
          } : null
        },
        message: 'Chat do contato obtido com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao obter chat do contato:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao obter chat do contato',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/contacts/:contactId/chat/mark-read
  public markChatAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { contactId } = req.params;

      await this.whatsappService.markAsRead(contactId);

      const response: ApiResponse = {
        success: true,
        message: 'Chat marcado como lido com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao marcar chat como lido:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao marcar chat como lido',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/contacts/:contactId/chat/mute
  public muteChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { contactId } = req.params;
      const { duration } = req.body;

      await this.whatsappService.muteChat(contactId, duration);

      const response: ApiResponse = {
        success: true,
        message: 'Chat silenciado com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao silenciar chat:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao silenciar chat',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/contacts/:contactId/chat/unmute
  public unmuteChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { contactId } = req.params;

      await this.whatsappService.unmuteChat(contactId);

      const response: ApiResponse = {
        success: true,
        message: 'Chat desilenciado com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao desilenciar chat:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao desilenciar chat',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/contacts/:contactId/chat/archive
  public archiveChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { contactId } = req.params;

      await this.whatsappService.archiveChat(contactId);

      const response: ApiResponse = {
        success: true,
        message: 'Chat arquivado com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao arquivar chat:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao arquivar chat',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/contacts/:contactId/chat/unarchive
  public unarchiveChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { contactId } = req.params;

      await this.whatsappService.unarchiveChat(contactId);

      const response: ApiResponse = {
        success: true,
        message: 'Chat desarquivado com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao desarquivar chat:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao desarquivar chat',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/contacts/:contactId/chat/pin
  public pinChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { contactId } = req.params;

      await this.whatsappService.pinChat(contactId);

      const response: ApiResponse = {
        success: true,
        message: 'Chat fixado com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao fixar chat:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao fixar chat',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/contacts/:contactId/chat/unpin
  public unpinChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { contactId } = req.params;

      await this.whatsappService.unpinChat(contactId);

      const response: ApiResponse = {
        success: true,
        message: 'Chat desfixado com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao desfixar chat:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao desfixar chat',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // DELETE /api/v1/contacts/:contactId/chat
  public deleteChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { contactId } = req.params;

      await this.whatsappService.deleteChat(contactId);

      const response: ApiResponse = {
        success: true,
        message: 'Chat deletado com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao deletar chat:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao deletar chat',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };
}
