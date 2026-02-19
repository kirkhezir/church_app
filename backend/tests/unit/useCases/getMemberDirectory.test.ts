/**
 * Unit Tests for GetMemberDirectory Use Case
 *
 * Tests member directory listing:
 * - Pagination
 * - Search filtering
 * - Privacy controls (own profile vs others)
 * - Empty results
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

jest.mock('../../../src/infrastructure/database/prismaClient', () => ({
  __esModule: true,
  default: {
    member: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

import prisma from '../../../src/infrastructure/database/prismaClient';
import { GetMemberDirectory } from '../../../src/application/useCases/getMemberDirectory';

const mockPrisma = prisma as any;

describe('GetMemberDirectory Use Case', () => {
  let getMemberDirectory: GetMemberDirectory;

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
    getMemberDirectory = new GetMemberDirectory();

    // Defaults
    mockPrisma.member.count.mockResolvedValue(0);
    mockPrisma.member.findMany.mockResolvedValue([]);
  });

  describe('basic directory listing', () => {
    it('should return an empty directory when no members exist', async () => {
      const result = await getMemberDirectory.execute({
        requesterId: 'requester-1',
      });

      expect(result.data).toEqual([]);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('should return members with pagination metadata', async () => {
      const members = [
        makeMember({ id: 'member-1', firstName: 'Alice', lastName: 'Anderson' }),
        makeMember({ id: 'member-2', firstName: 'Bob', lastName: 'Brown' }),
      ];
      mockPrisma.member.count.mockResolvedValue(2);
      mockPrisma.member.findMany.mockResolvedValue(members);

      const result = await getMemberDirectory.execute({
        requesterId: 'requester-1',
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.totalItems).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should calculate pagination correctly for multiple pages', async () => {
      mockPrisma.member.count.mockResolvedValue(45);
      mockPrisma.member.findMany.mockResolvedValue([]);

      const result = await getMemberDirectory.execute({
        requesterId: 'requester-1',
        page: 2,
        limit: 10,
      });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.totalPages).toBe(5);
      expect(result.pagination.totalItems).toBe(45);

      // Verify skip/take passed to Prisma
      expect(mockPrisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });
  });

  describe('search filtering', () => {
    it('should pass search term to Prisma WHERE clause', async () => {
      mockPrisma.member.count.mockResolvedValue(0);
      mockPrisma.member.findMany.mockResolvedValue([]);

      await getMemberDirectory.execute({
        requesterId: 'requester-1',
        search: 'john',
      });

      expect(mockPrisma.member.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          OR: [
            { firstName: { contains: 'john', mode: 'insensitive' } },
            { lastName: { contains: 'john', mode: 'insensitive' } },
          ],
        }),
      });
    });

    it('should filter out deleted and locked members', async () => {
      await getMemberDirectory.execute({
        requesterId: 'requester-1',
      });

      expect(mockPrisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            accountLocked: false,
          }),
        })
      );
    });
  });

  describe('privacy controls', () => {
    it('should show all fields for own profile regardless of settings', async () => {
      const ownMember = makeMember({
        id: 'requester-1',
        privacySettings: {
          showPhone: false,
          showEmail: false,
          showAddress: false,
        },
      });
      mockPrisma.member.count.mockResolvedValue(1);
      mockPrisma.member.findMany.mockResolvedValue([ownMember]);

      const result = await getMemberDirectory.execute({
        requesterId: 'requester-1',
      });

      expect(result.data[0].phone).toBe('555-0100');
      expect(result.data[0].email).toBe('john@church.org');
      expect(result.data[0].address).toBe('123 Main St');
    });

    it('should hide phone when member has showPhone=false', async () => {
      const member = makeMember({
        id: 'other-1',
        privacySettings: {
          showPhone: false,
          showEmail: true,
          showAddress: true,
        },
      });
      mockPrisma.member.count.mockResolvedValue(1);
      mockPrisma.member.findMany.mockResolvedValue([member]);

      const result = await getMemberDirectory.execute({
        requesterId: 'requester-1',
      });

      expect(result.data[0].phone).toBeNull();
      expect(result.data[0].email).toBe('john@church.org');
      expect(result.data[0].address).toBe('123 Main St');
    });

    it('should hide email when member has showEmail=false', async () => {
      const member = makeMember({
        id: 'other-1',
        privacySettings: {
          showPhone: true,
          showEmail: false,
          showAddress: true,
        },
      });
      mockPrisma.member.count.mockResolvedValue(1);
      mockPrisma.member.findMany.mockResolvedValue([member]);

      const result = await getMemberDirectory.execute({
        requesterId: 'requester-1',
      });

      expect(result.data[0].email).toBeNull();
    });

    it('should hide address when member has showAddress=false', async () => {
      const member = makeMember({
        id: 'other-1',
        privacySettings: {
          showPhone: true,
          showEmail: true,
          showAddress: false,
        },
      });
      mockPrisma.member.count.mockResolvedValue(1);
      mockPrisma.member.findMany.mockResolvedValue([member]);

      const result = await getMemberDirectory.execute({
        requesterId: 'requester-1',
      });

      expect(result.data[0].address).toBeNull();
    });

    it('should hide all contact info when all privacy settings are off', async () => {
      const member = makeMember({
        id: 'other-1',
        privacySettings: {
          showPhone: false,
          showEmail: false,
          showAddress: false,
        },
      });
      mockPrisma.member.count.mockResolvedValue(1);
      mockPrisma.member.findMany.mockResolvedValue([member]);

      const result = await getMemberDirectory.execute({
        requesterId: 'requester-1',
      });

      expect(result.data[0].phone).toBeNull();
      expect(result.data[0].email).toBeNull();
      expect(result.data[0].address).toBeNull();
      // Name and membershipDate should still be visible
      expect(result.data[0].firstName).toBe('John');
      expect(result.data[0].lastName).toBe('Doe');
      expect(result.data[0].membershipDate).toEqual(new Date('2023-01-15'));
    });
  });
});
