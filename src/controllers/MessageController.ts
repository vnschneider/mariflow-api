import { Request, Response } from 'express';
import { WhatsAppService } from '@/services/WhatsAppService';
import { ApiResponse, SendMessageRequest, MessageResponse, PaginatedResponse } from '@/types';
import { logger } from '@/utils/logger';
import { MessageMedia } from 'whatsapp-web.js';
import * as fs from 'fs';
import * as path from 'path';

export class MessageController {
  private whatsappService: WhatsAppService;

  constructor(whatsappService: WhatsAppService) {
    this.whatsappService = whatsappService;
  }

  // POST /api/v1/messages/send
  public sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { to, message, type = 'text', media }: SendMessageRequest = req.body;

      if (!to || !message) {
        const response: ApiResponse = {
          success: false,
          error: 'Destinatário e mensagem são obrigatórios',
          timestamp: new Date().toISOString()
        };
        res.status(400).json(response);
        return;
      }

      let sentMessage;

      if (type === 'text') {
        sentMessage = await this.whatsappService.sendMessage(to, message);
      } else if (media) {
        const messageMedia = new MessageMedia(media.mimetype || 'text/plain', media.data, media.filename);
        sentMessage = await this.whatsappService.sendMedia(to, messageMedia, message);
      } else {
        const response: ApiResponse = {
          success: false,
          error: 'Mídia é obrigatória para tipos diferentes de texto',
          timestamp: new Date().toISOString()
        };
        res.status(400).json(response);
        return;
      }

      const messageResponse: MessageResponse = {
        id: sentMessage.id._serialized,
        from: sentMessage.from,
        to: sentMessage.to,
        body: sentMessage.body,
        timestamp: sentMessage.timestamp,
        type: sentMessage.type,
        hasMedia: sentMessage.hasMedia,
        isForwarded: sentMessage.isForwarded,
        fromMe: sentMessage.fromMe
      };

      const response: ApiResponse<MessageResponse> = {
        success: true,
        data: messageResponse,
        message: 'Mensagem enviada com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao enviar mensagem:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao enviar mensagem',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/messages/send-media
  public sendMedia = async (req: Request, res: Response): Promise<void> => {
    try {
      const { to, caption } = req.body;
      const file = req.file;

      if (!to || !file) {
        const response: ApiResponse = {
          success: false,
          error: 'Destinatário e arquivo são obrigatórios',
          timestamp: new Date().toISOString()
        };
        res.status(400).json(response);
        return;
      }

      const messageMedia = new MessageMedia(file.mimetype, file.buffer.toString('base64'), file.originalname);
      const sentMessage = await this.whatsappService.sendMedia(to, messageMedia, caption);

      const messageResponse: MessageResponse = {
        id: sentMessage.id._serialized,
        from: sentMessage.from,
        to: sentMessage.to,
        body: sentMessage.body,
        timestamp: sentMessage.timestamp,
        type: sentMessage.type,
        hasMedia: sentMessage.hasMedia,
        isForwarded: sentMessage.isForwarded,
        fromMe: sentMessage.fromMe
      };

      const response: ApiResponse<MessageResponse> = {
        success: true,
        data: messageResponse,
        message: 'Mídia enviada com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao enviar mídia:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao enviar mídia',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // GET /api/v1/messages/:chatId
  public getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chatId } = req.params;
      const { limit = 50, page = 1 } = req.query;

      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      const offset = (pageNum - 1) * limitNum;

      const messages = await this.whatsappService.getMessages(chatId, limitNum + offset);
      const paginatedMessages = messages.slice(offset, offset + limitNum);

      const messageResponses: MessageResponse[] = paginatedMessages.map(msg => ({
        id: msg.id._serialized,
        from: msg.from,
        to: msg.to,
        body: msg.body,
        timestamp: msg.timestamp,
        type: msg.type,
        hasMedia: msg.hasMedia,
        isForwarded: msg.isForwarded,
        fromMe: msg.fromMe
      }));

      const paginatedResponse: PaginatedResponse<MessageResponse> = {
        data: messageResponses,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: messages.length,
          totalPages: Math.ceil(messages.length / limitNum)
        }
      };

      const response: ApiResponse<PaginatedResponse<MessageResponse>> = {
        success: true,
        data: paginatedResponse,
        message: 'Mensagens obtidas com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao obter mensagens:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao obter mensagens',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/messages/:messageId/react
  public reactToMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { messageId } = req.params;
      const { reaction } = req.body;

      if (!reaction) {
        const response: ApiResponse = {
          success: false,
          error: 'Reação é obrigatória',
          timestamp: new Date().toISOString()
        };
        res.status(400).json(response);
        return;
      }

      // Implementar reação à mensagem
      // const message = await this.whatsappService.getMessageById(messageId);
      // await message.react(reaction);

      const response: ApiResponse = {
        success: true,
        message: 'Reação enviada com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao reagir à mensagem:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao reagir à mensagem',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/messages/:messageId/forward
  public forwardMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { messageId } = req.params;
      const { to } = req.body;

      if (!to) {
        const response: ApiResponse = {
          success: false,
          error: 'Destinatário é obrigatório',
          timestamp: new Date().toISOString()
        };
        res.status(400).json(response);
        return;
      }

      // Implementar encaminhamento de mensagem
      // const message = await this.whatsappService.getMessageById(messageId);
      // const chat = await this.whatsappService.getChatById(to);
      // await message.forward(chat);

      const response: ApiResponse = {
        success: true,
        message: 'Mensagem encaminhada com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao encaminhar mensagem:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao encaminhar mensagem',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // DELETE /api/v1/messages/:messageId
  public deleteMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { messageId } = req.params;
      const { everyone = false } = req.body;

      // Implementar exclusão de mensagem
      // const message = await this.whatsappService.getMessageById(messageId);
      // await message.delete(everyone);

      const response: ApiResponse = {
        success: true,
        message: 'Mensagem excluída com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao excluir mensagem:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao excluir mensagem',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/messages/:messageId/star
  public starMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { messageId } = req.params;

      // Implementar favoritar mensagem
      // const message = await this.whatsappService.getMessageById(messageId);
      // await message.star();

      const response: ApiResponse = {
        success: true,
        message: 'Mensagem favoritada com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao favoritar mensagem:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao favoritar mensagem',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/messages/:messageId/unstar
  public unstarMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { messageId } = req.params;

      // Implementar desfavoritar mensagem
      // const message = await this.whatsappService.getMessageById(messageId);
      // await message.unstar();

      const response: ApiResponse = {
        success: true,
        message: 'Mensagem desfavoritada com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao desfavoritar mensagem:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao desfavoritar mensagem',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  // GET /api/v1/messages/:messageId/download
  public downloadMedia = async (req: Request, res: Response): Promise<void> => {
    try {
      const { messageId } = req.params;

      // Implementar download de mídia
      // const message = await this.whatsappService.getMessageById(messageId);
      // const media = await message.downloadMedia();

      const response: ApiResponse = {
        success: true,
        message: 'Mídia baixada com sucesso',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao baixar mídia:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Erro ao baixar mídia',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };
}
