import dotenv from "dotenv";
import { ServiceConfig } from "@/types";

// Carrega variáveis de ambiente
dotenv.config();

const config: ServiceConfig = {
  whatsapp: {
    sessionPath: process.env.WHATSAPP_SESSION_PATH || "./sessions",
    qrTimeout: parseInt(process.env.WHATSAPP_QR_TIMEOUT || "60000"),
    authStrategy:
      (process.env.WHATSAPP_AUTH_STRATEGY as "local" | "remote") || "local",
    puppeteerOptions: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
    },
  },

  auth: {
    apiKey: process.env.API_KEY || "your-secret-api-key-here",
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutos
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
    },
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL || "300000"), // 5 minutos
    maxSize: 1000,
    strategy: "memory",
  },

  log: {
    level: process.env.LOG_LEVEL || "info",
    file: process.env.LOG_FILE || "./logs/app.log",
    console: true,
    format: "combined",
  },

  swagger: {
    title: process.env.SWAGGER_TITLE || "MariFlow API",
    description:
      process.env.SWAGGER_DESCRIPTION ||
      "MariFlow - API REST para integração com WhatsApp. Desenvolvido por Vinícius Schneider (@vnschneider)",
    version: process.env.SWAGGER_VERSION || "1.0.0",
    host: process.env.SWAGGER_HOST || "localhost:3000",
    basePath: "/api/v1",
    schemes: ["http", "https"],
  },

  middleware: {
    cors: {
      origin: "*",
      credentials: false,
    },
    helmet: {
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    },
    compression: {
      level: 6,
      threshold: 1024,
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
      message: "Muitas requisições deste IP, tente novamente mais tarde.",
      standardHeaders: true,
      legacyHeaders: false,
    },
  },

  media: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/avi",
      "video/mov",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ],
    uploadPath: process.env.UPLOAD_PATH || "./uploads",
  },
};

export default config;
