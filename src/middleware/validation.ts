import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '@/types';
import { logger } from '@/utils/logger';

export interface ValidationSchema {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  headers?: Joi.ObjectSchema;
}

export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: any[] = [];

    // Validação do body
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        errors.push({
          field: 'body',
          message: error.details[0].message,
          value: req.body
        });
      }
    }

    // Validação da query
    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        errors.push({
          field: 'query',
          message: error.details[0].message,
          value: req.query
        });
      }
    }

    // Validação dos parâmetros
    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        errors.push({
          field: 'params',
          message: error.details[0].message,
          value: req.params
        });
      }
    }

    // Validação dos headers
    if (schema.headers) {
      const { error } = schema.headers.validate(req.headers);
      if (error) {
        errors.push({
          field: 'headers',
          message: error.details[0].message,
          value: req.headers
        });
      }
    }

    if (errors.length > 0) {
      logger.warn('Erro de validação', {
        errors,
        url: req.url,
        method: req.method,
        ip: req.ip
      });

      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors,
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

// Schemas de validação comuns
export const commonSchemas = {
  // Validação de número de telefone WhatsApp
  phoneNumber: Joi.string()
    .pattern(/^[0-9]+@c\.us$/)
    .required()
    .messages({
      'string.pattern.base': 'Número de telefone deve estar no formato: 5511999999999@c.us'
    }),

  // Validação de ID de chat
  chatId: Joi.string()
    .pattern(/^[0-9]+@[cg]\.us$/)
    .required()
    .messages({
      'string.pattern.base': 'ID do chat deve estar no formato: 5511999999999@c.us ou 120363123456789012@g.us'
    }),

  // Validação de ID de grupo
  groupId: Joi.string()
    .pattern(/^[0-9]+@g\.us$/)
    .required()
    .messages({
      'string.pattern.base': 'ID do grupo deve estar no formato: 120363123456789012@g.us'
    }),

  // Validação de mensagem
  message: Joi.string()
    .min(1)
    .max(4096)
    .required()
    .messages({
      'string.min': 'Mensagem não pode estar vazia',
      'string.max': 'Mensagem não pode ter mais de 4096 caracteres'
    }),

  // Validação de nome de grupo
  groupName: Joi.string()
    .min(1)
    .max(25)
    .required()
    .messages({
      'string.min': 'Nome do grupo não pode estar vazio',
      'string.max': 'Nome do grupo não pode ter mais de 25 caracteres'
    }),

  // Validação de descrição de grupo
  groupDescription: Joi.string()
    .max(512)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Descrição do grupo não pode ter mais de 512 caracteres'
    }),

  // Validação de participantes
  participants: Joi.array()
    .items(Joi.string().pattern(/^[0-9]+@c\.us$/))
    .min(1)
    .max(256)
    .required()
    .messages({
      'array.min': 'Deve ter pelo menos 1 participante',
      'array.max': 'Não pode ter mais de 256 participantes',
      'string.pattern.base': 'Participante deve estar no formato: 5511999999999@c.us'
    }),

  // Validação de paginação
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).optional()
  }),

  // Validação de tipo de mídia
  mediaType: Joi.string()
    .valid('image', 'video', 'audio', 'document', 'sticker')
    .required()
    .messages({
      'any.only': 'Tipo de mídia deve ser: image, video, audio, document ou sticker'
    }),

  // Validação de arquivo
  file: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().max(10485760).required(), // 10MB
    buffer: Joi.binary().required()
  }),

  // Validação de status
  status: Joi.string()
    .max(139)
    .required()
    .messages({
      'string.max': 'Status não pode ter mais de 139 caracteres'
    }),

  // Validação de duração de mute
  muteDuration: Joi.number()
    .integer()
    .min(1)
    .max(31536000) // 1 ano em segundos
    .optional()
    .messages({
      'number.min': 'Duração do mute deve ser pelo menos 1 segundo',
      'number.max': 'Duração do mute não pode ser mais de 1 ano'
    }),

  // Validação de código de convite
  inviteCode: Joi.string()
    .pattern(/^[A-Za-z0-9_-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Código de convite deve conter apenas letras, números, hífens e underscores'
    }),

  // Validação de reação
  reaction: Joi.string()
    .max(1)
    .required()
    .messages({
      'string.max': 'Reação deve ser um único emoji'
    }),

  // Validação de ID de mensagem
  messageId: Joi.string()
    .pattern(/^[A-Za-z0-9_-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'ID da mensagem deve conter apenas letras, números, hífens e underscores'
    }),

  // Validação de ID de contato
  contactId: Joi.string()
    .pattern(/^[0-9]+@c\.us$/)
    .required()
    .messages({
      'string.pattern.base': 'ID do contato deve estar no formato: 5511999999999@c.us'
    }),

  // Validação de busca
  search: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Termo de busca não pode estar vazio',
      'string.max': 'Termo de busca não pode ter mais de 100 caracteres'
    }),

  // Validação de filtro
  filter: Joi.string()
    .valid('all', 'unread', 'read', 'archived', 'pinned', 'muted')
    .default('all')
    .messages({
      'any.only': 'Filtro deve ser: all, unread, read, archived, pinned ou muted'
    }),

  // Validação de ordenação
  sort: Joi.string()
    .valid('name', 'lastMessage', 'unreadCount', 'timestamp')
    .default('lastMessage')
    .messages({
      'any.only': 'Ordenação deve ser: name, lastMessage, unreadCount ou timestamp'
    }),

  // Validação de direção de ordenação
  order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Direção da ordenação deve ser: asc ou desc'
    })
};

// Função para validar número de telefone brasileiro
export const validateBrazilianPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return /^55[1-9][0-9]{8,9}$/.test(cleanPhone);
};

// Função para formatar número de telefone para WhatsApp
export const formatPhoneForWhatsApp = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('55')) {
    return cleanPhone + '@c.us';
  }
  return '55' + cleanPhone + '@c.us';
};

// Função para validar URL
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Função para validar email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Função para sanitizar string
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

// Função para validar tamanho de arquivo
export const validateFileSize = (size: number, maxSize: number = 10485760): boolean => {
  return size <= maxSize;
};

// Função para validar tipo de arquivo
export const validateFileType = (mimetype: string, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(mimetype);
};

export default validate;
