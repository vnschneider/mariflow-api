// import { Message, Contact, GroupChat, MessageMedia } from 'whatsapp-web.js';

// Tipos de resposta da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// Tipos para mensagens
export interface SendMessageRequest {
  to: string;
  message: string;
  type?: 'text' | 'image' | 'document' | 'audio' | 'video';
  media?: {
    data: string;
    filename?: string;
    mimetype?: string;
  };
}

export interface MessageResponse {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: number;
  type: string;
  hasMedia: boolean;
  isForwarded: boolean;
  fromMe: boolean;
}

// Tipos para contatos
export interface ContactResponse {
  id: string;
  name: string;
  number: string;
  isGroup: boolean;
  isBlocked: boolean;
  isBusiness: boolean;
  profilePicUrl?: string;
}

// Tipos para grupos
export interface GroupResponse {
  id: string;
  name: string;
  description?: string;
  participants: ContactResponse[];
  owner: string;
  admins: string[];
  isReadOnly: boolean;
  createdAt: number;
}

export interface CreateGroupRequest {
  name: string;
  participants: string[];
  description?: string;
}

export interface GroupActionRequest {
  participants: string[];
}

// Tipos para status da sessão
export interface SessionStatus {
  isReady: boolean;
  isAuthenticated: boolean;
  qrCode?: string;
  phoneNumber?: string;
  name?: string;
  lastSeen?: number;
}

// Tipos para configurações
export interface WhatsAppConfig {
  sessionPath: string;
  qrTimeout: number;
  authStrategy: 'local' | 'remote';
  puppeteerOptions?: any;
}

// Tipos para eventos
export interface WhatsAppEvent {
  type: string;
  data: any;
  timestamp: number;
}

// Tipos para upload de arquivos
export interface UploadResponse {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
}

// Tipos para validação
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Tipos para paginação
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para webhook
export interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
}

export interface WebhookEvent {
  event: string;
  data: any;
  timestamp: number;
  signature?: string;
}

// Tipos para estatísticas
export interface WhatsAppStats {
  totalMessages: number;
  totalContacts: number;
  totalGroups: number;
  uptime: number;
  lastActivity: number;
  memoryUsage: NodeJS.MemoryUsage;
}

// Tipos para configurações de mídia
export interface MediaConfig {
  maxFileSize: number;
  allowedTypes: string[];
  uploadPath: string;
}

// Tipos para autenticação
export interface AuthConfig {
  apiKey: string;
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

// Tipos para cache
export interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'memory' | 'redis';
}

// Tipos para logging
export interface LogConfig {
  level: string;
  file?: string;
  console: boolean;
  format: string;
}

// Tipos para Swagger
export interface SwaggerConfig {
  title: string;
  description: string;
  version: string;
  host: string;
  basePath: string;
  schemes: string[];
}

// Tipos para middleware
export interface MiddlewareConfig {
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  helmet: any;
  compression: any;
  rateLimit: any;
}

// Tipos para serviços
export interface ServiceConfig {
  whatsapp: WhatsAppConfig;
  auth: AuthConfig;
  cache: CacheConfig;
  log: LogConfig;
  swagger: SwaggerConfig;
  middleware: MiddlewareConfig;
  media: MediaConfig;
}

// Tipos para erros customizados
export class WhatsAppError extends Error {
  public code: string;
  public statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'WhatsAppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}
