/// <reference types="jest" />
/**
 * Unit Tests: RequestPasswordReset & ResetPassword Use Cases (T071)
 *
 * Tests the password reset business logic:
 * - Reset token generation and hashing
 * - Email sending on valid request
 * - Always-success response to prevent email enumeration
 * - Token validation and expiration
 * - Password strength validation
 * - Account unlock on successful reset
 */

import crypto from 'crypto';
import { RequestPasswordReset } from '../../../src/application/useCases/requestPasswordReset';
import { ResetPassword } from '../../../src/application/useCases/resetPassword';
import { IMemberRepository } from '../../../src/domain/interfaces/IMemberRepository';
import { EmailService } from '../../../src/infrastructure/email/emailService';
import { Member } from '../../../src/domain/entities/Member';
import { Role } from '../../../src/domain/valueObjects/Role';

// Mock repositories and services
const mockMemberRepository: jest.Mocked<IMemberRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
  findByRole: jest.fn(),
  searchByName: jest.fn(),
  count: jest.fn(),
};

const mockEmailService = {
  sendPasswordResetEmail: jest.fn(),
  sendEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
} as unknown as EmailService & { sendPasswordResetEmail: jest.Mock };

describe('RequestPasswordReset Use Case', () => {
  let requestPasswordReset: RequestPasswordReset;
  let testMember: Member;

  beforeEach(() => {
    jest.clearAllMocks();

    requestPasswordReset = new RequestPasswordReset(mockMemberRepository, mockEmailService);

    testMember = new Member(
      'test-member-id',
      'test@example.com',
      'hashed-password',
      'Test',
      'User',
      Role.MEMBER,
      new Date(),
      { showPhone: true, showEmail: true, showAddress: true },
      true,
      undefined,
      undefined,
      false,
      undefined,
      0,
      undefined,
      false,
      undefined,
      undefined,
      undefined,
      undefined,
      new Date(),
      new Date()
    );
  });

  describe('Successful Request', () => {
    it('should generate a reset token and send email when member exists', async () => {
      mockMemberRepository.findByEmail.mockResolvedValue(testMember);
      mockEmailService.sendPasswordResetEmail.mockResolvedValue(true);
      mockMemberRepository.update.mockResolvedValue(testMember);

      const result = await requestPasswordReset.execute({ email: 'test@example.com' });

      expect(result.success).toBe(true);
      expect(result.message).toContain('If an account exists');
      expect(mockMemberRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockMemberRepository.update).toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String)
      );
    });

    it('should store a hashed token, not the plain token', async () => {
      mockMemberRepository.findByEmail.mockResolvedValue(testMember);
      mockEmailService.sendPasswordResetEmail.mockResolvedValue(true);
      mockMemberRepository.update.mockResolvedValue(testMember);

      await requestPasswordReset.execute({ email: 'test@example.com' });

      // The token stored on the member should be a SHA-256 hash (64 hex chars)
      const updatedMember = mockMemberRepository.update.mock.calls[0][0];
      expect(updatedMember.passwordResetToken).toBeDefined();
      expect(updatedMember.passwordResetToken).toHaveLength(64);
    });

    it('should set token expiration to ~1 hour from now', async () => {
      mockMemberRepository.findByEmail.mockResolvedValue(testMember);
      mockEmailService.sendPasswordResetEmail.mockResolvedValue(true);
      mockMemberRepository.update.mockResolvedValue(testMember);

      const beforeExecute = Date.now();
      await requestPasswordReset.execute({ email: 'test@example.com' });

      const updatedMember = mockMemberRepository.update.mock.calls[0][0];
      expect(updatedMember.passwordResetExpires).toBeDefined();

      const expiryTime = updatedMember.passwordResetExpires!.getTime();
      const oneHourMs = 60 * 60 * 1000;
      // Expiry should be within 5 seconds of 1 hour from now
      expect(expiryTime).toBeGreaterThanOrEqual(beforeExecute + oneHourMs - 5000);
      expect(expiryTime).toBeLessThanOrEqual(beforeExecute + oneHourMs + 5000);
    });
  });

  describe('Email Enumeration Prevention', () => {
    it('should return success even when email does not exist', async () => {
      mockMemberRepository.findByEmail.mockResolvedValue(null);

      const result = await requestPasswordReset.execute({ email: 'nonexistent@example.com' });

      expect(result.success).toBe(true);
      expect(result.message).toContain('If an account exists');
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should return success even when email sending fails', async () => {
      mockMemberRepository.findByEmail.mockResolvedValue(testMember);
      mockEmailService.sendPasswordResetEmail.mockResolvedValue(false);
      mockMemberRepository.update.mockResolvedValue(testMember);

      const result = await requestPasswordReset.execute({ email: 'test@example.com' });

      expect(result.success).toBe(true);
    });

    it('should return success even when repository throws', async () => {
      mockMemberRepository.findByEmail.mockRejectedValue(new Error('DB connection lost'));

      const result = await requestPasswordReset.execute({ email: 'test@example.com' });

      expect(result.success).toBe(true);
      expect(result.message).toContain('If an account exists');
    });
  });
});

describe('ResetPassword Use Case', () => {
  let resetPassword: ResetPassword;
  let testMember: Member;
  const plainToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

  beforeEach(() => {
    jest.clearAllMocks();

    resetPassword = new ResetPassword(mockMemberRepository);

    testMember = new Member(
      'test-member-id',
      'test@example.com',
      'old-hashed-password',
      'Test',
      'User',
      Role.MEMBER,
      new Date(),
      { showPhone: true, showEmail: true, showAddress: true },
      true,
      undefined,
      undefined,
      true, // accountLocked
      undefined,
      5, // failedLoginAttempts
      undefined,
      false,
      undefined,
      undefined,
      hashedToken, // passwordResetToken
      new Date(Date.now() + 60 * 60 * 1000), // passwordResetExpires (1 hour from now)
      new Date(),
      new Date()
    );
  });

  describe('Successful Reset', () => {
    it('should reset password with a valid token and strong password', async () => {
      mockMemberRepository.findAll.mockResolvedValue([testMember]);
      mockMemberRepository.update.mockResolvedValue(testMember);

      const result = await resetPassword.execute({
        token: plainToken,
        newPassword: 'NewPassword1!',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('reset successfully');
      expect(mockMemberRepository.update).toHaveBeenCalled();
    });

    it('should clear reset token fields after successful reset', async () => {
      mockMemberRepository.findAll.mockResolvedValue([testMember]);
      mockMemberRepository.update.mockResolvedValue(testMember);

      await resetPassword.execute({
        token: plainToken,
        newPassword: 'NewPassword1!',
      });

      const updatedMember = mockMemberRepository.update.mock.calls[0][0];
      expect(updatedMember.passwordResetToken).toBeUndefined();
      expect(updatedMember.passwordResetExpires).toBeUndefined();
    });

    it('should unlock account and reset failed attempts', async () => {
      mockMemberRepository.findAll.mockResolvedValue([testMember]);
      mockMemberRepository.update.mockResolvedValue(testMember);

      await resetPassword.execute({
        token: plainToken,
        newPassword: 'NewPassword1!',
      });

      const updatedMember = mockMemberRepository.update.mock.calls[0][0];
      expect(updatedMember.accountLocked).toBe(false);
      expect(updatedMember.failedLoginAttempts).toBe(0);
    });

    it('should hash the new password with bcrypt', async () => {
      mockMemberRepository.findAll.mockResolvedValue([testMember]);
      mockMemberRepository.update.mockResolvedValue(testMember);

      await resetPassword.execute({
        token: plainToken,
        newPassword: 'NewPassword1!',
      });

      const updatedMember = mockMemberRepository.update.mock.calls[0][0];
      // bcrypt hashes start with $2b$
      expect(updatedMember.passwordHash).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('Invalid Token', () => {
    it('should fail with an invalid token', async () => {
      mockMemberRepository.findAll.mockResolvedValue([testMember]);

      const result = await resetPassword.execute({
        token: 'invalid-token',
        newPassword: 'NewPassword1!',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('invalid or has expired');
      expect(mockMemberRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with an expired token', async () => {
      // Set token to already expired
      testMember.passwordResetExpires = new Date(Date.now() - 1000);
      mockMemberRepository.findAll.mockResolvedValue([testMember]);

      const result = await resetPassword.execute({
        token: plainToken,
        newPassword: 'NewPassword1!',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('invalid or has expired');
    });
  });

  describe('Password Validation', () => {
    it('should reject password shorter than 8 characters', async () => {
      const result = await resetPassword.execute({
        token: plainToken,
        newPassword: 'Ab1!',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('8 characters');
    });

    it('should reject password without lowercase letter', async () => {
      const result = await resetPassword.execute({
        token: plainToken,
        newPassword: 'PASSWORD1!',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('lowercase');
    });

    it('should reject password without uppercase letter', async () => {
      const result = await resetPassword.execute({
        token: plainToken,
        newPassword: 'password1!',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('uppercase');
    });

    it('should reject password without number', async () => {
      const result = await resetPassword.execute({
        token: plainToken,
        newPassword: 'Password!',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('number');
    });

    it('should reject password without special character', async () => {
      const result = await resetPassword.execute({
        token: plainToken,
        newPassword: 'Password1',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('special character');
    });
  });

  describe('Error Handling', () => {
    it('should return failure when repository throws', async () => {
      mockMemberRepository.findAll.mockRejectedValue(new Error('DB error'));

      const result = await resetPassword.execute({
        token: plainToken,
        newPassword: 'NewPassword1!',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('error occurred');
    });
  });
});
