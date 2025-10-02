import { Request, Response } from "express";
import { WhatsAppService } from "@/services/WhatsAppService";
import {
  ApiResponse,
  GroupResponse,
  CreateGroupRequest,
  GroupActionRequest,
  PaginatedResponse,
} from "@/types";
import { logger } from "@/utils/logger";

export class GroupController {
  private whatsappService: WhatsAppService;

  constructor(whatsappService: WhatsAppService) {
    this.whatsappService = whatsappService;
  }

  // GET /api/v1/groups
  public getGroups = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 50, search } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const chats = await this.whatsappService.getChats();
      let groups = chats.filter((chat) => chat.isGroup);

      // Aplicar busca
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        groups = groups.filter(
          (group) =>
            group.name?.toLowerCase().includes(searchTerm) ||
            group.description?.toLowerCase().includes(searchTerm)
        );
      }

      // Paginação
      const total = groups.length;
      const paginatedGroups = groups.slice(offset, offset + limitNum);

      const groupResponses: GroupResponse[] = await Promise.all(
        paginatedGroups.map(async (group) => {
          const participants = group.participants.map((participant) => ({
            id: participant.id._serialized,
            name: participant.name || participant.pushname || "Sem nome",
            number: participant.number || "",
            isGroup: participant.isGroup,
            isBlocked: participant.isBlocked,
            isBusiness: participant.isBusiness,
          }));

          return {
            id: group.id._serialized,
            name: group.name,
            description: group.description,
            participants,
            owner: group.owner?._serialized || "",
            admins: group.participants
              .filter((p) => p.isAdmin)
              .map((p) => p.id._serialized),
            isReadOnly: group.isReadOnly,
            createdAt: group.timestamp,
          };
        })
      );

      const paginatedResponse: PaginatedResponse<GroupResponse> = {
        data: groupResponses,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      };

      const response: ApiResponse<PaginatedResponse<GroupResponse>> = {
        success: true,
        data: paginatedResponse,
        message: "Grupos obtidos com sucesso",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error("Erro ao obter grupos:", error);
      const response: ApiResponse = {
        success: false,
        error: "Erro ao obter grupos",
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  };

  // GET /api/v1/groups/:groupId
  public getGroup = async (req: Request, res: Response): Promise<void> => {
    try {
      const { groupId } = req.params;

      const chat = await this.whatsappService.getChatById(groupId);

      if (!chat.isGroup) {
        const response: ApiResponse = {
          success: false,
          error: "Chat não é um grupo",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      const participants = chat.participants.map((participant) => ({
        id: participant.id._serialized,
        name: participant.name || participant.pushname || "Sem nome",
        number: participant.number || "",
        isGroup: participant.isGroup,
        isBlocked: participant.isBlocked,
        isBusiness: participant.isBusiness,
      }));

      const groupResponse: GroupResponse = {
        id: chat.id._serialized,
        name: chat.name,
        description: chat.description,
        participants,
        owner: chat.owner,
        admins: chat.participants
          .filter((p) => p.isAdmin)
          .map((p) => p.id._serialized),
        isReadOnly: chat.isReadOnly,
        createdAt: chat.timestamp,
      };

      const response: ApiResponse<GroupResponse> = {
        success: true,
        data: groupResponse,
        message: "Grupo obtido com sucesso",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error("Erro ao obter grupo:", error);
      const response: ApiResponse = {
        success: false,
        error: "Erro ao obter grupo",
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/groups
  public createGroup = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, participants, description }: CreateGroupRequest = req.body;

      if (!name || !participants || participants.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: "Nome e participantes são obrigatórios",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      const group = await this.whatsappService.createGroup(name, participants);

      const groupResponse: GroupResponse = {
        id: group.id._serialized,
        name: group.name,
        description: group.description,
        participants: group.participants.map((participant) => ({
          id: participant.id._serialized,
          name:
            (participant as any).name ||
            (participant as any).pushname ||
            "Sem nome",
          number: (participant as any).number || "",
          isGroup: (participant as any).isGroup,
          isBlocked: (participant as any).isBlocked,
          isBusiness: (participant as any).isBusiness,
        })),
        owner: group.owner?._serialized || "",
        admins: group.participants
          .filter((p) => p.isAdmin)
          .map((p) => p.id._serialized),
        isReadOnly: group.isReadOnly,
        createdAt: group.timestamp,
      };

      const response: ApiResponse<GroupResponse> = {
        success: true,
        data: groupResponse,
        message: "Grupo criado com sucesso",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error("Erro ao criar grupo:", error);
      const response: ApiResponse = {
        success: false,
        error: "Erro ao criar grupo",
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/groups/:groupId/invite-link
  public getInviteLink = async (req: Request, res: Response): Promise<void> => {
    try {
      const { groupId } = req.params;

      const inviteLink = await this.whatsappService.getGroupInviteLink(groupId);

      const response: ApiResponse<{ inviteLink: string }> = {
        success: true,
        data: { inviteLink },
        message: "Link de convite gerado com sucesso",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error("Erro ao obter link de convite:", error);
      const response: ApiResponse = {
        success: false,
        error: "Erro ao obter link de convite",
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/groups/join
  public joinGroup = async (req: Request, res: Response): Promise<void> => {
    try {
      const { inviteCode } = req.body;

      if (!inviteCode) {
        const response: ApiResponse = {
          success: false,
          error: "Código de convite é obrigatório",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      const group = await this.whatsappService.joinGroup(inviteCode);

      const groupResponse: GroupResponse = {
        id: group.id._serialized,
        name: group.name,
        description: group.description,
        participants: group.participants.map((participant) => ({
          id: participant.id._serialized,
          name:
            (participant as any).name ||
            (participant as any).pushname ||
            "Sem nome",
          number: (participant as any).number || "",
          isGroup: (participant as any).isGroup,
          isBlocked: (participant as any).isBlocked,
          isBusiness: (participant as any).isBusiness,
        })),
        owner: group.owner?._serialized || "",
        admins: group.participants
          .filter((p) => p.isAdmin)
          .map((p) => p.id._serialized),
        isReadOnly: group.isReadOnly,
        createdAt: group.timestamp,
      };

      const response: ApiResponse<GroupResponse> = {
        success: true,
        data: groupResponse,
        message: "Entrou no grupo com sucesso",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error("Erro ao entrar no grupo:", error);
      const response: ApiResponse = {
        success: false,
        error: "Erro ao entrar no grupo",
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/groups/:groupId/participants/add
  public addParticipants = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { groupId } = req.params;
      const { participants }: GroupActionRequest = req.body;

      if (!participants || participants.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: "Participantes são obrigatórios",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      const chat = await this.whatsappService.getChatById(groupId);

      if (!chat.isGroup) {
        const response: ApiResponse = {
          success: false,
          error: "Chat não é um grupo",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      await chat.addParticipants(participants);

      const response: ApiResponse = {
        success: true,
        message: "Participantes adicionados com sucesso",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error("Erro ao adicionar participantes:", error);
      const response: ApiResponse = {
        success: false,
        error: "Erro ao adicionar participantes",
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/groups/:groupId/participants/remove
  public removeParticipants = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { groupId } = req.params;
      const { participants }: GroupActionRequest = req.body;

      if (!participants || participants.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: "Participantes são obrigatórios",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      const chat = await this.whatsappService.getChatById(groupId);

      if (!chat.isGroup) {
        const response: ApiResponse = {
          success: false,
          error: "Chat não é um grupo",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      await chat.removeParticipants(participants);

      const response: ApiResponse = {
        success: true,
        message: "Participantes removidos com sucesso",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error("Erro ao remover participantes:", error);
      const response: ApiResponse = {
        success: false,
        error: "Erro ao remover participantes",
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/groups/:groupId/participants/promote
  public promoteParticipants = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { groupId } = req.params;
      const { participants }: GroupActionRequest = req.body;

      if (!participants || participants.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: "Participantes são obrigatórios",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      const chat = await this.whatsappService.getChatById(groupId);

      if (!chat.isGroup) {
        const response: ApiResponse = {
          success: false,
          error: "Chat não é um grupo",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      await chat.promoteParticipants(participants);

      const response: ApiResponse = {
        success: true,
        message: "Participantes promovidos a administradores com sucesso",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error("Erro ao promover participantes:", error);
      const response: ApiResponse = {
        success: false,
        error: "Erro ao promover participantes",
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/groups/:groupId/participants/demote
  public demoteParticipants = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { groupId } = req.params;
      const { participants }: GroupActionRequest = req.body;

      if (!participants || participants.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: "Participantes são obrigatórios",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      const chat = await this.whatsappService.getChatById(groupId);

      if (!chat.isGroup) {
        const response: ApiResponse = {
          success: false,
          error: "Chat não é um grupo",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      await chat.demoteParticipants(participants);

      const response: ApiResponse = {
        success: true,
        message: "Participantes rebaixados de administradores com sucesso",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error("Erro ao rebaixar participantes:", error);
      const response: ApiResponse = {
        success: false,
        error: "Erro ao rebaixar participantes",
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/groups/:groupId/leave
  public leaveGroup = async (req: Request, res: Response): Promise<void> => {
    try {
      const { groupId } = req.params;

      const chat = await this.whatsappService.getChatById(groupId);

      if (!chat.isGroup) {
        const response: ApiResponse = {
          success: false,
          error: "Chat não é um grupo",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      await chat.leave();

      const response: ApiResponse = {
        success: true,
        message: "Saiu do grupo com sucesso",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error("Erro ao sair do grupo:", error);
      const response: ApiResponse = {
        success: false,
        error: "Erro ao sair do grupo",
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  };

  // PUT /api/v1/groups/:groupId/name
  public updateGroupName = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { groupId } = req.params;
      const { name } = req.body;

      if (!name) {
        const response: ApiResponse = {
          success: false,
          error: "Nome é obrigatório",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      const chat = await this.whatsappService.getChatById(groupId);

      if (!chat.isGroup) {
        const response: ApiResponse = {
          success: false,
          error: "Chat não é um grupo",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      await chat.setSubject(name);

      const response: ApiResponse = {
        success: true,
        message: "Nome do grupo atualizado com sucesso",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error("Erro ao atualizar nome do grupo:", error);
      const response: ApiResponse = {
        success: false,
        error: "Erro ao atualizar nome do grupo",
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  };

  // PUT /api/v1/groups/:groupId/description
  public updateGroupDescription = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { groupId } = req.params;
      const { description } = req.body;

      const chat = await this.whatsappService.getChatById(groupId);

      if (!chat.isGroup) {
        const response: ApiResponse = {
          success: false,
          error: "Chat não é um grupo",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      await chat.setDescription(description || "");

      const response: ApiResponse = {
        success: true,
        message: "Descrição do grupo atualizada com sucesso",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error("Erro ao atualizar descrição do grupo:", error);
      const response: ApiResponse = {
        success: false,
        error: "Erro ao atualizar descrição do grupo",
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/groups/:groupId/settings/messages-admins-only
  public setMessagesAdminsOnly = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { groupId } = req.params;
      const { adminsOnly = true } = req.body;

      const chat = await this.whatsappService.getChatById(groupId);

      if (!chat.isGroup) {
        const response: ApiResponse = {
          success: false,
          error: "Chat não é um grupo",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      await chat.setMessagesAdminsOnly(adminsOnly);

      const response: ApiResponse = {
        success: true,
        message: `Configuração de mensagens alterada para ${
          adminsOnly ? "apenas administradores" : "todos os participantes"
        }`,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error("Erro ao alterar configuração de mensagens:", error);
      const response: ApiResponse = {
        success: false,
        error: "Erro ao alterar configuração de mensagens",
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/groups/:groupId/settings/info-admins-only
  public setInfoAdminsOnly = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { groupId } = req.params;
      const { adminsOnly = true } = req.body;

      const chat = await this.whatsappService.getChatById(groupId);

      if (!chat.isGroup) {
        const response: ApiResponse = {
          success: false,
          error: "Chat não é um grupo",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      await chat.setInfoAdminsOnly(adminsOnly);

      const response: ApiResponse = {
        success: true,
        message: `Configuração de informações alterada para ${
          adminsOnly ? "apenas administradores" : "todos os participantes"
        }`,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error("Erro ao alterar configuração de informações:", error);
      const response: ApiResponse = {
        success: false,
        error: "Erro ao alterar configuração de informações",
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  };

  // POST /api/v1/groups/:groupId/settings/add-members-admins-only
  public setAddMembersAdminsOnly = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { groupId } = req.params;
      const { adminsOnly = true } = req.body;

      const chat = await this.whatsappService.getChatById(groupId);

      if (!chat.isGroup) {
        const response: ApiResponse = {
          success: false,
          error: "Chat não é um grupo",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      await chat.setAddMembersAdminsOnly(adminsOnly);

      const response: ApiResponse = {
        success: true,
        message: `Configuração de adicionar membros alterada para ${
          adminsOnly ? "apenas administradores" : "todos os participantes"
        }`,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      logger.error("Erro ao alterar configuração de adicionar membros:", error);
      const response: ApiResponse = {
        success: false,
        error: "Erro ao alterar configuração de adicionar membros",
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  };
}
