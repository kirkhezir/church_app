/**
 * Unit Tests for SearchMembers Use Case
 *
 * Tests member search functionality:
 * - Empty/blank query returns empty array
 * - Name-based search
 * - Privacy controls
 * - Result limiting
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

jest.mock('../../../src/infrastructure/database/prismaClient', () => ({
  __esModule: true,
  default: {
    member: {
      findMany: jest.fn(),
    },
  },
}));

import prisma from '../../../src/infrastructure/database/prismaClient';
import { SearchMembers } from '../../../src/application/useCases/searchMembers';

const mockPrisma = prisma as any;

describe('SearchMembers Use Case', () => {
  let searchMembers: SearchMembers;

  const makeMember = (overrides: any = {}) => ({
    id: 'member-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@church.org',
    phone: '555-0100',
    address: '123 Main St',
    membershipDate: new Date('2023-01-15'),
    privacySettings: {
      showPhone: true,
      showEmail: true,
      showAddress: true,
    },
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    searchMembers = new SearchMembers();
    mockPrisma.member.findMany.mockResolvedValue([]);
  });

  describe('empty/blank queries', () => {
    it('should return empty data for empty string query', async () => {
      const result = await searchMembers.execute({
        requesterId: 'requester-1',
        query: '',
      });

      expect(result.data).toEqual([]);
      expect(mockPrisma.member.findMany).not.toHaveBeenCalled();
    });

    it('should return empty data for whitespace-only query', async () => {
      const result = await searchMembers.execute({
        requesterId: 'requester-1',
        query: '   ',
      });

      expect(result.data).toEqual([]);
      expect(mockPrisma.member.findMany).not.toHaveBeenCalled();
    });
  });

  describe('name-based search', () => {
    it('should search by first name and last name (case-insensitive)', async () => {
      const members = [makeMember()];
      mockPrisma.member.findMany.mockResolvedValue(members);

      await searchMembers.execute({
        requesterId: 'requester-1',
        query: 'john',
      });

      expect(mockPrisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            accountLocked: false,
            OR: [
              { firstName: { contains: 'john', mode: 'insensitive' } },
              { lastName: { contains: 'john', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should trim the search query', async () => {
      await searchMembers.execute({
        requesterId: 'requester-1',
        query: '  alice  ',
      });

      expect(mockPrisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { firstName: { contains: 'alice', mode: 'insensitive' } },
              { lastName: { contains: 'alice', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should return matched members', async () => {
      const members = [
        makeMember({ id: 'member-1', firstName: 'Jane', lastName: 'Smith' }),
        makeMember({ id: 'member-2', firstName: 'Janet', lastName: 'Johnson' }),
      ];
      mockPrisma.member.findMany.mockResolvedValue(members);

      const result = await searchMembers.execute({
        requesterId: 'requester-1',
        query: 'jan',
      });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].firstName).toBe('Jane');
      expect(result.data[1].firstName).toBe('Janet');
    });
  });

  describe('result limiting', () => {
    it('should use default limit of 20', async () => {
      await searchMembers.execute({
        requesterId: 'requester-1',
        query: 'test',
      });

      expect(mockPrisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 })
      );
    });

    it('should use custom limit when provided', async () => {
      await searchMembers.execute({
        requesterId: 'requester-1',
        query: 'test',
        limit: 5,
      });

      expect(mockPrisma.member.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 5 }));
    });
  });

  describe('privacy controls', () => {
    it('should show all contact info for own profile', async () => {
      const ownMember = makeMember({
        id: 'requester-1',
        privacySettings: {
          showPhone: false,
          showEmail: false,
          showAddress: false,
        },
      });
      mockPrisma.member.findMany.mockResolvedValue([ownMember]);

      const result = await searchMembers.execute({
        requesterId: 'requester-1',
        query: 'john',
      });

      expect(result.data[0].phone).toBe('555-0100');
      expect(result.data[0].email).toBe('john@church.org');
      expect(result.data[0].address).toBe('123 Main St');
    });

    it('should hide contact info when privacy settings are off for other members', async () => {
      const otherMember = makeMember({
        id: 'other-1',
        privacySettings: {
          showPhone: false,
          showEmail: false,
          showAddress: false,
        },
      });
      mockPrisma.member.findMany.mockResolvedValue([otherMember]);

      const result = await searchMembers.execute({
        requesterId: 'requester-1',
        query: 'john',
      });

      expect(result.data[0].phone).toBeNull();
      expect(result.data[0].email).toBeNull();
      expect(result.data[0].address).toBeNull();
    });

    it('should selectively show fields based on individual privacy settings', async () => {
      const member = makeMember({
        id: 'other-1',
        privacySettings: {
          showPhone: true,
          showEmail: false,
          showAddress: true,
        },
      });
      mockPrisma.member.findMany.mockResolvedValue([member]);

      const result = await searchMembers.execute({
        requesterId: 'requester-1',
        query: 'john',
      });

      expect(result.data[0].phone).toBe('555-0100');
      expect(result.data[0].email).toBeNull();
      expect(result.data[0].address).toBe('123 Main St');
    });
  });
});
