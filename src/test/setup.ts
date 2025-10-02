// Configuração global para testes
import { config } from "dotenv";

// Carrega variáveis de ambiente para testes
config({ path: ".env.test" });

// Configurações globais de teste
global.console = {
  ...console,
  // Silencia logs durante os testes
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Timeout padrão para testes
jest.setTimeout(30000);

// Mock do whatsapp-web.js para testes
jest.mock("whatsapp-web.js", () => ({
  Client: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    sendMessage: jest.fn().mockResolvedValue({
      id: { _serialized: "test-message-id" },
      from: "test-from",
      to: "test-to",
      body: "test message",
      timestamp: Date.now(),
      type: "text",
      hasMedia: false,
      isForwarded: false,
      fromMe: true,
    }),
    getContacts: jest.fn().mockResolvedValue([]),
    getChats: jest.fn().mockResolvedValue([]),
    getChatById: jest.fn().mockResolvedValue({
      id: { _serialized: "test-chat-id" },
      name: "Test Chat",
      isGroup: false,
      isReadOnly: false,
      unreadCount: 0,
      lastMessage: null,
      participants: [],
      sendSeen: jest.fn().mockResolvedValue(undefined),
      mute: jest.fn().mockResolvedValue(undefined),
      unmute: jest.fn().mockResolvedValue(undefined),
      archive: jest.fn().mockResolvedValue(undefined),
      unarchive: jest.fn().mockResolvedValue(undefined),
      pin: jest.fn().mockResolvedValue(undefined),
      unpin: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    }),
    createGroup: jest.fn().mockResolvedValue({
      id: { _serialized: "test-group-id" },
      name: "Test Group",
      description: "Test Description",
      participants: [],
      owner: "test-owner",
      timestamp: Date.now(),
    }),
    getGroupInviteLink: jest
      .fn()
      .mockResolvedValue("https://chat.whatsapp.com/test-invite"),
    joinGroup: jest.fn().mockResolvedValue({
      id: { _serialized: "test-group-id" },
      name: "Test Group",
      description: "Test Description",
      participants: [],
      owner: "test-owner",
      timestamp: Date.now(),
    }),
    getProfilePicture: jest
      .fn()
      .mockResolvedValue("https://example.com/profile.jpg"),
    setStatus: jest.fn().mockResolvedValue(undefined),
    blockContact: jest.fn().mockResolvedValue(undefined),
    unblockContact: jest.fn().mockResolvedValue(undefined),
    getMessages: jest.fn().mockResolvedValue([]),
    markAsRead: jest.fn().mockResolvedValue(undefined),
    muteChat: jest.fn().mockResolvedValue(undefined),
    unmuteChat: jest.fn().mockResolvedValue(undefined),
    archiveChat: jest.fn().mockResolvedValue(undefined),
    unarchiveChat: jest.fn().mockResolvedValue(undefined),
    deleteChat: jest.fn().mockResolvedValue(undefined),
    pinChat: jest.fn().mockResolvedValue(undefined),
    unpinChat: jest.fn().mockResolvedValue(undefined),
    getClientInfo: jest.fn().mockResolvedValue({
      wid: { user: "test-user" },
      pushname: "Test User",
    }),
    logout: jest.fn().mockResolvedValue(undefined),
    restart: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    removeListener: jest.fn(),
    info: {
      wid: { user: "test-user" },
      pushname: "Test User",
    },
  })),
  LocalAuth: jest.fn().mockImplementation(() => ({})),
  MessageMedia: jest.fn().mockImplementation(() => ({
    mimetype: "text/plain",
    data: "test-data",
    filename: "test.txt",
  })),
}));

// Mock do qrcode-terminal
jest.mock("qrcode-terminal", () => ({
  generate: jest.fn(),
}));

// Mock do multer
jest.mock("multer", () => {
  const multer = jest.fn(() => ({
    single: jest.fn(() => (req: any, res: any, next: any) => {
      req.file = {
        fieldname: "file",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("test-image-data"),
      };
      next();
    }),
  }));
  return multer;
});

// Mock do socket.io
jest.mock("socket.io", () => ({
  Server: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    close: jest.fn(),
  })),
}));

// Mock do winston
jest.mock("winston", () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    add: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    prettyPrint: jest.fn(),
    colorize: jest.fn(),
    printf: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

// Mock do fs
jest.mock("fs", () => ({
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

// Mock do path
jest.mock("path", () => ({
  dirname: jest.fn((p) => p.split("/").slice(0, -1).join("/")),
  join: jest.fn((...args) => args.join("/")),
  resolve: jest.fn((...args) => args.join("/")),
}));

// Mock do dotenv
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

// Mock do express
jest.mock("express", () => {
  const express = jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    listen: jest.fn(),
    set: jest.fn(),
    close: jest.fn(),
  }));
  (express as any).json = jest.fn();
  (express as any).urlencoded = jest.fn();
  (express as any).static = jest.fn();
  return express;
});

// Mock do cors
jest.mock("cors", () => jest.fn());

// Mock do helmet
jest.mock("helmet", () => jest.fn());

// Mock do morgan
jest.mock("morgan", () => jest.fn());

// Mock do compression
jest.mock("compression", () => jest.fn());

// Mock do express-rate-limit
jest.mock("express-rate-limit", () => jest.fn());

// Mock do swagger-ui-express
jest.mock("swagger-ui-express", () => ({
  serve: jest.fn(),
  setup: jest.fn(),
}));

// Mock do swagger-jsdoc
jest.mock("swagger-jsdoc", () => jest.fn(() => ({})));

// Mock do http
jest.mock("http", () => ({
  createServer: jest.fn(() => ({
    listen: jest.fn(),
    close: jest.fn(),
  })),
}));

// Configurações de teste
process.env.NODE_ENV = "test";
process.env.API_KEY = "test-api-key";
process.env.PORT = "3001";
process.env.LOG_LEVEL = "error";
