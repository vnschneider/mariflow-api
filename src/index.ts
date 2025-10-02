import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import config from "@/config";
import { logger, logRequest, morganStream } from "@/utils/logger";
import { whatsappService } from "@/routes/whatsapp";
import whatsappRoutes from "@/routes/whatsapp";
import messageRoutes from "@/routes/messages";
import contactRoutes from "@/routes/contacts";
import groupRoutes from "@/routes/groups";
import { swaggerSpec } from "@/config/swagger";

class App {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.middleware.cors.origin,
        methods: ["GET", "POST"],
      },
    });

    this.initializeMiddlewares();
    this.initializeSwagger();
    this.initializeRoutes();
    this.initializeWhatsApp();
    this.initializeSocketIO();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // CORS
    this.app.use(cors(config.middleware.cors));

    // Helmet para segurança
    this.app.use(helmet(config.middleware.helmet));

    // Compressão
    this.app.use(compression() as any);

    // Rate limiting
    this.app.use(rateLimit(config.middleware.rateLimit));

    // Logging
    this.app.use(morgan(config.log.format, { stream: morganStream }));
    this.app.use(logRequest);

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Trust proxy
    this.app.set("trust proxy", 1);
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get("/health", (req, res) => {
      res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || "1.0.0",
      });
    });

    // API routes
    this.app.use("/api/v1/whatsapp", whatsappRoutes);
    this.app.use("/api/v1/messages", messageRoutes);
    this.app.use("/api/v1/contacts", contactRoutes);
    this.app.use("/api/v1/groups", groupRoutes);

    // Root endpoint
    this.app.get("/", (req, res) => {
      res.json({
        message: "MariFlow API - WhatsApp Integration",
        version: "1.0.0",
        documentation: "/api-docs",
        health: "/health",
        timestamp: new Date().toISOString(),
      });
    });

    // Health check
    this.app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
      });
    });

    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        error: "Endpoint não encontrado",
        timestamp: new Date().toISOString(),
      });
    });
  }

  private initializeSwagger(): void {
    // Swagger UI
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "MariFlow API - Documentação",
      })
    );

    // Swagger JSON
    this.app.get("/api-docs.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });
  }

  private initializeWhatsApp(): void {
    // Event listeners para WhatsApp
    whatsappService.on("ready", () => {
      logger.info("WhatsApp está pronto!");
      this.io.emit("whatsapp:ready", {
        message: "WhatsApp está pronto",
        timestamp: new Date().toISOString(),
      });
    });

    whatsappService.on("qr", (qr) => {
      logger.info("QR Code gerado");
      this.io.emit("whatsapp:qr", {
        qrCode: qr,
        timestamp: new Date().toISOString(),
      });
    });

    whatsappService.on("authenticated", () => {
      logger.info("WhatsApp autenticado");
      this.io.emit("whatsapp:authenticated", {
        message: "WhatsApp autenticado com sucesso",
        timestamp: new Date().toISOString(),
      });
    });

    whatsappService.on("auth_failure", (msg) => {
      logger.error("Falha na autenticação WhatsApp:", msg);
      this.io.emit("whatsapp:auth_failure", {
        message: msg,
        timestamp: new Date().toISOString(),
      });
    });

    whatsappService.on("disconnected", (reason) => {
      logger.warn("WhatsApp desconectado:", reason);
      this.io.emit("whatsapp:disconnected", {
        reason,
        timestamp: new Date().toISOString(),
      });
    });

    whatsappService.on("message", (message) => {
      logger.debug("Mensagem recebida:", message.id._serialized);
      this.io.emit("whatsapp:message", {
        id: message.id._serialized,
        from: message.from,
        to: message.to,
        body: message.body,
        timestamp: message.timestamp,
        type: message.type,
        hasMedia: message.hasMedia,
        isForwarded: message.isForwarded,
        fromMe: message.fromMe,
      });
    });

    whatsappService.on("message_create", (message) => {
      logger.debug("Mensagem criada:", message.id._serialized);
      this.io.emit("whatsapp:message_create", {
        id: message.id._serialized,
        from: message.from,
        to: message.to,
        body: message.body,
        timestamp: message.timestamp,
        type: message.type,
        hasMedia: message.hasMedia,
        isForwarded: message.isForwarded,
        fromMe: message.fromMe,
      });
    });

    whatsappService.on("group_join", (notification) => {
      logger.info("Usuário entrou no grupo:", notification);
      this.io.emit("whatsapp:group_join", {
        notification,
        timestamp: new Date().toISOString(),
      });
    });

    whatsappService.on("group_leave", (notification) => {
      logger.info("Usuário saiu do grupo:", notification);
      this.io.emit("whatsapp:group_leave", {
        notification,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private initializeSocketIO(): void {
    this.io.on("connection", (socket) => {
      logger.info(`Cliente conectado: ${socket.id}`);

      // Enviar status atual do WhatsApp
      const status = whatsappService.getStatus();
      socket.emit("whatsapp:status", status);

      socket.on("disconnect", () => {
        logger.info(`Cliente desconectado: ${socket.id}`);
      });

      socket.on("whatsapp:get_status", () => {
        const status = whatsappService.getStatus();
        socket.emit("whatsapp:status", status);
      });
    });
  }

  private initializeErrorHandling(): void {
    // Error handling middleware
    this.app.use(
      (
        error: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        logger.error("Erro não tratado:", error);

        // Multer errors
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            error: "Arquivo muito grande. Tamanho máximo permitido: 10MB",
            timestamp: new Date().toISOString(),
          });
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            success: false,
            error: "Campo de arquivo inesperado",
            timestamp: new Date().toISOString(),
          });
        }

        // Default error
        res.status(500).json({
          success: false,
          error: "Erro interno do servidor",
          timestamp: new Date().toISOString(),
        });
      }
    );
  }

  public async start(): Promise<void> {
    try {
      const port = process.env.PORT || 3000;

      this.server.listen(port, () => {
        logger.info(`🚀 Servidor rodando na porta ${port}`);
        logger.info(
          `📚 Documentação disponível em: http://localhost:${port}/api-docs`
        );
        logger.info(
          `🏥 Health check disponível em: http://localhost:${port}/health`
        );
        logger.info(`🔌 Socket.IO disponível em: http://localhost:${port}`);
      });

      // Inicializar WhatsApp
      await whatsappService.initialize();
    } catch (error) {
      logger.error("Erro ao iniciar servidor:", error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      logger.info("Parando servidor...");

      // Parar WhatsApp
      await whatsappService.destroy();

      // Parar servidor
      this.server.close(() => {
        logger.info("Servidor parado com sucesso");
        process.exit(0);
      });
    } catch (error) {
      logger.error("Erro ao parar servidor:", error);
      process.exit(1);
    }
  }
}

// Criar e iniciar aplicação
const app = new App();

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Recebido SIGINT, iniciando shutdown graceful...");
  await app.stop();
});

process.on("SIGTERM", async () => {
  logger.info("Recebido SIGTERM, iniciando shutdown graceful...");
  await app.stop();
});

// Tratamento de erros não capturados
process.on("uncaughtException", (error) => {
  logger.error("Erro não capturado:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Promise rejeitada não tratada:", reason);
  process.exit(1);
});

// Iniciar aplicação
app.start().catch((error) => {
  logger.error("Erro ao iniciar aplicação:", error);
  process.exit(1);
});

export default app;
