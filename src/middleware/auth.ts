import { Request, Response, NextFunction } from 'express';
import config from '@/config';
import { AuthenticationError } from '@/types';
import { logger } from '@/utils/logger';

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
  isAuthenticated?: boolean;
}

export const authenticateApiKey = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const apiKey = req.headers['x-api-key'] as string || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      logger.warn('Tentativa de acesso sem API key', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url
      });
      throw new AuthenticationError('API key é obrigatória');
    }

    if (apiKey !== config.auth.apiKey) {
      logger.warn('Tentativa de acesso com API key inválida', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        providedKey: apiKey.substring(0, 8) + '...'
      });
      throw new AuthenticationError('API key inválida');
    }

    req.apiKey = apiKey;
    req.isAuthenticated = true;
    
    logger.debug('Autenticação bem-sucedida', {
      ip: req.ip,
      url: req.url
    });
    
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } else {
      logger.error('Erro na autenticação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        timestamp: new Date().toISOString()
      });
    }
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const apiKey = req.headers['x-api-key'] as string || req.headers['authorization']?.replace('Bearer ', '');
    
    if (apiKey) {
      if (apiKey === config.auth.apiKey) {
        req.apiKey = apiKey;
        req.isAuthenticated = true;
      } else {
        req.isAuthenticated = false;
      }
    } else {
      req.isAuthenticated = false;
    }
    
    next();
  } catch (error) {
    logger.error('Erro na autenticação opcional:', error);
    req.isAuthenticated = false;
    next();
  }
};

export const validateApiKey = (apiKey: string): boolean => {
  return apiKey === config.auth.apiKey;
};

export const generateApiKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const logSecurityEvent = (event: string, req: Request, additionalData?: any): void => {
  logger.warn(`Security Event: ${event}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...additionalData
  });
};
