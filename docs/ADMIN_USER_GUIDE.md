# Admin User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Member Management](#member-management)
4. [Event Management](#event-management)
5. [Announcements](#announcements)
6. [Reports & Analytics](#reports--analytics)
7. [System Administration](#system-administration)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Login

1. Navigate to your church app URL (e.g., `https://yourdomain.com`)
2. Click **Sign In** in the top right corner
3. Enter your admin credentials:
   - Email: Your admin email
   - Password: Your admin password
4. If MFA is enabled, enter your authenticator code

### Setting Up MFA (Recommended)

1. Go to **Profile** → **Security Settings**
2. Click **Enable MFA**
3. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
4. Enter the 6-digit code to verify
5. Save your backup codes in a secure location

---

## Dashboard Overview

The admin dashboard shows key metrics at a glance:

| Metric              | Description               |
| ------------------- | ------------------------- |
| **Total Members**   | Active registered members |
| **Upcoming Events** | Events in the next 7 days |
| **New Messages**    | Unread messages           |
| **Recent Activity** | Latest system actions     |

### Navigation

- **Dashboard** - Overview and quick stats
- **Events** - Event management
- **Announcements** - Church announcements
- **Messages** - Internal messaging
- **Members** - Member directory

**Admin Section:**

- **Admin Panel** - Member management
- **Reports** - Generate reports
- **System Health** - Monitor system status
- **Audit Logs** - Activity history
- **Data Export** - Export church data

---

## Member Management

### Adding a New Member

1. Navigate to **Admin Panel**
2. Click **Add Member**
3. Fill in the required fields:
   - First Name
   - Last Name
   - Email (unique)
   - Role (Member, Staff, Admin)
   - Status (Active, Inactive, Pending)
4. Click **Create Member**

### Editing Member Information

1. Find the member in the list
2. Click the **Edit** button (pencil icon)
3. Update the desired fields
4. Click **Save Changes**

### Changing Member Roles

| Role       | Permissions                         |
| ---------- | ----------------------------------- |
| **Member** | View events, send messages, RSVP    |
| **Staff**  | Create events, manage announcements |
| **Admin**  | Full system access                  |

### Deactivating a Member

1. Find the member
2. Click **Edit**
3. Change status to **Inactive**
4. Click **Save**

> ⚠️ Deactivated members cannot log in but their data is preserved.

---

## Event Management

### Creating an Event

1. Go to **Events**
2. Click **Create Event**
3. Fill in the details:
   - **Title** - Event name
   - **Description** - Full details (supports rich text)
   - **Start Date/Time** - When the event begins
   - **End Date/Time** - When the event ends
   - **Location** - Physical address or "Online"
   - **Max Attendees** - Leave empty for unlimited
   - **Registration Required** - Enable RSVP
4. Click **Create Event**

### Managing RSVPs

1. Open the event
2. Click **View RSVPs**
3. See attendee list with:
   - Member name
   - RSVP status (Going, Maybe, Not Going)
   - RSVP date
4. Export to CSV if needed

### Editing/Canceling Events

- **Edit**: Click the event, then **Edit Event**
- **Cancel**: Click **Cancel Event** (notifies all RSVPs)
- **Delete**: Only for events with no RSVPs

---

## Announcements

### Creating an Announcement

1. Go to **Announcements**
2. Click **Create Announcement**
3. Fill in:
   - **Title** - Clear, attention-grabbing headline
   - **Content** - Full announcement text
   - **Priority** - Normal, Important, Urgent
   - **Audience** - All Members, Staff Only, Admins Only
   - **Publish Date** - Schedule for later or publish now
   - **Expiry Date** - When to hide (optional)
4. Click **Publish** or **Save Draft**

### Priority Levels

| Priority      | Display        | Email           |
| ------------- | -------------- | --------------- |
| **Normal**    | Standard       | No              |
| **Important** | Highlighted    | Yes             |
| **Urgent**    | Banner + Alert | Yes (immediate) |

### Managing Announcements

- **Edit**: Update content at any time
- **Archive**: Hide from view but keep for records
- **Delete**: Permanently remove

---

## Reports & Analytics

### Available Reports

| Report               | Description              | Format   |
| -------------------- | ------------------------ | -------- |
| **Member Directory** | All active members       | PDF, CSV |
| **Event Attendance** | RSVP and attendance data | PDF, CSV |
| **Events Summary**   | Events within date range | PDF      |
| **Announcements**    | Published announcements  | PDF      |

### Generating Reports

1. Go to **Admin** → **Reports**
2. Select the report type
3. Set filters (date range, status, etc.)
4. Click **Download**

### Scheduled Reports

Reports can be scheduled via the CI/CD pipeline:

- Daily member reports
- Weekly event summaries
- Monthly analytics

---

## System Administration

### System Health

Monitor system status at **Admin** → **System Health**:

| Component       | Status Indicators        |
| --------------- | ------------------------ |
| **Database**    | Connection, query times  |
| **Redis Cache** | Connection, memory usage |
| **API Server**  | Response times, errors   |
| **Disk Space**  | Storage capacity         |

### Audit Logs

View all system activity at **Admin** → **Audit Logs**:

- Login attempts (successful/failed)
- Member changes
- Event modifications
- Admin actions

Filter by:

- Date range
- User
- Action type
- Entity type

### Data Export

Export all church data:

1. Go to **Admin** → **Data Export**
2. Select data types:
   - Members
   - Events
   - Announcements
   - Messages
3. Choose format (JSON, CSV)
4. Click **Export**

### Backup Management

Backups are automated but can be triggered manually:

```bash
./scripts/backup-database.sh
```

Check backup status in the admin panel.

---

## Troubleshooting

### Common Issues

#### "Cannot login"

- Check email spelling
- Reset password via "Forgot Password"
- Check if account is active
- Contact system admin if locked out

#### "MFA not working"

- Ensure authenticator time is synced
- Use backup codes if needed
- Admin can reset MFA

#### "Event not showing"

- Check publish date
- Verify status is "Published"
- Clear browser cache

#### "Emails not sending"

- Check SMTP configuration
- Verify email addresses
- Check spam folders

### Getting Help

1. Check this guide first
2. Review [Operations Runbook](./docs/OPERATIONS_RUNBOOK.md)
3. Contact technical support

### Reporting Bugs

1. Note the steps to reproduce
2. Screenshot any error messages
3. Report via GitHub Issues or email

---

## Quick Reference

### Keyboard Shortcuts

| Shortcut   | Action       |
| ---------- | ------------ |
| `Ctrl + K` | Quick search |
| `Ctrl + N` | New item     |
| `Esc`      | Close dialog |

### Status Colors

| Color     | Meaning         |
| --------- | --------------- |
| 🟢 Green  | Active/Healthy  |
| 🟡 Yellow | Warning/Pending |
| 🔴 Red    | Error/Inactive  |
| 🔵 Blue   | Information     |

---

_Last updated: December 2025_
