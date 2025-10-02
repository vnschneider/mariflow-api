import { Router } from "express";
import Joi from "joi";
import { GroupController } from "@/controllers/GroupController";
import { authenticateApiKey } from "@/middleware/auth";
import { validate, commonSchemas } from "@/middleware/validation";
import { whatsappService } from "./whatsapp";

const router = Router();
const groupController = new GroupController(whatsappService);

/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Obter lista de grupos
 *     tags: [Groups]
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
 *         description: Número de grupos por página
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Termo de busca
 *     responses:
 *       200:
 *         description: Grupos obtidos com sucesso
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
 *                                 $ref: '#/components/schemas/GroupResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/",
  authenticateApiKey,
  validate({
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(50),
      search: Joi.string().min(1).max(100).optional(),
    },
  }),
  groupController.getGroups
);

/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Criar novo grupo
 *     tags: [Groups]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGroupRequest'
 *     responses:
 *       200:
 *         description: Grupo criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GroupResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/",
  authenticateApiKey,
  validate({
    body: {
      name: commonSchemas.groupName,
      participants: commonSchemas.participants,
      description: commonSchemas.groupDescription,
    },
  }),
  groupController.createGroup
);

/**
 * @swagger
 * /groups/join:
 *   post:
 *     summary: Entrar em grupo via código de convite
 *     tags: [Groups]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inviteCode:
 *                 type: string
 *                 description: Código de convite do grupo
 *                 example: "ABC123DEF456"
 *             required:
 *               - inviteCode
 *     responses:
 *       200:
 *         description: Entrou no grupo com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GroupResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/join",
  authenticateApiKey,
  validate({
    body: {
      inviteCode: commonSchemas.inviteCode,
    },
  }),
  groupController.joinGroup
);

/**
 * @swagger
 * /groups/{groupId}:
 *   get:
 *     summary: Obter grupo específico
 *     tags: [Groups]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GroupId'
 *     responses:
 *       200:
 *         description: Grupo obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GroupResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/:groupId",
  authenticateApiKey,
  validate({
    params: {
      groupId: commonSchemas.groupId,
    },
  }),
  groupController.getGroup
);

/**
 * @swagger
 * /groups/{groupId}/invite-link:
 *   post:
 *     summary: Gerar link de convite do grupo
 *     tags: [Groups]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GroupId'
 *     responses:
 *       200:
 *         description: Link de convite gerado com sucesso
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
 *                         inviteLink:
 *                           type: string
 *                           description: Link de convite do grupo
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:groupId/invite-link",
  authenticateApiKey,
  validate({
    params: {
      groupId: commonSchemas.groupId,
    },
  }),
  groupController.getInviteLink
);

/**
 * @swagger
 * /groups/{groupId}/participants/add:
 *   post:
 *     summary: Adicionar participantes ao grupo
 *     tags: [Groups]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GroupId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupActionRequest'
 *     responses:
 *       200:
 *         description: Participantes adicionados com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:groupId/participants/add",
  authenticateApiKey,
  validate({
    params: {
      groupId: commonSchemas.groupId,
    },
    body: {
      participants: commonSchemas.participants,
    },
  }),
  groupController.addParticipants
);

/**
 * @swagger
 * /groups/{groupId}/participants/remove:
 *   post:
 *     summary: Remover participantes do grupo
 *     tags: [Groups]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GroupId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupActionRequest'
 *     responses:
 *       200:
 *         description: Participantes removidos com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:groupId/participants/remove",
  authenticateApiKey,
  validate({
    params: {
      groupId: commonSchemas.groupId,
    },
    body: {
      participants: commonSchemas.participants,
    },
  }),
  groupController.removeParticipants
);

/**
 * @swagger
 * /groups/{groupId}/participants/promote:
 *   post:
 *     summary: Promover participantes a administradores
 *     tags: [Groups]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GroupId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupActionRequest'
 *     responses:
 *       200:
 *         description: Participantes promovidos com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:groupId/participants/promote",
  authenticateApiKey,
  validate({
    params: {
      groupId: commonSchemas.groupId,
    },
    body: {
      participants: commonSchemas.participants,
    },
  }),
  groupController.promoteParticipants
);

/**
 * @swagger
 * /groups/{groupId}/participants/demote:
 *   post:
 *     summary: Rebaixar administradores a participantes
 *     tags: [Groups]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GroupId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupActionRequest'
 *     responses:
 *       200:
 *         description: Participantes rebaixados com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:groupId/participants/demote",
  authenticateApiKey,
  validate({
    params: {
      groupId: commonSchemas.groupId,
    },
    body: {
      participants: commonSchemas.participants,
    },
  }),
  groupController.demoteParticipants
);

/**
 * @swagger
 * /groups/{groupId}/leave:
 *   post:
 *     summary: Sair do grupo
 *     tags: [Groups]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GroupId'
 *     responses:
 *       200:
 *         description: Saiu do grupo com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:groupId/leave",
  authenticateApiKey,
  validate({
    params: {
      groupId: commonSchemas.groupId,
    },
  }),
  groupController.leaveGroup
);

/**
 * @swagger
 * /groups/{groupId}/name:
 *   put:
 *     summary: Atualizar nome do grupo
 *     tags: [Groups]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GroupId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 25
 *                 minLength: 1
 *                 description: Novo nome do grupo
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Nome do grupo atualizado com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put(
  "/:groupId/name",
  authenticateApiKey,
  validate({
    params: {
      groupId: commonSchemas.groupId,
    },
    body: {
      name: commonSchemas.groupName,
    },
  }),
  groupController.updateGroupName
);

/**
 * @swagger
 * /groups/{groupId}/description:
 *   put:
 *     summary: Atualizar descrição do grupo
 *     tags: [Groups]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GroupId'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 maxLength: 512
 *                 description: Nova descrição do grupo
 *     responses:
 *       200:
 *         description: Descrição do grupo atualizada com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put(
  "/:groupId/description",
  authenticateApiKey,
  validate({
    params: {
      groupId: commonSchemas.groupId,
    },
    body: {
      description: commonSchemas.groupDescription,
    },
  }),
  groupController.updateGroupDescription
);

/**
 * @swagger
 * /groups/{groupId}/settings/messages-admins-only:
 *   post:
 *     summary: Configurar se apenas administradores podem enviar mensagens
 *     tags: [Groups]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GroupId'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminsOnly:
 *                 type: boolean
 *                 default: true
 *                 description: Se apenas administradores podem enviar mensagens
 *     responses:
 *       200:
 *         description: Configuração de mensagens alterada com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:groupId/settings/messages-admins-only",
  authenticateApiKey,
  validate({
    params: {
      groupId: commonSchemas.groupId,
    },
    body: {
      adminsOnly: Joi.boolean().optional(),
    },
  }),
  groupController.setMessagesAdminsOnly
);

/**
 * @swagger
 * /groups/{groupId}/settings/info-admins-only:
 *   post:
 *     summary: Configurar se apenas administradores podem alterar informações
 *     tags: [Groups]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GroupId'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminsOnly:
 *                 type: boolean
 *                 default: true
 *                 description: Se apenas administradores podem alterar informações
 *     responses:
 *       200:
 *         description: Configuração de informações alterada com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:groupId/settings/info-admins-only",
  authenticateApiKey,
  validate({
    params: {
      groupId: commonSchemas.groupId,
    },
    body: {
      adminsOnly: Joi.boolean().optional(),
    },
  }),
  groupController.setInfoAdminsOnly
);

/**
 * @swagger
 * /groups/{groupId}/settings/add-members-admins-only:
 *   post:
 *     summary: Configurar se apenas administradores podem adicionar membros
 *     tags: [Groups]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GroupId'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminsOnly:
 *                 type: boolean
 *                 default: true
 *                 description: Se apenas administradores podem adicionar membros
 *     responses:
 *       200:
 *         description: Configuração de adicionar membros alterada com sucesso
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/:groupId/settings/add-members-admins-only",
  authenticateApiKey,
  validate({
    params: {
      groupId: commonSchemas.groupId,
    },
    body: {
      adminsOnly: Joi.boolean().optional(),
    },
  }),
  groupController.setAddMembersAdminsOnly
);

export default router;
