import { Router } from "express";
import Joi from "joi";
import { WhatsAppController } from "@/controllers/WhatsAppController";
import { authenticateApiKey } from "@/middleware/auth";
import { validate, commonSchemas } from "@/middleware/validation";
import { WhatsAppService } from "@/services/WhatsAppService";
import config from "@/config";

const router = Router();
const whatsappService = new WhatsAppService(config.whatsapp);
const whatsappController = new WhatsAppController(whatsappService);

/**
 * @swagger
 * /whatsapp/status:
 *   get:
 *     summary: Obter status da sessão WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Status obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SessionStatus'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/status", authenticateApiKey, whatsappController.getStatus);

/**
 * @swagger
 * /whatsapp/qr:
 *   get:
 *     summary: Obter código QR para autenticação
 *     tags: [WhatsApp]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: QR Code obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         qrCode:
 *                           type: string
 *                           description: Código QR em formato string
 *       404:
 *         description: QR Code não disponível
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/qr", authenticateApiKey, whatsappController.getQRCode);

/**
 * @swagger
 * /whatsapp/initialize:
 *   post:
 *     summary: Inicializar cliente WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: WhatsApp inicializado com sucesso
 *         $ref: '#/components/responses/Success'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/initialize", authenticateApiKey, whatsappController.initialize);

/**
 * @swagger
 * /whatsapp/restart:
 *   post:
 *     summary: Reiniciar cliente WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: WhatsApp reiniciado com sucesso
 *         $ref: '#/components/responses/Success'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/restart", authenticateApiKey, whatsappController.restart);

/**
 * @swagger
 * /whatsapp/logout:
 *   post:
 *     summary: Fazer logout do WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         $ref: '#/components/responses/Success'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/logout", authenticateApiKey, whatsappController.logout);

/**
 * @swagger
 * /whatsapp/info:
 *   get:
 *     summary: Obter informações do cliente WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Informações obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: Informações do cliente WhatsApp
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/info", authenticateApiKey, whatsappController.getClientInfo);

/**
 * @swagger
 * /whatsapp/stats:
 *   get:
 *     summary: Obter estatísticas do WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/WhatsAppStats'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/stats", authenticateApiKey, whatsappController.getStats);

/**
 * @swagger
 * /whatsapp/status-message:
 *   post:
 *     summary: Alterar status do WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 maxLength: 139
 *                 description: Novo status do WhatsApp
 *                 example: "Disponível para atendimento"
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Status alterado com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/status-message",
  authenticateApiKey,
  validate({
    body: Joi.object({
      status: commonSchemas.status,
    }),
  }),
  whatsappController.setStatusMessage
);

/**
 * @swagger
 * /whatsapp/events:
 *   get:
 *     summary: Conectar aos eventos do WhatsApp (Server-Sent Events)
 *     tags: [WhatsApp]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Conexão estabelecida com sucesso
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               description: Stream de eventos do WhatsApp
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/events", authenticateApiKey, whatsappController.getEvents);

export { whatsappService };
export default router;
