import nodemailer, { Transporter } from 'nodemailer';
import { logger } from '../logging/logger';

/**
 * Email Service
 * Handles sending emails for notifications, password resets, etc.
 */
export class EmailService {
  private transporter: Transporter;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@singburi-adventist.org';
    this.fromName = process.env.SMTP_FROM_NAME || 'Sing Buri Adventist Center';

    // Create transporter with SMTP configuration
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  /**
   * Verify SMTP connection
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('📧 Email service is ready');
    } catch (error) {
      logger.error('❌ Email service verification failed', error);
    }
  }

  /**
   * Send a generic email
   */
  async sendEmail(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
      });

      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email', {
        error,
        to: options.to,
        subject: options.subject,
      });
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You have requested to reset your password for your Sing Buri Adventist Center account.</p>
              <p>Please click the button below to reset your password. This link will expire in 1 hour.</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all;">${resetUrl}</p>
              <p><strong>If you did not request this password reset, please ignore this email.</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Sing Buri Adventist Center. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Password Reset Request

You have requested to reset your password for your Sing Buri Adventist Center account.

Please visit the following link to reset your password (expires in 1 hour):
${resetUrl}

If you did not request this password reset, please ignore this email.

© ${new Date().getFullYear()} Sing Buri Adventist Center. All rights reserved.
    `;

    return this.sendEmail({
      to,
      subject: 'Password Reset Request',
      text,
      html,
    });
  }

  /**
   * Send urgent announcement notification
   */
  async sendUrgentAnnouncementEmail(
    to: string,
    announcement: { title: string; content: string }
  ): Promise<boolean> {
    const announcementUrl = `${process.env.FRONTEND_URL}/announcements`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .announcement-box { background-color: white; padding: 15px; border-left: 4px solid #f44336; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background-color: #f44336; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Urgent Announcement</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>An urgent announcement has been posted:</p>
              <div class="announcement-box">
                <h2>${announcement.title}</h2>
                <p>${announcement.content}</p>
              </div>
              <p style="text-align: center;">
                <a href="${announcementUrl}" class="button">View All Announcements</a>
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Sing Buri Adventist Center. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
🚨 URGENT ANNOUNCEMENT

${announcement.title}

${announcement.content}

View all announcements at: ${announcementUrl}

© ${new Date().getFullYear()} Sing Buri Adventist Center. All rights reserved.
    `;

    return this.sendEmail({
      to,
      subject: `🚨 Urgent: ${announcement.title}`,
      text,
      html,
    });
  }

  /**
   * Send welcome email to new member
   */
  async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Our Community!</h1>
            </div>
            <div class="content">
              <p>Hello ${firstName},</p>
              <p>Welcome to the Sing Buri Adventist Center family! We're so glad to have you join us.</p>
              <p>Your account has been created successfully. You can now:</p>
              <ul>
                <li>View and RSVP to upcoming events</li>
                <li>Read important announcements</li>
                <li>Connect with other members through messaging</li>
                <li>Manage your profile and preferences</li>
              </ul>
              <p style="text-align: center;">
                <a href="${loginUrl}" class="button">Login to Your Account</a>
              </p>
              <p>If you have any questions, please don't hesitate to reach out to us.</p>
              <p>God bless!</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Sing Buri Adventist Center. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Welcome to Sing Buri Adventist Center!

Hello ${firstName},

Welcome to our community! Your account has been created successfully.

You can now:
- View and RSVP to upcoming events
- Read important announcements
- Connect with other members through messaging
- Manage your profile and preferences

Login at: ${loginUrl}

If you have any questions, please don't hesitate to reach out to us.

God bless!

© ${new Date().getFullYear()} Sing Buri Adventist Center. All rights reserved.
    `;

    return this.sendEmail({
      to,
      subject: 'Welcome to Sing Buri Adventist Center!',
      text,
      html,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
