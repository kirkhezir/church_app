import bcrypt from 'bcrypt';

/**
 * Password Service for hashing and validation
 * Uses bcrypt for secure password hashing
 */
export class PasswordService {
  private readonly saltRounds: number = 10;

  /**
   * Hash a plain text password
   */
  async hash(password: string): Promise<string> {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Validate password strength
    if (!this.isStrongPassword(password)) {
      throw new Error(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      );
    }

    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Verify a password against a hash
   */
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Check if password meets strength requirements
   */
  isStrongPassword(password: string): boolean {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const minLength = password.length >= 8;

    return hasUppercase && hasLowercase && hasNumber && minLength;
  }

  /**
   * Generate a random password
   */
  generateRandomPassword(length: number = 12): string {
    const crypto = require('crypto');
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + special;

    let password = '';

    // Ensure at least one of each required character type
    password += uppercase[crypto.randomInt(uppercase.length)];
    password += lowercase[crypto.randomInt(lowercase.length)];
    password += numbers[crypto.randomInt(numbers.length)];

    // Fill the rest randomly using cryptographic PRNG
    for (let i = password.length; i < length; i++) {
      password += allChars[crypto.randomInt(allChars.length)];
    }

    // Shuffle the password using Fisher-Yates with crypto.randomInt
    const chars = password.split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = crypto.randomInt(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
  }
}

// Export singleton instance
export const passwordService = new PasswordService();
