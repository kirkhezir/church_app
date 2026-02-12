/**
 * Push Notification Service Unit Tests
 */

import { PushNotificationService } from '../../../../src/infrastructure/notifications/pushNotificationService';

// Mock web-push
jest.mock('web-push', () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn().mockResolvedValue({ statusCode: 201 }),
}));

// Mock Prisma
jest.mock('../../../../src/infrastructure/database/prismaClient', () => ({
  __esModule: true,
  default: {
    pushSubscription: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  },
}));

describe('PushNotificationService', () => {
  let service: PushNotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment
    process.env.VAPID_PUBLIC_KEY = '';
    process.env.VAPID_PRIVATE_KEY = '';
  });

  describe('constructor', () => {
    it('should be disabled when VAPID keys are not configured', () => {
      service = new PushNotificationService();
      expect(service.isEnabled()).toBe(false);
    });

    it('should be enabled when VAPID keys are configured', () => {
      process.env.VAPID_PUBLIC_KEY =
        'test-public-key-that-is-at-least-65-chars-long-for-validation';
      process.env.VAPID_PRIVATE_KEY = 'test-private-key-at-least-43-chars-long-for-validation';
      process.env.VAPID_SUBJECT = 'mailto:test@example.com';

      service = new PushNotificationService();
      expect(service.isEnabled()).toBe(true);
    });
  });

  describe('getPublicKey', () => {
    it('should return null when disabled', () => {
      service = new PushNotificationService();
      expect(service.getPublicKey()).toBeNull();
    });

    it('should return public key when enabled', () => {
      const publicKey = 'test-public-key-that-is-at-least-65-chars-long-for-validation';
      process.env.VAPID_PUBLIC_KEY = publicKey;
      process.env.VAPID_PRIVATE_KEY = 'test-private-key-at-least-43-chars-long-for-validation';
      process.env.VAPID_SUBJECT = 'mailto:test@example.com';

      service = new PushNotificationService();
      expect(service.getPublicKey()).toBe(publicKey);
    });
  });

  describe('saveSubscription', () => {
    it('should throw error when disabled', async () => {
      service = new PushNotificationService();

      await expect(
        service.saveSubscription('user-1', {
          endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
          keys: { p256dh: 'key1', auth: 'key2' },
        })
      ).rejects.toThrow('Push notifications are not enabled');
    });
  });

  describe('removeAllSubscriptions', () => {
    it('should throw error when disabled', async () => {
      service = new PushNotificationService();

      await expect(service.removeAllSubscriptions('user-1')).rejects.toThrow(
        'Push notifications are not enabled'
      );
    });
  });

  describe('sendToMember', () => {
    it('should return 0 when disabled', async () => {
      service = new PushNotificationService();

      const result = await service.sendToMember('user-1', {
        title: 'Test',
        body: 'Test body',
      });

      expect(result).toBe(0);
    });
  });
});
