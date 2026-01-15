/**
 * Create Member Account Use Case (Admin Only)
 *
 * Creates a new member account:
 * - Generates temporary password
 * - Creates member record
 * - Sends invitation email
 * - Logs audit trail
 *
 * T302: Create CreateMemberAccount use case
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PasswordService } from '../../infrastructure/auth/passwordService';
import { EmailService } from '../../infrastructure/email/emailService';
import { AuditLogService } from '../services/auditLogService';

export interface CreateMemberAccountRequest {
  email: string;
  firstName: string;
  lastName: string;
  role?: 'MEMBER' | 'STAFF' | 'ADMIN';
  phone?: string;
  address?: string;
  createdBy: string;
  ipAddress: string;
  userAgent: string;
}

export interface CreateMemberAccountResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  membershipDate: Date;
  temporaryPassword: string;
}

export interface IMemberRepository {
  findByEmail(email: string): Promise<any>;
  create(data: any): Promise<any>;
}

export class CreateMemberAccount {
  constructor(
    private memberRepository: IMemberRepository,
    private passwordService: PasswordService,
    private emailService: EmailService,
    private auditLogService: AuditLogService
  ) {}

  async execute(request: CreateMemberAccountRequest): Promise<CreateMemberAccountResponse> {
    // Validate required fields
    if (!request.email || !request.firstName || !request.lastName) {
      throw new Error('Email, first name, and last name are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      throw new Error('Invalid email format');
    }

    // Check for existing member
    const existingMember = await this.memberRepository.findByEmail(request.email);
    if (existingMember) {
      throw new Error('A member with this email already exists');
    }

    // Generate temporary password
    const temporaryPassword = this.generateTemporaryPassword();
    const passwordHash = await this.passwordService.hash(temporaryPassword);

    // Create member record
    const memberData = {
      id: uuidv4(),
      email: request.email.toLowerCase(),
      firstName: request.firstName,
      lastName: request.lastName,
      passwordHash,
      role: request.role || 'MEMBER',
      phone: request.phone || null,
      address: request.address || null,
      membershipDate: new Date(),
      privacySettings: {
        showPhone: false,
        showEmail: false,
        showAddress: false,
      },
      emailNotifications: true,
      accountLocked: false,
      failedLoginAttempts: 0,
      mfaEnabled: false,
    };

    const member = await this.memberRepository.create(memberData);

    // Log audit trail
    await this.auditLogService.log({
      userId: request.createdBy,
      action: 'CREATE',
      entityType: 'MEMBER',
      entityId: member.id,
      changes: {
        after: {
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
          role: member.role,
        },
      },
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
    });

    // Send invitation email
    await this.sendInvitationEmail(member, temporaryPassword);

    return {
      id: member.id,
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      role: member.role,
      phone: member.phone,
      membershipDate: member.membershipDate,
      temporaryPassword,
    };
  }

  private generateTemporaryPassword(): string {
    // Generate a secure random password
    const length = 12;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';

    // Ensure at least one of each required character type
    password += 'A'; // uppercase
    password += 'a'; // lowercase
    password += '1'; // digit
    password += '!'; // special

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      const randomIndex = crypto.randomInt(chars.length);
      password += chars[randomIndex];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => crypto.randomInt(3) - 1)
      .join('');
  }

  private async sendInvitationEmail(
    member: { email: string; firstName: string; lastName: string },
    temporaryPassword: string
  ): Promise<void> {
    const loginUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/login`
      : 'http://localhost:5173/login';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1e3a5f; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .credentials { background-color: #fff; padding: 15px; border: 1px solid #ddd; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background-color: #1e3a5f; color: white; text-decoration: none; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Sing Buri Adventist Center</h1>
            </div>
            <div class="content">
              <p>Dear ${member.firstName} ${member.lastName},</p>
              
              <p>Welcome to the Sing Buri Adventist Center member portal! Your account has been created and you can now access our church management system.</p>
              
              <div class="credentials">
                <h3>Your Login Credentials</h3>
                <p><strong>Email:</strong> ${member.email}</p>
                <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
              </div>
              
              <p><strong>Important:</strong> For security reasons, please change your password immediately after your first login.</p>
              
              <p style="text-align: center;">
                <a href="${loginUrl}" class="button">Sign In to Your Account</a>
              </p>
              
              <p>If you have any questions or need assistance, please contact the church administration.</p>
              
              <p>Blessings,<br>Sing Buri Adventist Center</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply directly to this email.</p>
              <p>Sing Buri Adventist Center | Thailand</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.emailService.sendEmail({
      to: member.email,
      subject: 'Welcome to Sing Buri Adventist Center - Your Account Has Been Created',
      html: htmlContent,
      text: `
Welcome to Sing Buri Adventist Center!

Dear ${member.firstName} ${member.lastName},

Your account has been created. Here are your login credentials:

Email: ${member.email}
Temporary Password: ${temporaryPassword}

Please sign in at: ${loginUrl}

Important: Please change your password immediately after your first login.

Blessings,
Sing Buri Adventist Center
      `.trim(),
    });
  }
}
