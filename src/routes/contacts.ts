import { Router } from "express";
import Joi from "joi";
import { ContactController } from "@/controllers/ContactController";
import { authenticateApiKey } from "@/middleware/auth";
import { validate, commonSchemas } from "@/middleware/validation";
import { whatsappService } from "./whatsapp";
import config from "@/config";

const router = Router();
const contactController = new ContactController(whatsappService);

/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Obter lista de contatos
 *     tags: [Contacts]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Número de contatos por página
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Termo de busca
 *       - name: filter
 *         in: query
 *         schema:
 *           type: string
 *           enum: [all, blocked, business, groups, individuals]
 *           default: all
 *         description: Filtro de contatos
 *     responses:
 *       200:
 *         description: Contatos obtidos com sucesso
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
 *                                 $ref: '#/components/schemas/ContactResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/",
  authenticateApiKey,
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(50),
      search: Joi.string().min(1).max(100).optional(),
      filter: Joi.string()
        .valid("all", "blocked", "business", "groups", "individuals")
        .default("all"),
    }),
  }),
  contactController.getContacts
);

/**
 * @swagger
 * /contacts/{contactId}:
 *   get:
 *     summary: Obter contato específico
 *     tags: [Contacts]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ContactId'
 *     responses:
 *       200:
 *         description: Contato obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ContactResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/:contactId",
  authenticateApiKey,
  validate({
    params: Joi.object({
      contactId: commonSchemas.contactId,
    }),
  }),
  contactController.getContact
);

/**
 * @swagger
 * /contacts/{contactId}/profile-picture:
 *   get:
 *     summary: Obter foto de perfil do contato
 *     tags: [Contacts]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ContactId'
 *     responses:
 *       200:
 *         description: Foto de perfil obtida com sucesso
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
 *                         profilePicUrl:
 *                           type: string
 *                           description: URL da foto de perfil
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/:contactId/profile-picture",
  authenticateApiKey,
  validate({
    params: Joi.object({
      contactId: commonSchemas.contactId,
    }),
  }),
  contactController.getProfilePicture
);

/**
 * @swagger
 * /contacts/{contactId}/block:
 *   post:
 *     summary: Bloquear contato
 *     tags: [Contacts]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ContactId'
 *     responses:
 *       200:
 *         description: Contato bloqueado com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:contactId/block",
  authenticateApiKey,
  validate({
    params: Joi.object({
      contactId: commonSchemas.contactId,
    }),
  }),
  contactController.blockContact
);

/**
 * @swagger
 * /contacts/{contactId}/unblock:
 *   post:
 *     summary: Desbloquear contato
 *     tags: [Contacts]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ContactId'
 *     responses:
 *       200:
 *         description: Contato desbloqueado com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:contactId/unblock",
  authenticateApiKey,
  validate({
    params: Joi.object({
      contactId: commonSchemas.contactId,
    }),
  }),
  contactController.unblockContact
);

/**
 * @swagger
 * /contacts/{contactId}/chat:
 *   get:
 *     summary: Obter chat do contato
 *     tags: [Contacts]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ContactId'
 *     responses:
 *       200:
 *         description: Chat do contato obtido com sucesso
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
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         isGroup:
 *                           type: boolean
 *                         isReadOnly:
 *                           type: boolean
 *                         unreadCount:
 *                           type: integer
 *                         lastMessage:
 *                           type: object
 *                           nullable: true
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/:contactId/chat",
  authenticateApiKey,
  validate({
    params: Joi.object({
      contactId: commonSchemas.contactId,
    }),
  }),
  contactController.getContactChat
);

/**
 * @swagger
 * /contacts/{contactId}/chat/mark-read:
 *   post:
 *     summary: Marcar chat como lido
 *     tags: [Contacts]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ContactId'
 *     responses:
 *       200:
 *         description: Chat marcado como lido com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:contactId/chat/mark-read",
  authenticateApiKey,
  validate({
    params: Joi.object({
      contactId: commonSchemas.contactId,
    }),
  }),
  contactController.markChatAsRead
);

/**
 * @swagger
 * /contacts/{contactId}/chat/mute:
 *   post:
 *     summary: Silenciar chat
 *     tags: [Contacts]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ContactId'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 31536000
 *                 description: Duração do mute em segundos
 *     responses:
 *       200:
 *         description: Chat silenciado com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:contactId/chat/mute",
  authenticateApiKey,
  validate({
    params: Joi.object({
      contactId: commonSchemas.contactId,
    }),
    body: Joi.object({
      duration: commonSchemas.muteDuration,
    }),
  }),
  contactController.muteChat
);

/**
 * @swagger
 * /contacts/{contactId}/chat/unmute:
 *   post:
 *     summary: Desilenciar chat
 *     tags: [Contacts]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ContactId'
 *     responses:
 *       200:
 *         description: Chat desilenciado com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:contactId/chat/unmute",
  authenticateApiKey,
  validate({
    params: Joi.object({
      contactId: commonSchemas.contactId,
    }),
  }),
  contactController.unmuteChat
);

/**
 * @swagger
 * /contacts/{contactId}/chat/archive:
 *   post:
 *     summary: Arquivar chat
 *     tags: [Contacts]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ContactId'
 *     responses:
 *       200:
 *         description: Chat arquivado com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:contactId/chat/archive",
  authenticateApiKey,
  validate({
    params: Joi.object({
      contactId: commonSchemas.contactId,
    }),
  }),
  contactController.archiveChat
);

/**
 * @swagger
 * /contacts/{contactId}/chat/unarchive:
 *   post:
 *     summary: Desarquivar chat
 *     tags: [Contacts]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ContactId'
 *     responses:
 *       200:
 *         description: Chat desarquivado com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:contactId/chat/unarchive",
  authenticateApiKey,
  validate({
    params: Joi.object({
      contactId: commonSchemas.contactId,
    }),
  }),
  contactController.unarchiveChat
);

/**
 * @swagger
 * /contacts/{contactId}/chat/pin:
 *   post:
 *     summary: Fixar chat
 *     tags: [Contacts]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ContactId'
 *     responses:
 *       200:
 *         description: Chat fixado com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:contactId/chat/pin",
  authenticateApiKey,
  validate({
    params: Joi.object({
      contactId: commonSchemas.contactId,
    }),
  }),
  contactController.pinChat
);

/**
 * @swagger
 * /contacts/{contactId}/chat/unpin:
 *   post:
 *     summary: Desfixar chat
 *     tags: [Contacts]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ContactId'
 *     responses:
 *       200:
 *         description: Chat desfixado com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:contactId/chat/unpin",
  authenticateApiKey,
  validate({
    params: Joi.object({
      contactId: commonSchemas.contactId,
    }),
  }),
  contactController.unpinChat
);

/**
 * @swagger
 * /contacts/{contactId}/chat:
 *   delete:
 *     summary: Deletar chat
 *     tags: [Contacts]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ContactId'
 *     responses:
 *       200:
 *         description: Chat deletado com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete(
  "/:contactId/chat",
  authenticateApiKey,
  validate({
    params: Joi.object({
      contactId: commonSchemas.contactId,
    }),
  }),
  contactController.deleteChat
);

export default router;
