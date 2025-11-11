import { v4 as uuidv4 } from 'uuid';
import { Announcement } from '../../domain/entities/Announcement';
import { Priority } from '../../domain/valueObjects/Priority';
import { announcementRepository } from '../../infrastructure/database/repositories/announcementRepository';
import { EmailService } from '../../infrastructure/email/emailService';
import { memberRepository } from '../../infrastructure/database/repositories/memberRepository';
import logger from '../../infrastructure/logging/logger';

/**
 * Use Case: Create Announcement
 *
 * Business Rules:
 * - Only ADMIN and STAFF roles can create announcements
 * - Title must be 3-150 characters
 * - Content cannot exceed 5000 characters
 * - If priority is URGENT, email all members with notifications enabled (FR-027)
 *
 * @param authorId - ID of the member creating the announcement (must be ADMIN/STAFF)
 * @param title - Announcement title (3-150 chars)
 * @param content - Announcement content (max 5000 chars)
 * @param priority - Priority level (URGENT triggers emails)
 * @returns Created announcement with author details
 */
export async function createAnnouncement(
  authorId: string,
  title: string,
  content: string,
  priority: Priority = Priority.NORMAL
): Promise<any> {
  try {
    logger.info('Creating announcement', { authorId, title, priority });

    // Validate author exists and has permission
    const author = await memberRepository.findById(authorId);
    if (!author) {
      throw new Error('Author not found');
    }

    if (author.role !== 'ADMIN' && author.role !== 'STAFF') {
      throw new Error('Only administrators and staff can create announcements');
    }

    // Create announcement entity (validates business rules)
    const announcement = Announcement.create(
      uuidv4(),
      title.trim(),
      content.trim(),
      priority,
      authorId
    );

    // Persist to database
    const created = await announcementRepository.create(announcement.toPersistence());

    logger.info('Announcement created successfully', {
      announcementId: created.id,
      priority,
    });

    // If urgent, send email notifications to all members
    if (priority === Priority.URGENT) {
      // Fire-and-forget: Send emails asynchronously
      sendUrgentAnnouncementEmails(created, author)
        .then(() => {
          logger.info('Urgent announcement emails sent', {
            announcementId: created.id,
          });
        })
        .catch((error) => {
          logger.error('Failed to send urgent announcement emails', {
            announcementId: created.id,
            error: error.message,
          });
        });
    }

    return created;
  } catch (error: any) {
    logger.error('Failed to create announcement', {
      authorId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Send urgent announcement emails to all members with notifications enabled
 */
async function sendUrgentAnnouncementEmails(announcement: any, author: any): Promise<void> {
  try {
    // Get all members with email notifications enabled
    const members = await memberRepository.findAll();
    const notificationMembers = members.filter(
      (m) => m.emailNotifications !== false && m.email && m.id !== author.id
    );

    if (notificationMembers.length === 0) {
      logger.info('No members to notify for urgent announcement');
      return;
    }

    const emailService = new EmailService();

    logger.info(`Sending urgent announcement to ${notificationMembers.length} members`, {
      announcementId: announcement.id,
    });

    // Send emails in batches to avoid overwhelming the SMTP server
    const batchSize = 10;
    for (let i = 0; i < notificationMembers.length; i += batchSize) {
      const batch = notificationMembers.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (member) => {
          try {
            await emailService.sendEmail({
              to: member.email,
              subject: `🚨 URGENT: ${announcement.title}`,
              text: `URGENT ANNOUNCEMENT\n\n${announcement.title}\n\n${announcement.content}\n\nPosted by: ${author.firstName} ${author.lastName}\nDate: ${new Date(announcement.publishedAt).toLocaleDateString('en-US')}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">🚨 Urgent Announcement</h1>
                  </div>
                  <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <h2 style="color: #1f2937; margin-top: 0;">${announcement.title}</h2>
                    <div style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${announcement.content}</div>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
                      <strong>Posted by:</strong> ${author.firstName} ${author.lastName}<br>
                      <strong>Date:</strong> ${new Date(
                        announcement.publishedAt
                      ).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}<br>
                      <br>
                      You received this email because you have email notifications enabled for urgent announcements.
                    </p>
                  </div>
                </div>
              `,
            });
          } catch (error: any) {
            logger.error('Failed to send urgent announcement email to member', {
              memberId: member.id,
              email: member.email,
              error: error.message,
            });
          }
        })
      );

      // Small delay between batches
      if (i + batchSize < notificationMembers.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  } catch (error: any) {
    logger.error('Error in sendUrgentAnnouncementEmails', {
      error: error.message,
    });
    throw error;
  }
}
