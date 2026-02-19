/**
 * Unit Tests for UpdatePrivacySettings Use Case
 *
 * Tests privacy settings management:
 * - Member not found error
 * - Full settings update
 * - Partial settings update (keeps existing values)
 * - No-change update
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

jest.mock('../../../src/infrastructure/database/prismaClient', () => ({
  __esModule: true,
  default: {
    member: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import prisma from '../../../src/infrastructure/database/prismaClient';
import { UpdatePrivacySettings } from '../../../src/application/useCases/updatePrivacySettings';

const mockPrisma = prisma as any;

describe('UpdatePrivacySettings Use Case', () => {
  let updatePrivacySettings: UpdatePrivacySettings;

  const defaultSettings = {
    showPhone: true,
    showEmail: true,
    showAddress: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    updatePrivacySettings = new UpdatePrivacySettings();

    // Default: member exists with all settings enabled
    mockPrisma.member.findUnique.mockResolvedValue({
      privacySettings: { ...defaultSettings },
    });

    mockPrisma.member.update.mockImplementation(async ({ where, data }: any) => ({
      id: where.id,
      privacySettings: data.privacySettings,
    }));
  });

  describe('successful updates', () => {
    it('should update all privacy settings at once', async () => {
      const result = await updatePrivacySettings.execute({
        memberId: 'member-1',
        showPhone: false,
        showEmail: false,
        showAddress: false,
      });

      expect(result.id).toBe('member-1');
      expect(result.privacySettings).toEqual({
        showPhone: false,
        showEmail: false,
        showAddress: false,
      });

      expect(mockPrisma.member.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'member-1' },
          data: {
            privacySettings: {
              showPhone: false,
              showEmail: false,
              showAddress: false,
            },
          },
        })
      );
    });

    it('should update only showPhone and keep others', async () => {
      const result = await updatePrivacySettings.execute({
        memberId: 'member-1',
        showPhone: false,
      });

      expect(result.privacySettings).toEqual({
        showPhone: false,
        showEmail: true,
        showAddress: true,
      });
    });

    it('should update only showEmail and keep others', async () => {
      const result = await updatePrivacySettings.execute({
        memberId: 'member-1',
        showEmail: false,
      });

      expect(result.privacySettings).toEqual({
        showPhone: true,
        showEmail: false,
        showAddress: true,
      });
    });

    it('should update only showAddress and keep others', async () => {
      const result = await updatePrivacySettings.execute({
        memberId: 'member-1',
        showAddress: false,
      });

      expect(result.privacySettings).toEqual({
        showPhone: true,
        showEmail: true,
        showAddress: false,
      });
    });

    it('should keep all settings when none are provided', async () => {
      const result = await updatePrivacySettings.execute({
        memberId: 'member-1',
      });

      expect(result.privacySettings).toEqual({
        showPhone: true,
        showEmail: true,
        showAddress: true,
      });
    });

    it('should merge with existing false settings correctly', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({
        privacySettings: {
          showPhone: false,
          showEmail: false,
          showAddress: false,
        },
      });

      const result = await updatePrivacySettings.execute({
        memberId: 'member-1',
        showEmail: true,
      });

      expect(result.privacySettings).toEqual({
        showPhone: false,
        showEmail: true,
        showAddress: false,
      });
    });
  });

  describe('validation errors', () => {
    it('should throw if member not found', async () => {
      mockPrisma.member.findUnique.mockResolvedValue(null);

      await expect(
        updatePrivacySettings.execute({
          memberId: 'nonexistent',
          showPhone: false,
        })
      ).rejects.toThrow('Member not found');

      expect(mockPrisma.member.update).not.toHaveBeenCalled();
    });
  });
});
