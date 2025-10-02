import { Request, Response } from 'express';
import { WhatsAppService } from '@/services/WhatsAppService';
import { ApiResponse, SessionStatus, WhatsAppStats } from '@/types';
import { logger } from '@/utils/logger';

export class WhatsAppController {
  private whatsappService: WhatsAppService;

  constructor(whatsappService: WhatsAppService) {
    this.whatsappService = whatsappService;
  }

  // GET /api/v1/whatsapp/status
  public getStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const status: SessionStatus = this.whatsappService.getStatus();
      
      const response: ApiResponse<SessionStatus> = {
        success: true,
        data: status,
        message: 'Status obtido com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao obter status:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao obter status do WhatsApp',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // GET /api/v1/whatsapp/qr
  public getQRCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = this.whatsappService.getStatus();
      
      if (!status.qrCode) {
        const response: ApiResponse = {
          success: false,
          error: 'QR Code não disponível. Cliente pode estar pronto ou não inicializado.',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<{ qrCode: string }> = {
        success: true,
        data: { qrCode: status.qrCode },
        message: 'QR Code obtido com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao obter QR Code:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao obter QR Code',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/whatsapp/initialize
  public initialize = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.whatsappService.initialize();
      
      const response: ApiResponse = {
        success: true,
        message: 'WhatsApp inicializado com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao inicializar WhatsApp:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao inicializar WhatsApp',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/whatsapp/restart
  public restart = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.whatsappService.restart();
      
      const response: ApiResponse = {
        success: true,
        message: 'WhatsApp reiniciado com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao reiniciar WhatsApp:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao reiniciar WhatsApp',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/whatsapp/logout
  public logout = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.whatsappService.logout();
      
      const response: ApiResponse = {
        success: true,
        message: 'Logout realizado com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao fazer logout:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao fazer logout',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // GET /api/v1/whatsapp/info
  public getClientInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const info = await this.whatsappService.getClientInfo();
      
      const response: ApiResponse = {
        success: true,
        data: info,
        message: 'Informações do cliente obtidas com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao obter informações do cliente:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao obter informações do cliente',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // GET /api/v1/whatsapp/stats
  public getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = this.whatsappService.getStatus();
      const contacts = await this.whatsappService.getContacts();
      const chats = await this.whatsappService.getChats();
      
      const stats: WhatsAppStats = {
        totalMessages: 0, // Seria necessário implementar contador
        totalContacts: contacts.length,
        totalGroups: chats.filter(chat => chat.isGroup).length,
        uptime: process.uptime(),
        lastActivity: status.lastSeen || 0,
        memoryUsage: process.memoryUsage()
      };

      const response: ApiResponse<WhatsAppStats> = {
        success: true,
        data: stats,
        message: 'Estatísticas obtidas com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao obter estatísticas:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao obter estatísticas',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/whatsapp/status-message
  public setStatusMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        const response: ApiResponse = {
          success: false,
          error: 'Status é obrigatório e deve ser uma string',
          timestamp: new Date().toISOString()
        };
        res.status(400).json(response);
        return;
      }

      await this.whatsappService.setStatus(status);
      
      const response: ApiResponse = {
        success: true,
        message: 'Status alterado com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao alterar status:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao alterar status',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // GET /api/v1/whatsapp/events
  public getEvents = (req: Request, res: Response): void => {
    try {
      // Configura headers para Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Envia evento de conexão
      res.write(`data: ${JSON.stringify({
        type: 'connected',
        message: 'Conectado aos eventos do WhatsApp',
        timestamp: new Date().toISOString()
      })}\n\n`);

      // Listener para eventos do WhatsApp
      const eventHandler = (event: any) => {
        const eventData = {
          type: 'whatsapp_event',
          data: event,
          timestamp: new Date().toISOString()
        };
        res.write(`data: ${JSON.stringify(eventData)}\n\n`);
      };

      // Registra listeners para eventos importantes
      this.whatsappService.on('message', eventHandler);
      this.whatsappService.on('message_create', eventHandler);
      this.whatsappService.on('message_ack', eventHandler);
      this.whatsappService.on('group_join', eventHandler);
      this.whatsappService.on('group_leave', eventHandler);
      this.whatsappService.on('ready', eventHandler);
      this.whatsappService.on('disconnected', eventHandler);

      // Limpa listeners quando a conexão é fechada
      req.on('close', () => {
        this.whatsappService.removeListener('message', eventHandler);
        this.whatsappService.removeListener('message_create', eventHandler);
        this.whatsappService.removeListener('message_ack', eventHandler);
        this.whatsappService.removeListener('group_join', eventHandler);
        this.whatsappService.removeListener('group_leave', eventHandler);
        this.whatsappService.removeListener('ready', eventHandler);
        this.whatsappService.removeListener('disconnected', eventHandler);
      });

      // Envia ping a cada 30 segundos para manter a conexão
      const pingInterval = setInterval(() => {
        res.write(`data: ${JSON.stringify({
          type: 'ping',
          timestamp: new Date().toISOString()
        })}\n\n`);
      }, 30000);

      req.on('close', () => {
        clearInterval(pingInterval);
      });

    } catch (error) {
      logger.error('Erro ao configurar eventos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao configurar eventos',
        timestamp: new Date().toISOString()
      });
    }
  };
}
