/**
 * Unit Tests: AuthenticateUser Use Case
 *
 * Tests the authentication business logic:
 * - Credential validation
 * - JWT token generation
 * - Account lockout after failed attempts
 * - Failed login attempt tracking
 *
 * RED PHASE: These tests should FAIL until implementation is complete
 */

import { AuthenticateUser } from '../../../src/application/useCases/authenticateUser';
import { IMemberRepository } from '../../../src/domain/interfaces/IMemberRepository';
import { PasswordService } from '../../../src/infrastructure/auth/passwordService';
import { JWTService } from '../../../src/infrastructure/auth/jwtService';
import { Member } from '../../../src/domain/entities/Member';

// Mock repositories and services
const mockMemberRepository: jest.Mocked<IMemberRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
  findByRole: jest.fn(),
  search: jest.fn(),
};

const mockPasswordService = new PasswordService();
const mockJWTService = new JWTService();

// Spy on methods
jest.spyOn(mockPasswordService, 'verify');
jest.spyOn(mockJWTService, 'generateAccessToken');
jest.spyOn(mockJWTService, 'generateRefreshToken');

describe('AuthenticateUser Use Case', () => {
  let authenticateUser: AuthenticateUser;
  let testMember: Member;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Create use case instance
    authenticateUser = new AuthenticateUser(
      mockMemberRepository,
      mockPasswordService,
      mockJWTService
    );

    // Create test member
    const hashedPassword = await mockPasswordService.hash('TestPassword123!');
    testMember = new Member({
      id: 'test-member-id',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'MEMBER',
      membershipDate: new Date(),
      privacySettings: { showPhone: true, showEmail: true, showAddress: true },
      emailNotifications: true,
      accountLocked: false,
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  describe('Successful Authentication', () => {
    it('should return access and refresh tokens for valid credentials', async () => {
      // Arrange
      mockMemberRepository.findByEmail.mockResolvedValue(testMember);
      (mockPasswordService.verify as jest.Mock).mockResolvedValue(true);
      (mockJWTService.generateAccessToken as jest.Mock).mockReturnValue('access-token');
      (mockJWTService.generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      // Act
      const result = await authenticateUser.execute({
        email: 'test@example.com',
        password: 'TestPassword123!',
      });

      // Assert
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        member: expect.objectContaining({
          id: 'test-member-id',
          email: 'test@example.com',
          role: 'MEMBER',
        }),
      });
      expect(mockMemberRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockPasswordService.verify).toHaveBeenCalledWith(
        'TestPassword123!',
        testMember.passwordHash
      );
      expect(mockJWTService.generateAccessToken).toHaveBeenCalledWith({
        id: testMember.id,
        email: testMember.email,
        role: testMember.role,
      });
    });

    it('should reset failed login attempts on successful login', async () => {
      // Arrange
      testMember.failedLoginAttempts = 3;
      mockMemberRepository.findByEmail.mockResolvedValue(testMember);
      (mockPasswordService.verify as jest.Mock).mockResolvedValue(true);
      (mockJWTService.generateAccessToken as jest.Mock).mockReturnValue('access-token');
      (mockJWTService.generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      // Act
      await authenticateUser.execute({
        email: 'test@example.com',
        password: 'TestPassword123!',
      });

      // Assert
      expect(mockMemberRepository.update).toHaveBeenCalledWith(
        'test-member-id',
        expect.objectContaining({
          failedLoginAttempts: 0,
          lastLoginAt: expect.any(Date),
        })
      );
    });

    it('should update lastLoginAt timestamp on successful login', async () => {
      // Arrange
      mockMemberRepository.findByEmail.mockResolvedValue(testMember);
      (mockPasswordService.verify as jest.Mock).mockResolvedValue(true);
      (mockJWTService.generateAccessToken as jest.Mock).mockReturnValue('access-token');
      (mockJWTService.generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      const beforeLogin = new Date();

      // Act
      await authenticateUser.execute({
        email: 'test@example.com',
        password: 'TestPassword123!',
      });

      // Assert
      expect(mockMemberRepository.update).toHaveBeenCalledWith(
        'test-member-id',
        expect.objectContaining({
          lastLoginAt: expect.any(Date),
        })
      );

      const updateCall = (mockMemberRepository.update as jest.Mock).mock.calls[0][1];
      expect(updateCall.lastLoginAt.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
    });
  });

  describe('Failed Authentication', () => {
    it('should throw error for non-existent email', async () => {
      // Arrange
      mockMemberRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(
        authenticateUser.execute({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for incorrect password', async () => {
      // Arrange
      mockMemberRepository.findByEmail.mockResolvedValue(testMember);
      (mockPasswordService.verify as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        authenticateUser.execute({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should increment failed login attempts on incorrect password', async () => {
      // Arrange
      mockMemberRepository.findByEmail.mockResolvedValue(testMember);
      (mockPasswordService.verify as jest.Mock).mockResolvedValue(false);

      // Act
      try {
        await authenticateUser.execute({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        });
      } catch (error) {
        // Expected to fail
      }

      // Assert
      expect(mockMemberRepository.update).toHaveBeenCalledWith(
        'test-member-id',
        expect.objectContaining({
          failedLoginAttempts: 1,
        })
      );
    });

    it('should lock account after 5 failed login attempts', async () => {
      // Arrange
      testMember.failedLoginAttempts = 4; // Already has 4 failed attempts
      mockMemberRepository.findByEmail.mockResolvedValue(testMember);
      (mockPasswordService.verify as jest.Mock).mockResolvedValue(false);

      // Act
      try {
        await authenticateUser.execute({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        });
      } catch (error) {
        // Expected to fail
      }

      // Assert
      expect(mockMemberRepository.update).toHaveBeenCalledWith(
        'test-member-id',
        expect.objectContaining({
          failedLoginAttempts: 5,
          accountLocked: true,
          lockedUntil: expect.any(Date),
        })
      );

      // Verify locked for 15 minutes
      const updateCall = (mockMemberRepository.update as jest.Mock).mock.calls[0][1];
      const lockDuration = updateCall.lockedUntil.getTime() - new Date().getTime();
      const fifteenMinutes = 15 * 60 * 1000;
      expect(lockDuration).toBeGreaterThanOrEqual(fifteenMinutes - 1000); // Allow 1 second tolerance
      expect(lockDuration).toBeLessThanOrEqual(fifteenMinutes + 1000);
    });
  });

  describe('Account Lockout', () => {
    it('should throw error when account is locked', async () => {
      // Arrange
      testMember.accountLocked = true;
      testMember.lockedUntil = new Date(Date.now() + 10 * 60 * 1000); // Locked for 10 more minutes
      mockMemberRepository.findByEmail.mockResolvedValue(testMember);

      // Act & Assert
      await expect(
        authenticateUser.execute({
          email: 'test@example.com',
          password: 'TestPassword123!',
        })
      ).rejects.toThrow('Account is locked');
    });

    it('should unlock account automatically after 15 minutes', async () => {
      // Arrange
      testMember.accountLocked = true;
      testMember.lockedUntil = new Date(Date.now() - 1000); // Locked until 1 second ago
      testMember.failedLoginAttempts = 5;
      mockMemberRepository.findByEmail.mockResolvedValue(testMember);
      (mockPasswordService.verify as jest.Mock).mockResolvedValue(true);
      (mockJWTService.generateAccessToken as jest.Mock).mockReturnValue('access-token');
      (mockJWTService.generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      // Act
      const result = await authenticateUser.execute({
        email: 'test@example.com',
        password: 'TestPassword123!',
      });

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(mockMemberRepository.update).toHaveBeenCalledWith(
        'test-member-id',
        expect.objectContaining({
          accountLocked: false,
          failedLoginAttempts: 0,
          lockedUntil: null,
        })
      );
    });

    it('should not allow login if lockout period not expired', async () => {
      // Arrange
      const futureDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes in future
      testMember.accountLocked = true;
      testMember.lockedUntil = futureDate;
      mockMemberRepository.findByEmail.mockResolvedValue(testMember);
      (mockPasswordService.verify as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(
        authenticateUser.execute({
          email: 'test@example.com',
          password: 'TestPassword123!',
        })
      ).rejects.toThrow('Account is locked');

      // Verify the error message includes remaining time
      try {
        await authenticateUser.execute({
          email: 'test@example.com',
          password: 'TestPassword123!',
        });
      } catch (error: any) {
        expect(error.message).toMatch(/locked.*\d+ minute/i);
      }
    });
  });

  describe('Input Validation', () => {
    it('should throw error for missing email', async () => {
      await expect(
        authenticateUser.execute({
          email: '',
          password: 'TestPassword123!',
        })
      ).rejects.toThrow('Email is required');
    });

    it('should throw error for missing password', async () => {
      await expect(
        authenticateUser.execute({
          email: 'test@example.com',
          password: '',
        })
      ).rejects.toThrow('Password is required');
    });

    it('should throw error for invalid email format', async () => {
      await expect(
        authenticateUser.execute({
          email: 'invalid-email',
          password: 'TestPassword123!',
        })
      ).rejects.toThrow('Invalid email format');
    });
  });

  describe('Security', () => {
    it('should not include password hash in returned member object', async () => {
      // Arrange
      mockMemberRepository.findByEmail.mockResolvedValue(testMember);
      (mockPasswordService.verify as jest.Mock).mockResolvedValue(true);
      (mockJWTService.generateAccessToken as jest.Mock).mockReturnValue('access-token');
      (mockJWTService.generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      // Act
      const result = await authenticateUser.execute({
        email: 'test@example.com',
        password: 'TestPassword123!',
      });

      // Assert
      expect(result.member).not.toHaveProperty('passwordHash');
    });

    it('should not reveal whether email exists for failed logins', async () => {
      // For non-existent email
      mockMemberRepository.findByEmail.mockResolvedValue(null);

      try {
        await authenticateUser.execute({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!',
        });
      } catch (error: any) {
        expect(error.message).toBe('Invalid credentials');
      }

      // For wrong password
      mockMemberRepository.findByEmail.mockResolvedValue(testMember);
      (mockPasswordService.verify as jest.Mock).mockResolvedValue(false);

      try {
        await authenticateUser.execute({
          email: 'test@example.com',
          password: 'WrongPassword!',
        });
      } catch (error: any) {
        expect(error.message).toBe('Invalid credentials');
      }
    });
  });
});
