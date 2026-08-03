import { EmailService } from '../../infrastructure/email/emailService';
import { logger } from '../../infrastructure/logging/logger';
import { EnglishTutorialEnrollment } from '../../domain/entities/EnglishTutorialEnrollment';

/**
 * Sends staff notification emails for new English Tutorial Ministry enrollments
 */
export class EnglishTutorialNotificationService {
  private emailService: EmailService;

  constructor(emailService?: EmailService) {
    this.emailService = emailService || new EmailService();
  }

  async sendEnrollmentNotification(enrollment: EnglishTutorialEnrollment): Promise<void> {
    const genderLabel = enrollment.gender === 'MALE' ? 'Male' : 'Female';
    const birthDateLabel = enrollment.birthDate.toISOString().split('T')[0];

    const text = `
New English Tutorial Ministry Enrollment

Name: ${enrollment.name}
Nickname: ${enrollment.nickname}
Gender: ${genderLabel}
Age: ${enrollment.age}
Birthdate: ${birthDateLabel}
Phone: ${enrollment.phone || 'Not provided'}
Email: ${enrollment.email || 'Not provided'}
    `.trim();

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #1e40af;">New English Tutorial Ministry Enrollment</h2>
        <table cellpadding="6" style="border-collapse: collapse;">
          <tr><td><strong>Name</strong></td><td>${enrollment.name}</td></tr>
          <tr><td><strong>Nickname</strong></td><td>${enrollment.nickname}</td></tr>
          <tr><td><strong>Gender</strong></td><td>${genderLabel}</td></tr>
          <tr><td><strong>Age</strong></td><td>${enrollment.age}</td></tr>
          <tr><td><strong>Birthdate</strong></td><td>${birthDateLabel}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${enrollment.phone || 'Not provided'}</td></tr>
          <tr><td><strong>Email</strong></td><td>${enrollment.email || 'Not provided'}</td></tr>
        </table>
      </div>
    `;

    await this.emailService.sendEmail({
      to: process.env.CHURCH_CONTACT_EMAIL || 'contact@singburi-adventist.org',
      subject: `New English Tutorial Enrollment: ${enrollment.name}`,
      text,
      html,
      replyTo: enrollment.email,
    });

    logger.info('English Tutorial enrollment notification sent', {
      enrollmentId: enrollment.id,
    });
  }
}
