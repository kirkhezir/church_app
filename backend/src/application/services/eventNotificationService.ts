import { EmailService, emailService } from '../../infrastructure/email/emailService';
import { logger } from '../../infrastructure/logging/logger';

/**
 * Event Notification Service
 *
 * Handles sending email notifications for event-related activities:
 * - RSVP confirmations
 * - Event cancellations
 * - Event updates/modifications
 * - Waitlist promotions
 */

interface EventDetails {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
  category: string;
}

interface MemberDetails {
  email: string;
  firstName: string;
  lastName: string;
}

export class EventNotificationService {
  constructor(private emailService: EmailService) {}

  /**
   * Send RSVP confirmation email to member
   */
  async sendRSVPConfirmation(
    member: MemberDetails,
    event: EventDetails,
    status: 'CONFIRMED' | 'WAITLISTED'
  ): Promise<boolean> {
    try {
      const eventUrl = `${process.env.FRONTEND_URL}/events/${event.id}`;
      const formattedDate = this.formatDate(event.startDate);
      const formattedTime = this.formatTimeRange(event.startDate, event.endDate);

      const isWaitlisted = status === 'WAITLISTED';
      const subject = isWaitlisted
        ? `Waitlisted: ${event.title}`
        : `RSVP Confirmed: ${event.title}`;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: ${isWaitlisted ? '#FFA726' : '#4CAF50'}; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 20px; }
              .event-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .event-details h2 { margin: 0 0 15px 0; color: #333; }
              .detail-row { display: flex; margin: 10px 0; }
              .detail-label { font-weight: bold; min-width: 100px; color: #666; }
              .detail-value { color: #333; }
              .button { display: inline-block; padding: 12px 24px; background-color: ${isWaitlisted ? '#FFA726' : '#4CAF50'}; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              .waitlist-notice { background-color: #FFF3E0; padding: 15px; border-left: 4px solid #FFA726; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${isWaitlisted ? "⏳ You're on the Waitlist" : '✅ RSVP Confirmed'}</h1>
              </div>
              <div class="content">
                <p>Hello ${member.firstName},</p>
                ${
                  isWaitlisted
                    ? `<div class="waitlist-notice">
                      <p><strong>You have been added to the waitlist for this event.</strong></p>
                      <p>The event is currently at full capacity, but we'll notify you immediately if a spot becomes available!</p>
                    </div>`
                    : '<p>Your RSVP has been confirmed! We look forward to seeing you at the event.</p>'
                }
                <div class="event-details">
                  <h2>${event.title}</h2>
                  <div class="detail-row">
                    <span class="detail-label">📅 Date:</span>
                    <span class="detail-value">${formattedDate}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">⏰ Time:</span>
                    <span class="detail-value">${formattedTime}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">📍 Location:</span>
                    <span class="detail-value">${event.location}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">🏷️ Category:</span>
                    <span class="detail-value">${event.category}</span>
                  </div>
                </div>
                <p style="text-align: center;">
                  <a href="${eventUrl}" class="button">View Event Details</a>
                </p>
                ${
                  !isWaitlisted
                    ? `<p style="font-size: 14px; color: #666;">
                      If you need to cancel your RSVP, you can do so anytime by visiting the event page.
                    </p>`
                    : ''
                }
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Sing Buri Adventist Center. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const text = `
${isWaitlisted ? '⏳ WAITLIST CONFIRMATION' : '✅ RSVP CONFIRMED'}

Hello ${member.firstName},

${
  isWaitlisted
    ? `You have been added to the waitlist for this event. The event is currently at full capacity, but we'll notify you immediately if a spot becomes available!`
    : 'Your RSVP has been confirmed! We look forward to seeing you at the event.'
}

Event Details:
--------------
${event.title}
📅 ${formattedDate}
⏰ ${formattedTime}
📍 ${event.location}
🏷️ ${event.category}

View event details: ${eventUrl}

${
  !isWaitlisted
    ? 'If you need to cancel your RSVP, you can do so anytime by visiting the event page.'
    : ''
}

© ${new Date().getFullYear()} Sing Buri Adventist Center. All rights reserved.
      `;

      const sent = await this.emailService.sendEmail({
        to: member.email,
        subject,
        text,
        html,
      });

      if (sent) {
        logger.info('RSVP confirmation email sent', {
          memberEmail: member.email,
          eventId: event.id,
          eventTitle: event.title,
          status,
        });
      }

      return sent;
    } catch (error) {
      logger.error('Failed to send RSVP confirmation email', {
        error,
        memberEmail: member.email,
        eventId: event.id,
      });
      return false;
    }
  }

  /**
   * Send RSVP cancellation confirmation email
   */
  async sendRSVPCancellationConfirmation(
    member: MemberDetails,
    event: EventDetails
  ): Promise<boolean> {
    try {
      const eventUrl = `${process.env.FRONTEND_URL}/events/${event.id}`;
      const formattedDate = this.formatDate(event.startDate);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #757575; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 20px; }
              .event-info { background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
              .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>RSVP Cancelled</h1>
              </div>
              <div class="content">
                <p>Hello ${member.firstName},</p>
                <p>Your RSVP has been cancelled for the following event:</p>
                <div class="event-info">
                  <h3>${event.title}</h3>
                  <p>📅 ${formattedDate}</p>
                  <p>📍 ${event.location}</p>
                </div>
                <p>You can RSVP again anytime if your plans change.</p>
                <p style="text-align: center;">
                  <a href="${eventUrl}" class="button">View Event</a>
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
RSVP CANCELLED

Hello ${member.firstName},

Your RSVP has been cancelled for the following event:

${event.title}
📅 ${formattedDate}
📍 ${event.location}

You can RSVP again anytime if your plans change.

View event: ${eventUrl}

© ${new Date().getFullYear()} Sing Buri Adventist Center. All rights reserved.
      `;

      return await this.emailService.sendEmail({
        to: member.email,
        subject: `RSVP Cancelled: ${event.title}`,
        text,
        html,
      });
    } catch (error) {
      logger.error('Failed to send RSVP cancellation email', {
        error,
        memberEmail: member.email,
        eventId: event.id,
      });
      return false;
    }
  }

  /**
   * Send waitlist promotion email (when a spot becomes available)
   */
  async sendWaitlistPromotionEmail(member: MemberDetails, event: EventDetails): Promise<boolean> {
    try {
      const eventUrl = `${process.env.FRONTEND_URL}/events/${event.id}`;
      const formattedDate = this.formatDate(event.startDate);
      const formattedTime = this.formatTimeRange(event.startDate, event.endDate);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 20px; }
              .event-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .highlight-box { background-color: #E8F5E9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; }
              .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Good News!</h1>
              </div>
              <div class="content">
                <p>Hello ${member.firstName},</p>
                <div class="highlight-box">
                  <p><strong>A spot has opened up!</strong></p>
                  <p>You've been promoted from the waitlist and your RSVP is now confirmed.</p>
                </div>
                <div class="event-details">
                  <h2>${event.title}</h2>
                  <p>📅 <strong>Date:</strong> ${formattedDate}</p>
                  <p>⏰ <strong>Time:</strong> ${formattedTime}</p>
                  <p>📍 <strong>Location:</strong> ${event.location}</p>
                </div>
                <p>We look forward to seeing you at the event!</p>
                <p style="text-align: center;">
                  <a href="${eventUrl}" class="button">View Event Details</a>
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
🎉 GOOD NEWS - RSVP CONFIRMED!

Hello ${member.firstName},

A spot has opened up! You've been promoted from the waitlist and your RSVP is now confirmed.

Event Details:
${event.title}
📅 ${formattedDate}
⏰ ${formattedTime}
📍 ${event.location}

We look forward to seeing you at the event!

View event details: ${eventUrl}

© ${new Date().getFullYear()} Sing Buri Adventist Center. All rights reserved.
      `;

      const sent = await this.emailService.sendEmail({
        to: member.email,
        subject: `🎉 Spot Available: ${event.title}`,
        text,
        html,
      });

      if (sent) {
        logger.info('Waitlist promotion email sent', {
          memberEmail: member.email,
          eventId: event.id,
          eventTitle: event.title,
        });
      }

      return sent;
    } catch (error) {
      logger.error('Failed to send waitlist promotion email', {
        error,
        memberEmail: member.email,
        eventId: event.id,
      });
      return false;
    }
  }

  /**
   * Send event cancellation notification to all attendees
   */
  async sendEventCancellationNotification(
    members: MemberDetails[],
    event: EventDetails,
    reason?: string
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    const eventUrl = `${process.env.FRONTEND_URL}/events`;
    const formattedDate = this.formatDate(event.startDate);

    for (const member of members) {
      try {
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 20px; }
                .event-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f44336; }
                .reason-box { background-color: #FFEBEE; padding: 15px; border-radius: 4px; margin: 15px 0; }
                .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>❌ Event Cancelled</h1>
                </div>
                <div class="content">
                  <p>Hello ${member.firstName},</p>
                  <p>We regret to inform you that the following event has been cancelled:</p>
                  <div class="event-info">
                    <h2>${event.title}</h2>
                    <p>📅 <strong>Originally scheduled:</strong> ${formattedDate}</p>
                    <p>📍 <strong>Location:</strong> ${event.location}</p>
                  </div>
                  ${
                    reason
                      ? `<div class="reason-box">
                        <p><strong>Reason:</strong> ${reason}</p>
                      </div>`
                      : ''
                  }
                  <p>We apologize for any inconvenience this may cause. Your RSVP has been automatically cancelled.</p>
                  <p style="text-align: center;">
                    <a href="${eventUrl}" class="button">View Other Events</a>
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
❌ EVENT CANCELLED

Hello ${member.firstName},

We regret to inform you that the following event has been cancelled:

${event.title}
📅 Originally scheduled: ${formattedDate}
📍 Location: ${event.location}

${reason ? `Reason: ${reason}\n` : ''}
We apologize for any inconvenience this may cause. Your RSVP has been automatically cancelled.

View other events: ${eventUrl}

© ${new Date().getFullYear()} Sing Buri Adventist Center. All rights reserved.
        `;

        const emailSent = await this.emailService.sendEmail({
          to: member.email,
          subject: `❌ Event Cancelled: ${event.title}`,
          text,
          html,
        });

        if (emailSent) {
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        logger.error('Failed to send event cancellation email', {
          error,
          memberEmail: member.email,
          eventId: event.id,
        });
        failed++;
      }
    }

    logger.info('Event cancellation notifications sent', {
      eventId: event.id,
      eventTitle: event.title,
      totalRecipients: members.length,
      sent,
      failed,
    });

    return { sent, failed };
  }

  /**
   * Send event update notification to all attendees
   */
  async sendEventUpdateNotification(
    members: MemberDetails[],
    event: EventDetails,
    changes: string[]
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    const eventUrl = `${process.env.FRONTEND_URL}/events/${event.id}`;
    const formattedDate = this.formatDate(event.startDate);
    const formattedTime = this.formatTimeRange(event.startDate, event.endDate);

    for (const member of members) {
      try {
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 20px; }
                .event-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .changes-box { background-color: #FFF3E0; padding: 15px; border-left: 4px solid #FF9800; margin: 15px 0; }
                .changes-box ul { margin: 10px 0; padding-left: 20px; }
                .button { display: inline-block; padding: 12px 24px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📝 Event Updated</h1>
                </div>
                <div class="content">
                  <p>Hello ${member.firstName},</p>
                  <p>An event you've RSVP'd to has been updated:</p>
                  <div class="event-info">
                    <h2>${event.title}</h2>
                    <p>📅 <strong>Date:</strong> ${formattedDate}</p>
                    <p>⏰ <strong>Time:</strong> ${formattedTime}</p>
                    <p>📍 <strong>Location:</strong> ${event.location}</p>
                  </div>
                  <div class="changes-box">
                    <p><strong>What changed:</strong></p>
                    <ul>
                      ${changes.map((change) => `<li>${change}</li>`).join('\n                      ')}
                    </ul>
                  </div>
                  <p>Please review the updated event details. Your RSVP is still active.</p>
                  <p style="text-align: center;">
                    <a href="${eventUrl}" class="button">View Updated Event</a>
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
📝 EVENT UPDATED

Hello ${member.firstName},

An event you've RSVP'd to has been updated:

${event.title}
📅 ${formattedDate}
⏰ ${formattedTime}
📍 ${event.location}

What changed:
${changes.map((change) => `• ${change}`).join('\n')}

Please review the updated event details. Your RSVP is still active.

View updated event: ${eventUrl}

© ${new Date().getFullYear()} Sing Buri Adventist Center. All rights reserved.
        `;

        const emailSent = await this.emailService.sendEmail({
          to: member.email,
          subject: `📝 Event Updated: ${event.title}`,
          text,
          html,
        });

        if (emailSent) {
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        logger.error('Failed to send event update email', {
          error,
          memberEmail: member.email,
          eventId: event.id,
        });
        failed++;
      }
    }

    logger.info('Event update notifications sent', {
      eventId: event.id,
      eventTitle: event.title,
      totalRecipients: members.length,
      sent,
      failed,
    });

    return { sent, failed };
  }

  /**
   * Helper: Format date for display
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  /**
   * Helper: Format time range for display
   */
  private formatTimeRange(startDate: Date, endDate: Date): string {
    const startTime = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(startDate);

    const endTime = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(endDate);

    return `${startTime} - ${endTime}`;
  }
}

// Export singleton instance
export const eventNotificationService = new EventNotificationService(emailService);
