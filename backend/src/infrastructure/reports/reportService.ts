import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import prisma from '../database/prismaClient';

/**
 * PDF Report Generation Service
 *
 * Generates various PDF reports for the church app
 */

// Report configuration
const COLORS = {
  primary: '#2563eb', // Blue
  secondary: '#64748b', // Slate
  success: '#16a34a', // Green
  warning: '#f59e0b', // Amber
  danger: '#dc2626', // Red
  text: '#1e293b', // Slate 800
  muted: '#94a3b8', // Slate 400
  border: '#e2e8f0', // Slate 200
  background: '#f8fafc', // Slate 50
};

const FONTS = {
  regular: 'Helvetica',
  bold: 'Helvetica-Bold',
  italic: 'Helvetica-Oblique',
};

export class ReportService {
  /**
   * Generate a member directory PDF
   */
  async generateMemberDirectory(): Promise<Buffer> {
    const members = await prisma.member.findMany({
      where: { deletedAt: null },
      orderBy: { lastName: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        membershipDate: true,
        privacySettings: true,
      },
    });

    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const chunks: Buffer[] = [];

    stream.on('data', (chunk) => chunks.push(chunk));
    doc.pipe(stream);

    // Header
    this.addHeader(doc, 'Member Directory');
    this.addSubtitle(doc, `Generated on ${new Date().toLocaleDateString()}`);
    doc.moveDown(2);

    // Summary
    doc
      .font(FONTS.regular)
      .fontSize(12)
      .fillColor(COLORS.text)
      .text(`Total Members: ${members.length}`);
    doc.moveDown(2);

    // Table header
    const tableTop = doc.y;
    const columns = {
      name: { x: 50, width: 150 },
      email: { x: 200, width: 180 },
      phone: { x: 380, width: 100 },
      role: { x: 480, width: 70 },
    };

    this.addTableHeader(doc, tableTop, columns);

    // Table rows
    let y = tableTop + 25;
    for (const member of members) {
      if (y > 700) {
        doc.addPage();
        y = 50;
        this.addTableHeader(doc, y, columns);
        y += 25;
      }

      // Respect privacy settings
      const privacy = member.privacySettings as Record<string, boolean> | null;
      const showEmail = privacy?.showEmail !== false;
      const showPhone = privacy?.showPhone !== false;

      doc
        .font(FONTS.regular)
        .fontSize(10)
        .fillColor(COLORS.text)
        .text(`${member.lastName}, ${member.firstName}`, columns.name.x, y, {
          width: columns.name.width,
        })
        .text(showEmail ? member.email : '[Hidden]', columns.email.x, y, {
          width: columns.email.width,
        })
        .text(showPhone && member.phone ? member.phone : '[Hidden]', columns.phone.x, y, {
          width: columns.phone.width,
        })
        .text(member.role, columns.role.x, y, { width: columns.role.width });

      y += 20;
    }

    // Footer
    this.addFooter(doc);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /**
   * Generate an events report PDF
   */
  async generateEventsReport(startDate: Date, endDate: Date): Promise<Buffer> {
    const events = await prisma.events.findMany({
      where: {
        startDateTime: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
      include: {
        members: { select: { firstName: true, lastName: true } },
        event_rsvps: {
          where: { status: 'CONFIRMED' },
          select: { id: true },
        },
      },
      orderBy: { startDateTime: 'asc' },
    });

    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const chunks: Buffer[] = [];

    stream.on('data', (chunk) => chunks.push(chunk));
    doc.pipe(stream);

    // Header
    this.addHeader(doc, 'Events Report');
    this.addSubtitle(doc, `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
    doc.moveDown(2);

    // Summary
    const totalRsvps = events.reduce(
      (sum: number, e: (typeof events)[0]) => sum + e.event_rsvps.length,
      0
    );
    const cancelledCount = events.filter((e: (typeof events)[0]) => e.cancelledAt).length;

    doc.font(FONTS.bold).fontSize(14).fillColor(COLORS.primary).text('Summary');
    doc.moveDown(0.5);
    doc
      .font(FONTS.regular)
      .fontSize(12)
      .fillColor(COLORS.text)
      .text(`Total Events: ${events.length}`)
      .text(`Total RSVPs: ${totalRsvps}`)
      .text(`Cancelled Events: ${cancelledCount}`);
    doc.moveDown(2);

    // Events list
    for (const event of events) {
      if (doc.y > 650) {
        doc.addPage();
      }

      const isCancelled = !!event.cancelledAt;

      doc
        .font(FONTS.bold)
        .fontSize(12)
        .fillColor(isCancelled ? COLORS.danger : COLORS.text)
        .text(event.title + (isCancelled ? ' [CANCELLED]' : ''));

      doc
        .font(FONTS.regular)
        .fontSize(10)
        .fillColor(COLORS.muted)
        .text(
          `${new Date(event.startDateTime).toLocaleString()} | ${event.location} | ${event.category}`
        )
        .text(
          `RSVPs: ${event.event_rsvps.length}${event.maxCapacity ? `/${event.maxCapacity}` : ''}`
        );

      doc.moveDown(1);
    }

    // Footer
    this.addFooter(doc);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /**
   * Generate an announcements report PDF
   */
  async generateAnnouncementsReport(startDate: Date, endDate: Date): Promise<Buffer> {
    const announcements = await prisma.announcements.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
      include: {
        members: { select: { firstName: true, lastName: true } },
        member_announcement_views: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const chunks: Buffer[] = [];

    stream.on('data', (chunk) => chunks.push(chunk));
    doc.pipe(stream);

    // Header
    this.addHeader(doc, 'Announcements Report');
    this.addSubtitle(doc, `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
    doc.moveDown(2);

    // Summary
    const urgentCount = announcements.filter(
      (a: (typeof announcements)[0]) => a.priority === 'URGENT'
    ).length;
    const totalViews = announcements.reduce(
      (sum: number, a: (typeof announcements)[0]) => sum + a.member_announcement_views.length,
      0
    );

    doc.font(FONTS.bold).fontSize(14).fillColor(COLORS.primary).text('Summary');
    doc.moveDown(0.5);
    doc
      .font(FONTS.regular)
      .fontSize(12)
      .fillColor(COLORS.text)
      .text(`Total Announcements: ${announcements.length}`)
      .text(`Urgent Announcements: ${urgentCount}`)
      .text(`Total Views: ${totalViews}`);
    doc.moveDown(2);

    // Announcements list
    for (const announcement of announcements) {
      if (doc.y > 600) {
        doc.addPage();
      }

      const isUrgent = announcement.priority === 'URGENT';

      doc
        .font(FONTS.bold)
        .fontSize(12)
        .fillColor(isUrgent ? COLORS.danger : COLORS.text)
        .text((isUrgent ? '🚨 ' : '') + announcement.title);

      doc
        .font(FONTS.regular)
        .fontSize(10)
        .fillColor(COLORS.muted)
        .text(
          `By ${announcement.members.firstName} ${announcement.members.lastName} | ${new Date(announcement.createdAt).toLocaleDateString()} | ${announcement.member_announcement_views.length} views`
        );

      // Content preview (first 200 chars)
      const preview =
        announcement.content.length > 200
          ? announcement.content.substring(0, 200) + '...'
          : announcement.content;

      doc.font(FONTS.regular).fontSize(10).fillColor(COLORS.text).text(preview, { width: 500 });

      doc.moveDown(1.5);
    }

    // Footer
    this.addFooter(doc);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /**
   * Generate event attendance report for a specific event
   */
  async generateEventAttendanceReport(eventId: string): Promise<Buffer> {
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        members: { select: { firstName: true, lastName: true } },
        event_rsvps: {
          include: {
            members: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
          },
          orderBy: { rsvpedAt: 'asc' },
        },
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const chunks: Buffer[] = [];

    stream.on('data', (chunk) => chunks.push(chunk));
    doc.pipe(stream);

    // Header
    this.addHeader(doc, 'Event Attendance Report');
    doc.moveDown();

    // Event details
    doc.font(FONTS.bold).fontSize(16).fillColor(COLORS.text).text(event.title);

    doc
      .font(FONTS.regular)
      .fontSize(11)
      .fillColor(COLORS.muted)
      .text(`Date: ${new Date(event.startDateTime).toLocaleString()}`)
      .text(`Location: ${event.location}`)
      .text(`Category: ${event.category}`)
      .text(`Organizer: ${event.members.firstName} ${event.members.lastName}`);

    doc.moveDown(2);

    // Attendance summary
    const confirmed = event.event_rsvps.filter(
      (r: (typeof event.event_rsvps)[0]) => r.status === 'CONFIRMED'
    ).length;
    const waitlisted = event.event_rsvps.filter(
      (r: (typeof event.event_rsvps)[0]) => r.status === 'WAITLISTED'
    ).length;
    const cancelled = event.event_rsvps.filter(
      (r: (typeof event.event_rsvps)[0]) => r.status === 'CANCELLED'
    ).length;

    doc.font(FONTS.bold).fontSize(14).fillColor(COLORS.primary).text('Attendance Summary');
    doc.moveDown(0.5);
    doc
      .font(FONTS.regular)
      .fontSize(12)
      .fillColor(COLORS.text)
      .text(`Confirmed: ${confirmed}`)
      .text(`Waitlisted: ${waitlisted}`)
      .text(`Cancelled: ${cancelled}`)
      .text(`Total RSVPs: ${event.event_rsvps.length}`);

    if (event.maxCapacity) {
      const percentage = Math.round((confirmed / event.maxCapacity) * 100);
      doc.text(`Capacity: ${confirmed}/${event.maxCapacity} (${percentage}%)`);
    }

    doc.moveDown(2);

    // Attendee list
    doc.font(FONTS.bold).fontSize(14).fillColor(COLORS.primary).text('Attendee List (Confirmed)');
    doc.moveDown();

    const confirmedRsvps = event.event_rsvps.filter(
      (r: (typeof event.event_rsvps)[0]) => r.status === 'CONFIRMED'
    );
    if (confirmedRsvps.length === 0) {
      doc.font(FONTS.italic).fontSize(11).fillColor(COLORS.muted).text('No confirmed attendees');
    } else {
      let index = 1;
      for (const rsvp of confirmedRsvps) {
        if (doc.y > 700) {
          doc.addPage();
        }

        doc
          .font(FONTS.regular)
          .fontSize(10)
          .fillColor(COLORS.text)
          .text(
            `${index}. ${rsvp.members.lastName}, ${rsvp.members.firstName} - ${rsvp.members.email}${rsvp.members.phone ? ` | ${rsvp.members.phone}` : ''}`
          );
        index++;
      }
    }

    // Footer
    this.addFooter(doc);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  // ==========================================
  // Helper Methods
  // ==========================================

  private addHeader(doc: PDFKit.PDFDocument, title: string): void {
    doc
      .font(FONTS.bold)
      .fontSize(24)
      .fillColor(COLORS.primary)
      .text('Sing Buri Adventist Center', { align: 'center' });

    doc.moveDown(0.5);

    doc.font(FONTS.bold).fontSize(18).fillColor(COLORS.text).text(title, { align: 'center' });
  }

  private addSubtitle(doc: PDFKit.PDFDocument, subtitle: string): void {
    doc
      .font(FONTS.regular)
      .fontSize(11)
      .fillColor(COLORS.muted)
      .text(subtitle, { align: 'center' });
  }

  private addTableHeader(
    doc: PDFKit.PDFDocument,
    y: number,
    columns: Record<string, { x: number; width: number }>
  ): void {
    // Background
    doc.rect(45, y - 5, 520, 20).fill(COLORS.background);

    // Headers
    doc.font(FONTS.bold).fontSize(10).fillColor(COLORS.text);

    if (columns.name) doc.text('Name', columns.name.x, y, { width: columns.name.width });
    if (columns.email) doc.text('Email', columns.email.x, y, { width: columns.email.width });
    if (columns.phone) doc.text('Phone', columns.phone.x, y, { width: columns.phone.width });
    if (columns.role) doc.text('Role', columns.role.x, y, { width: columns.role.width });

    // Border
    doc
      .strokeColor(COLORS.border)
      .lineWidth(1)
      .moveTo(45, y + 15)
      .lineTo(565, y + 15)
      .stroke();
  }

  private addFooter(doc: PDFKit.PDFDocument): void {
    const pageCount = doc.bufferedPageRange().count;

    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);

      doc
        .font(FONTS.regular)
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(`Page ${i + 1} of ${pageCount} | Generated by Church Management App`, 50, 750, {
          align: 'center',
          width: 500,
        });
    }
  }
}

// Export singleton instance
export const reportService = new ReportService();
