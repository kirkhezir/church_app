import {
  UpdateProfile,
  UpdateProfileRequest,
} from '../../../src/application/useCases/updateProfile';
import { Role } from '../../../src/domain/valueObjects/Role';

describe('UpdateProfile Use Case', () => {
  let updateProfile: UpdateProfile;
  let mockMemberRepository: any;

  const mockMember = {
    id: 'member-123',
    email: 'john@example.com',
    passwordHash: 'hashed-password',
    firstName: 'John',
    lastName: 'Doe',
    role: Role.MEMBER,
    phone: '+66812345678',
    address: '123 Main St',
    membershipDate: new Date('2024-01-01'),
    privacySettings: {
      showPhone: true,
      showEmail: true,
      showAddress: false,
    },
    emailNotifications: true,
    accountLocked: false,
    failedLoginAttempts: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockMemberRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    updateProfile = new UpdateProfile(mockMemberRepository);
  });

  describe('execute', () => {
    it('should update first name successfully', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue({ ...mockMember });
      mockMemberRepository.update.mockResolvedValue({ ...mockMember, firstName: 'Jonathan' });

      const request: UpdateProfileRequest = {
        memberId: 'member-123',
        firstName: 'Jonathan',
      };

      // Act
      const result = await updateProfile.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.profile?.firstName).toBe('Jonathan');
    });

    it('should update last name successfully', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue({ ...mockMember });
      mockMemberRepository.update.mockResolvedValue({ ...mockMember, lastName: 'Smith' });

      const request: UpdateProfileRequest = {
        memberId: 'member-123',
        lastName: 'Smith',
      };

      // Act
      const result = await updateProfile.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.profile?.lastName).toBe('Smith');
    });

    it('should update phone with valid E.164 format', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue({ ...mockMember });
      mockMemberRepository.update.mockResolvedValue({ ...mockMember, phone: '+14155551234' });

      const request: UpdateProfileRequest = {
        memberId: 'member-123',
        phone: '+14155551234',
      };

      // Act
      const result = await updateProfile.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.profile?.phone).toBe('+14155551234');
    });

    it('should reject invalid phone format', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue({ ...mockMember });

      const request: UpdateProfileRequest = {
        memberId: 'member-123',
        phone: '555-1234', // Invalid format
      };

      // Act
      const result = await updateProfile.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid phone format');
    });

    it('should update address successfully', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue({ ...mockMember });
      mockMemberRepository.update.mockResolvedValue({
        ...mockMember,
        address: '456 New Address, City',
      });

      const request: UpdateProfileRequest = {
        memberId: 'member-123',
        address: '456 New Address, City',
      };

      // Act
      const result = await updateProfile.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.profile?.address).toBe('456 New Address, City');
    });

    it('should update privacy settings', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue({ ...mockMember });
      mockMemberRepository.update.mockResolvedValue({
        ...mockMember,
        privacySettings: { showPhone: false, showEmail: false, showAddress: true },
      });

      const request: UpdateProfileRequest = {
        memberId: 'member-123',
        privacySettings: {
          showPhone: false,
          showEmail: false,
          showAddress: true,
        },
      };

      // Act
      const result = await updateProfile.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.profile?.privacySettings).toEqual({
        showPhone: false,
        showEmail: false,
        showAddress: true,
      });
    });

    it('should return error when member not found', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue(null);

      const request: UpdateProfileRequest = {
        memberId: 'nonexistent-member',
        firstName: 'Test',
      };

      // Act
      const result = await updateProfile.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Member not found');
    });

    it('should reject first name shorter than 2 characters', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue({ ...mockMember });

      const request: UpdateProfileRequest = {
        memberId: 'member-123',
        firstName: 'A',
      };

      // Act
      const result = await updateProfile.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('First name must be at least 2 characters');
    });

    it('should reject last name shorter than 2 characters', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue({ ...mockMember });

      const request: UpdateProfileRequest = {
        memberId: 'member-123',
        lastName: 'B',
      };

      // Act
      const result = await updateProfile.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Last name must be at least 2 characters');
    });

    it('should allow clearing phone number', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue({ ...mockMember });
      mockMemberRepository.update.mockResolvedValue({
        ...mockMember,
        phone: undefined,
      });

      const request: UpdateProfileRequest = {
        memberId: 'member-123',
        phone: '', // Clear phone
      };

      // Act
      const result = await updateProfile.execute(request);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should update multiple fields at once', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue({ ...mockMember });
      mockMemberRepository.update.mockResolvedValue({
        ...mockMember,
        firstName: 'Jonathan',
        lastName: 'Smith',
        address: 'New Address',
      });

      const request: UpdateProfileRequest = {
        memberId: 'member-123',
        firstName: 'Jonathan',
        lastName: 'Smith',
        address: 'New Address',
      };

      // Act
      const result = await updateProfile.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.profile?.firstName).toBe('Jonathan');
      expect(result.profile?.lastName).toBe('Smith');
      expect(result.profile?.address).toBe('New Address');
    });
  });
});
