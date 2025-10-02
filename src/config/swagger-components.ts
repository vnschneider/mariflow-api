export const swaggerComponents = {
  schemas: {
    ApiResponse: {
      type: "object",
      properties: {
        success: {
          type: "boolean",
          description: "Indica se a operação foi bem-sucedida",
        },
        message: {
          type: "string",
          description: "Mensagem de resposta",
        },
        timestamp: {
          type: "string",
          format: "date-time",
          description: "Timestamp da resposta",
        },
      },
      required: ["success", "timestamp"],
    },

    PaginatedResponse: {
      type: "object",
      properties: {
        page: {
          type: "integer",
          description: "Página atual",
        },
        limit: {
          type: "integer",
          description: "Itens por página",
        },
        total: {
          type: "integer",
          description: "Total de itens",
        },
        totalPages: {
          type: "integer",
          description: "Total de páginas",
        },
      },
      required: ["page", "limit", "total", "totalPages"],
    },

    MessageResponse: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "ID da mensagem",
        },
        from: {
          type: "string",
          description: "Remetente da mensagem",
        },
        to: {
          type: "string",
          description: "Destinatário da mensagem",
        },
        body: {
          type: "string",
          description: "Conteúdo da mensagem",
        },
        type: {
          type: "string",
          description: "Tipo da mensagem",
        },
        timestamp: {
          type: "integer",
          description: "Timestamp da mensagem",
        },
      },
      required: ["id", "from", "to", "body", "type", "timestamp"],
    },

    ContactResponse: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "ID do contato",
        },
        name: {
          type: "string",
          description: "Nome do contato",
        },
        number: {
          type: "string",
          description: "Número do contato",
        },
        isGroup: {
          type: "boolean",
          description: "Se é um grupo",
        },
        isBlocked: {
          type: "boolean",
          description: "Se está bloqueado",
        },
      },
      required: ["id", "name", "number", "isGroup"],
    },

    GroupResponse: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "ID do grupo",
        },
        name: {
          type: "string",
          description: "Nome do grupo",
        },
        description: {
          type: "string",
          description: "Descrição do grupo",
        },
        participants: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              isAdmin: { type: "boolean" },
            },
          },
        },
        isGroup: {
          type: "boolean",
          description: "Se é um grupo",
        },
      },
      required: ["id", "name", "isGroup"],
    },

    SessionStatus: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: [
            "disconnected",
            "connecting",
            "connected",
            "qr",
            "authenticated",
          ],
          description: "Status da sessão WhatsApp",
        },
        isReady: {
          type: "boolean",
          description: "Se o WhatsApp está pronto",
        },
        qrCode: {
          type: "string",
          description: "Código QR para autenticação",
        },
      },
      required: ["status", "isReady"],
    },

    WhatsAppStats: {
      type: "object",
      properties: {
        messagesSent: {
          type: "integer",
          description: "Mensagens enviadas",
        },
        messagesReceived: {
          type: "integer",
          description: "Mensagens recebidas",
        },
        contactsCount: {
          type: "integer",
          description: "Número de contatos",
        },
        groupsCount: {
          type: "integer",
          description: "Número de grupos",
        },
      },
      required: [
        "messagesSent",
        "messagesReceived",
        "contactsCount",
        "groupsCount",
      ],
    },
  },

  parameters: {
    ContactId: {
      name: "contactId",
      in: "path",
      required: true,
      schema: {
        type: "string",
        pattern: "^[0-9]+@c\\.us$",
      },
      description: "ID do contato no formato: 5511999999999@c.us",
    },

    GroupId: {
      name: "groupId",
      in: "path",
      required: true,
      schema: {
        type: "string",
        pattern: "^[0-9]+@g\\.us$",
      },
      description: "ID do grupo no formato: 120363123456789012@g.us",
    },

    ChatId: {
      name: "chatId",
      in: "path",
      required: true,
      schema: {
        type: "string",
        pattern: "^[0-9]+@[cg]\\.us$",
      },
      description:
        "ID do chat no formato: 5511999999999@c.us ou 120363123456789012@g.us",
    },

    MessageId: {
      name: "messageId",
      in: "path",
      required: true,
      schema: {
        type: "string",
        pattern: "^[A-Za-z0-9_-]+$",
      },
      description: "ID da mensagem",
    },
  },

  responses: {
    Success: {
      description: "Operação realizada com sucesso",
      content: {
        "application/json": {
          schema: {
            allOf: [
              { $ref: "#/components/schemas/ApiResponse" },
              {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Operação realizada com sucesso",
                  },
                },
              },
            ],
          },
        },
      },
    },

    BadRequest: {
      description: "Requisição inválida",
      content: {
        "application/json": {
          schema: {
            allOf: [
              { $ref: "#/components/schemas/ApiResponse" },
              {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  error: { type: "string", example: "Dados inválidos" },
                },
              },
            ],
          },
        },
      },
    },

    Unauthorized: {
      description: "Não autorizado",
      content: {
        "application/json": {
          schema: {
            allOf: [
              { $ref: "#/components/schemas/ApiResponse" },
              {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  error: { type: "string", example: "API Key inválida" },
                },
              },
            ],
          },
        },
      },
    },

    NotFound: {
      description: "Recurso não encontrado",
      content: {
        "application/json": {
          schema: {
            allOf: [
              { $ref: "#/components/schemas/ApiResponse" },
              {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  error: { type: "string", example: "Recurso não encontrado" },
                },
              },
            ],
          },
        },
      },
    },

    InternalServerError: {
      description: "Erro interno do servidor",
      content: {
        "application/json": {
          schema: {
            allOf: [
              { $ref: "#/components/schemas/ApiResponse" },
              {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  error: {
                    type: "string",
                    example: "Erro interno do servidor",
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
};
