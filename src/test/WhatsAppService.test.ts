import { WhatsAppService } from '@/services/WhatsAppService';
import config from '@/config';

describe('WhatsAppService', () => {
  let whatsappService: WhatsAppService;

  beforeEach(() => {
    whatsappService = new WhatsAppService(config.whatsapp);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create WhatsAppService instance', () => {
      expect(whatsappService).toBeInstanceOf(WhatsAppService);
    });
  });

  describe('initialize', () => {
    it('should initialize WhatsApp client', async () => {
      await expect(whatsappService.initialize()).resolves.toBeUndefined();
    });
  });

  describe('destroy', () => {
    it('should destroy WhatsApp client', async () => {
      await expect(whatsappService.destroy()).resolves.toBeUndefined();
    });
  });

  describe('getStatus', () => {
    it('should return status object', () => {
      const status = whatsappService.getStatus();
      
      expect(status).toHaveProperty('isReady');
      expect(status).toHaveProperty('isAuthenticated');
      expect(status).toHaveProperty('qrCode');
      expect(status).toHaveProperty('phoneNumber');
      expect(status).toHaveProperty('name');
      expect(status).toHaveProperty('lastSeen');
    });
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const to = '5511999999999@c.us';
      const content = 'Test message';

      const result = await whatsappService.sendMessage(to, content);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('from');
      expect(result).toHaveProperty('to');
      expect(result).toHaveProperty('body');
      expect(result.body).toBe(content);
    });
  });

  describe('getContacts', () => {
    it('should return contacts array', async () => {
      const contacts = await whatsappService.getContacts();
      expect(Array.isArray(contacts)).toBe(true);
    });
  });

  describe('getChats', () => {
    it('should return chats array', async () => {
      const chats = await whatsappService.getChats();
      expect(Array.isArray(chats)).toBe(true);
    });
  });

  describe('createGroup', () => {
    it('should create group successfully', async () => {
      const name = 'Test Group';
      const participants = ['5511999999999@c.us', '5511888888888@c.us'];

      const group = await whatsappService.createGroup(name, participants);

      expect(group).toHaveProperty('id');
      expect(group).toHaveProperty('name');
      expect(group.name).toBe(name);
    });
  });

  describe('getGroupInviteLink', () => {
    it('should get group invite link', async () => {
      const groupId = '120363123456789012@g.us';
      
      const inviteLink = await whatsappService.getGroupInviteLink(groupId);
      
      expect(typeof inviteLink).toBe('string');
      expect(inviteLink).toContain('https://chat.whatsapp.com/');
    });
  });

  describe('joinGroup', () => {
    it('should join group via invite code', async () => {
      const inviteCode = 'test-invite-code';
      
      const group = await whatsappService.joinGroup(inviteCode);
      
      expect(group).toHaveProperty('id');
      expect(group).toHaveProperty('name');
    });
  });

  describe('getProfilePicture', () => {
    it('should get profile picture URL', async () => {
      const contactId = '5511999999999@c.us';
      
      const profilePicUrl = await whatsappService.getProfilePicture(contactId);
      
      expect(typeof profilePicUrl).toBe('string');
      expect(profilePicUrl).toContain('https://');
    });
  });

  describe('setStatus', () => {
    it('should set status message', async () => {
      const status = 'Available for support';
      
      await expect(whatsappService.setStatus(status)).resolves.toBeUndefined();
    });
  });

  describe('blockContact', () => {
    it('should block contact', async () => {
      const contactId = '5511999999999@c.us';
      
      await expect(whatsappService.blockContact(contactId)).resolves.toBeUndefined();
    });
  });

  describe('unblockContact', () => {
    it('should unblock contact', async () => {
      const contactId = '5511999999999@c.us';
      
      await expect(whatsappService.unblockContact(contactId)).resolves.toBeUndefined();
    });
  });

  describe('getMessages', () => {
    it('should get messages from chat', async () => {
      const chatId = '5511999999999@c.us';
      const limit = 10;
      
      const messages = await whatsappService.getMessages(chatId, limit);
      
      expect(Array.isArray(messages)).toBe(true);
    });
  });

  describe('markAsRead', () => {
    it('should mark chat as read', async () => {
      const chatId = '5511999999999@c.us';
      
      await expect(whatsappService.markAsRead(chatId)).resolves.toBeUndefined();
    });
  });

  describe('muteChat', () => {
    it('should mute chat', async () => {
      const chatId = '5511999999999@c.us';
      const duration = 3600; // 1 hour
      
      await expect(whatsappService.muteChat(chatId, duration)).resolves.toBeUndefined();
    });
  });

  describe('unmuteChat', () => {
    it('should unmute chat', async () => {
      const chatId = '5511999999999@c.us';
      
      await expect(whatsappService.unmuteChat(chatId)).resolves.toBeUndefined();
    });
  });

  describe('archiveChat', () => {
    it('should archive chat', async () => {
      const chatId = '5511999999999@c.us';
      
      await expect(whatsappService.archiveChat(chatId)).resolves.toBeUndefined();
    });
  });

  describe('unarchiveChat', () => {
    it('should unarchive chat', async () => {
      const chatId = '5511999999999@c.us';
      
      await expect(whatsappService.unarchiveChat(chatId)).resolves.toBeUndefined();
    });
  });

  describe('deleteChat', () => {
    it('should delete chat', async () => {
      const chatId = '5511999999999@c.us';
      
      await expect(whatsappService.deleteChat(chatId)).resolves.toBeUndefined();
    });
  });

  describe('pinChat', () => {
    it('should pin chat', async () => {
      const chatId = '5511999999999@c.us';
      
      await expect(whatsappService.pinChat(chatId)).resolves.toBeUndefined();
    });
  });

  describe('unpinChat', () => {
    it('should unpin chat', async () => {
      const chatId = '5511999999999@c.us';
      
      await expect(whatsappService.unpinChat(chatId)).resolves.toBeUndefined();
    });
  });

  describe('getClientInfo', () => {
    it('should get client info', async () => {
      const info = await whatsappService.getClientInfo();
      
      expect(info).toHaveProperty('wid');
      expect(info).toHaveProperty('pushname');
    });
  });

  describe('logout', () => {
    it('should logout from WhatsApp', async () => {
      await expect(whatsappService.logout()).resolves.toBeUndefined();
    });
  });

  describe('restart', () => {
    it('should restart WhatsApp client', async () => {
      await expect(whatsappService.restart()).resolves.toBeUndefined();
    });
  });
});
