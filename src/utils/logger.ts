import winston from "winston";
import express from "express";
import * as fs from "fs";
import * as path from "path";
import config from "@/config";

// Cria diretório de logs se não existir
const logDir = config.log.file ? path.dirname(config.log.file) : "./logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configuração do formato de log
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Configuração do formato para console
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: "HH:mm:ss",
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Configuração dos transportes
const transports: winston.transport[] = [];

// Transporte para arquivo
if (config.log.file) {
  transports.push(
    new winston.transports.File({
      filename: config.log.file,
      level: config.log.level,
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    })
  );
}

// Transporte para console
if (config.log.console) {
  transports.push(
    new winston.transports.Console({
      level: config.log.level,
      format: consoleFormat,
    })
  );
}

// Cria o logger
export const logger = winston.createLogger({
  level: config.log.level,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Adiciona transporte para erros
if (config.log.file) {
  const errorLogFile = config.log.file.replace(".log", "-error.log");
  logger.add(
    new winston.transports.File({
      filename: errorLogFile,
      level: "error",
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    })
  );
}

// Função para log de requisições HTTP
export const logRequest: express.RequestHandler = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    };

    if (res.statusCode >= 400) {
      logger.warn("HTTP Request", logData);
    } else {
      logger.info("HTTP Request", logData);
    }
  });

  next();
};

// Função para log de WhatsApp
export const logWhatsApp = (event: string, data?: any) => {
  logger.info(`WhatsApp Event: ${event}`, data);
};

// Função para log de performance
export const logPerformance = (
  operation: string,
  duration: number,
  metadata?: any
) => {
  logger.info(`Performance: ${operation}`, {
    duration: `${duration}ms`,
    ...metadata,
  });
};

// Função para log de segurança
export const logSecurity = (event: string, data?: any) => {
  logger.warn(`Security Event: ${event}`, data);
};

// Função para log de debug
export const logDebug = (message: string, data?: any) => {
  logger.debug(message, data);
};

// Função para log de info
export const logInfo = (message: string, data?: any) => {
  logger.info(message, data);
};

// Função para log de warning
export const logWarning = (message: string, data?: any) => {
  logger.warn(message, data);
};

// Função para log de error
export const logError = (message: string, error?: Error, data?: any) => {
  logger.error(message, {
    error: error?.message,
    stack: error?.stack,
    ...data,
  });
};

// Stream para Morgan
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;
