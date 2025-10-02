import { Router } from "express";
import Joi from "joi";
import { MessageController } from "@/controllers/MessageController";
import { authenticateApiKey } from "@/middleware/auth";
import { validate, commonSchemas } from "@/middleware/validation";
import { whatsappService } from "./whatsapp";
import multer from "multer";
import config from "@/config";

const router = Router();
const messageController = new MessageController(whatsappService);

// Configuração do multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.media.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    if (config.media.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo não permitido"));
    }
  },
});

/**
 * @swagger
 * /messages/send:
 *   post:
 *     summary: Enviar mensagem
 *     tags: [Messages]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 pattern: '^[0-9]+@c\.us$'
 *                 description: Destinatário da mensagem
 *                 example: '5511999999999@c.us'
 *               message:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 4096
 *                 description: Conteúdo da mensagem
 *                 example: 'Olá, como você está?'
 *               type:
 *                 type: string
 *                 enum: [image, video, audio, document, sticker]
 *                 description: Tipo de mídia (opcional)
 *                 example: 'image'
 *               media:
 *                 type: object
 *                 description: Dados da mídia (opcional)
 *                 properties:
 *                   data:
 *                     type: string
 *                     description: Dados da mídia em base64
 *                   filename:
 *                     type: string
 *                     description: Nome do arquivo
 *                   mimetype:
 *                     type: string
 *                     description: Tipo MIME do arquivo
 *             required:
 *               - to
 *               - message
 *     responses:
 *       200:
 *         description: Mensagem enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/send",
  authenticateApiKey,
  validate({
    body: Joi.object({
      to: commonSchemas.phoneNumber,
      message: commonSchemas.message,
      type: Joi.string()
        .valid("image", "video", "audio", "document", "sticker")
        .optional(),
      media: Joi.object({
        data: Joi.string().required(),
        filename: Joi.string().optional(),
        mimetype: Joi.string().optional(),
      }).optional(),
    }),
  }),
  messageController.sendMessage
);

/**
 * @swagger
 * /messages/send-media:
 *   post:
 *     summary: Enviar mídia
 *     tags: [Messages]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 pattern: '^[0-9]+@c\.us$'
 *                 description: Destinatário da mensagem
 *                 example: '5511999999999@c.us'
 *               caption:
 *                 type: string
 *                 description: Legenda da mídia
 *                 maxLength: 1024
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de mídia
 *             required:
 *               - to
 *               - file
 *     responses:
 *       200:
 *         description: Mídia enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/send-media",
  authenticateApiKey,
  upload.single("file"),
  validate({
    body: Joi.object({
      to: commonSchemas.phoneNumber,
      caption: commonSchemas.message.optional(),
    }),
  }),
  messageController.sendMedia
);

/**
 * @swagger
 * /messages/{chatId}:
 *   get:
 *     summary: Obter mensagens de um chat
 *     tags: [Messages]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ChatId'
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Número de mensagens por página
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *     responses:
 *       200:
 *         description: Mensagens obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/PaginatedResponse'
 *                         - type: object
 *                           properties:
 *                             data:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/:chatId",
  authenticateApiKey,
  validate({
    params: Joi.object({
      chatId: commonSchemas.chatId,
    }),
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(50),
    }),
  }),
  messageController.getMessages
);

/**
 * @swagger
 * /messages/{messageId}/react:
 *   post:
 *     summary: Reagir a uma mensagem
 *     tags: [Messages]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MessageId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reaction:
 *                 type: string
 *                 maxLength: 1
 *                 description: Emoji da reação
 *                 example: "👍"
 *             required:
 *               - reaction
 *     responses:
 *       200:
 *         description: Reação enviada com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:messageId/react",
  authenticateApiKey,
  validate({
    params: Joi.object({
      messageId: commonSchemas.messageId,
    }),
    body: Joi.object({
      reaction: commonSchemas.reaction,
    }),
  }),
  messageController.reactToMessage
);

/**
 * @swagger
 * /messages/{messageId}/forward:
 *   post:
 *     summary: Encaminhar mensagem
 *     tags: [Messages]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MessageId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 pattern: '^[0-9]+@[cg]\.us$'
 *                 description: Destinatário da mensagem
 *                 example: '5511999999999@c.us'
 *             required:
 *               - to
 *     responses:
 *       200:
 *         description: Mensagem encaminhada com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:messageId/forward",
  authenticateApiKey,
  validate({
    params: Joi.object({
      messageId: commonSchemas.messageId,
    }),
    body: Joi.object({
      to: commonSchemas.chatId,
    }),
  }),
  messageController.forwardMessage
);

/**
 * @swagger
 * /messages/{messageId}:
 *   delete:
 *     summary: Excluir mensagem
 *     tags: [Messages]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MessageId'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               everyone:
 *                 type: boolean
 *                 default: false
 *                 description: Excluir para todos os participantes
 *     responses:
 *       200:
 *         description: Mensagem excluída com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete(
  "/:messageId",
  authenticateApiKey,
  validate({
    params: Joi.object({
      messageId: commonSchemas.messageId,
    }),
  }),
  messageController.deleteMessage
);

/**
 * @swagger
 * /messages/{messageId}/star:
 *   post:
 *     summary: Favoritar mensagem
 *     tags: [Messages]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MessageId'
 *     responses:
 *       200:
 *         description: Mensagem favoritada com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:messageId/star",
  authenticateApiKey,
  validate({
    params: Joi.object({
      messageId: commonSchemas.messageId,
    }),
  }),
  messageController.starMessage
);

/**
 * @swagger
 * /messages/{messageId}/unstar:
 *   post:
 *     summary: Desfavoritar mensagem
 *     tags: [Messages]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MessageId'
 *     responses:
 *       200:
 *         description: Mensagem desfavoritada com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:messageId/unstar",
  authenticateApiKey,
  validate({
    params: Joi.object({
      messageId: commonSchemas.messageId,
    }),
  }),
  messageController.unstarMessage
);

/**
 * @swagger
 * /messages/{messageId}/download:
 *   get:
 *     summary: Baixar mídia de uma mensagem
 *     tags: [Messages]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MessageId'
 *     responses:
 *       200:
 *         description: Mídia baixada com sucesso
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/:messageId/download",
  authenticateApiKey,
  validate({
    params: Joi.object({
      messageId: commonSchemas.messageId,
    }),
  }),
  messageController.downloadMedia
);

export default router;
