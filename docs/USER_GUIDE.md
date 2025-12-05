# Church Management Application - User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Member Features](#member-features)
3. [Admin Features](#admin-features)
4. [Events](#events)
5. [Announcements](#announcements)
6. [Messaging](#messaging)
7. [Security & MFA](#security--mfa)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First-Time Login

1. You will receive a welcome email with your temporary password
2. Navigate to the login page at `https://your-church-app.com/login`
3. Enter your email and temporary password
4. You will be prompted to set a new password

### Password Requirements

Your password must contain:

- At least 8 characters
- One uppercase letter (A-Z)
- One lowercase letter (a-z)
- One number (0-9)
- One special character (!@#$%^&\*)

---

## Member Features

### Dashboard

The dashboard is your home base after logging in. It displays:

- **Welcome Message** - Personalized greeting
- **Upcoming Events** - Events you've RSVP'd to
- **Recent Announcements** - Latest church news
- **Unread Messages** - New messages from other members

### Profile Management

**Viewing Your Profile:**

1. Click your name in the top-right corner
2. Select "Profile" from the dropdown

**Editing Your Profile:**

1. Go to Profile
2. Click "Edit Profile"
3. Update your information:
   - Name
   - Phone number
   - Address
   - Profile photo
4. Click "Save Changes"

### Privacy Settings

Control what other members can see about you:

1. Go to Profile → Privacy Settings
2. Toggle visibility for:
   - **Email** - Show/hide your email in the directory
   - **Phone** - Show/hide your phone number
   - **Address** - Show/hide your address

### Member Directory

Browse and search for other church members:

1. Click "Members" in the sidebar
2. Use the search bar to find specific members
3. Click on a member card to view their profile
4. Contact them via the "Send Message" button

---

## Admin Features

> **Note:** Admin features require Multi-Factor Authentication (MFA) to be enabled.

### Creating New Members

1. Go to Admin → Members
2. Click "Add Member"
3. Fill in the required fields:
   - Email (required)
   - First Name (required)
   - Last Name (required)
   - Role (Member, Staff, or Admin)
4. Check "Send Welcome Email" to email login credentials
5. Click "Create Member"

### Managing Members

**Viewing All Members:**

- Admin → Members shows a list of all church members

**Editing a Member:**

1. Click on a member in the list
2. Click "Edit"
3. Make changes and save

**Deleting a Member:**

1. Click on a member in the list
2. Click "Delete"
3. Confirm the deletion

> ⚠️ **Warning:** Deleting a member is permanent and cannot be undone.

### Audit Logs

Track all administrative actions:

1. Go to Admin → Audit Logs
2. View a chronological list of:
   - Member creations/deletions
   - Role changes
   - Login attempts
   - Security events

### Data Export

Export church data for reporting:

1. Go to Admin → Export Data
2. Select export type:
   - **Members** - CSV of all member data
   - **Events** - CSV of event data with RSVPs
3. Click "Export"
4. Download the generated file

---

## Events

### Viewing Events

**Public Events:**

- Events are visible on the public landing page
- Anyone can view event details

**Full Event Details (Logged In):**

- Additional RSVP functionality
- Attendee lists (if you're attending)
- Event updates and notifications

### Event Categories

| Category      | Description                   |
| ------------- | ----------------------------- |
| 🙏 Worship    | Regular worship services      |
| 👥 Fellowship | Social gatherings and meals   |
| 🌍 Outreach   | Community service events      |
| 👶 Youth      | Youth and children activities |
| 📖 Prayer     | Prayer meetings               |
| ⭐ Special    | Holiday and special events    |

### RSVP to Events

1. Browse to the event you want to attend
2. Click "RSVP"
3. Select your status:
   - **Confirmed** - You're attending
   - **Maybe** - Tentatively attending
4. Enter number of guests (if applicable)
5. Click "Confirm RSVP"

### Managing Your RSVPs

**View Your RSVPs:**

- Dashboard shows upcoming events you've RSVP'd to
- Events → My RSVPs shows all your RSVPs

**Cancel an RSVP:**

1. Go to the event page
2. Click "Cancel RSVP"
3. Confirm cancellation

### Creating Events (Admin/Staff)

1. Go to Events → Create Event
2. Fill in event details:
   - Title
   - Description
   - Date & Time (start and end)
   - Location
   - Category
   - Capacity (optional)
   - Event Image (optional)
3. Click "Create Event"

### Managing Events (Admin/Staff)

**Edit Event:**

1. Go to the event page
2. Click "Edit"
3. Make changes
4. Click "Save"

**Cancel Event:**

1. Go to the event page
2. Click "Cancel Event"
3. Enter cancellation reason
4. All RSVPs will be notified via email

---

## Announcements

### Viewing Announcements

1. Click "Announcements" in the sidebar
2. Browse all current announcements
3. Click on an announcement to read the full content

### Announcement Priority

| Priority  | Description                             |
| --------- | --------------------------------------- |
| 📢 Normal | Standard announcements                  |
| 🚨 Urgent | Triggers immediate email to all members |

### Creating Announcements (Admin/Staff)

1. Go to Announcements → Create
2. Enter:
   - Title
   - Content (rich text supported)
   - Priority (Normal or Urgent)
3. Options:
   - **Save as Draft** - Don't publish yet
   - **Publish** - Make visible immediately
4. Click "Create" or "Save Draft"

### Managing Announcements (Admin/Staff)

**Edit Announcement:**

1. Go to the announcement
2. Click "Edit"
3. Make changes
4. Click "Save"

**Archive Announcement:**

1. Go to the announcement
2. Click "Archive"
3. Announcement moves to archived section

**Delete Announcement:**

1. Go to the announcement
2. Click "Delete"
3. Confirm deletion

### Viewing Analytics (Admin/Staff)

See how many members viewed an announcement:

1. Go to the announcement
2. Click "View Analytics"
3. See view count, unique viewers, and view timeline

---

## Messaging

### Sending Messages

1. Click "Messages" in the sidebar
2. Click "Compose"
3. Select recipient from member list
4. Enter subject and message
5. Click "Send"

### Message Inbox

**View Messages:**

- Messages → Inbox shows received messages
- Unread messages show a blue indicator

**Read a Message:**

1. Click on the message
2. Full content displays
3. Message is marked as read

### Sent Messages

- Messages → Sent shows messages you've sent
- View delivery status

### Deleting Messages

1. Open the message
2. Click "Delete"
3. Message is removed from your inbox/sent

> **Note:** Deleted messages are not removed from the recipient's inbox.

---

## Security & MFA

### Why Use MFA?

Multi-Factor Authentication adds an extra layer of security to your account. Even if someone knows your password, they can't access your account without your authentication code.

### Setting Up MFA

1. Go to Profile → Security
2. Click "Enable MFA"
3. Scan the QR code with your authenticator app:
   - Google Authenticator
   - Microsoft Authenticator
   - Authy
4. Enter the 6-digit code from your app
5. Save your backup codes in a secure location

### Using MFA to Login

1. Enter your email and password
2. When prompted, enter the 6-digit code from your authenticator app
3. Click "Verify"

### Backup Codes

If you lose access to your authenticator app:

1. Use one of your 8 backup codes to login
2. Each code can only be used once
3. Generate new backup codes after using them

**Regenerating Backup Codes:**

1. Go to Profile → Security
2. Click "Regenerate Backup Codes"
3. Save the new codes securely

### Disabling MFA

1. Go to Profile → Security
2. Click "Disable MFA"
3. Enter your current MFA code to confirm
4. MFA is disabled

> ⚠️ **Warning:** Admin accounts require MFA to access administrative functions.

---

## Troubleshooting

### I Can't Login

**Check your email address:**

- Make sure you're using the email registered with the church

**Forgot your password:**

1. Click "Forgot Password" on the login page
2. Enter your email
3. Check your email for reset instructions
4. Click the link and set a new password

**Account locked:**

- After 5 failed login attempts, your account is locked for 15 minutes
- Wait and try again, or contact an administrator

### I'm Not Receiving Emails

1. Check your spam/junk folder
2. Add `noreply@your-church-app.com` to your contacts
3. Verify your email address is correct in your profile
4. Contact an administrator if issues persist

### MFA Issues

**Lost access to authenticator app:**

1. Use a backup code to login
2. Disable MFA
3. Set up MFA again with your new device

**Backup codes don't work:**

1. Ensure you're using unused codes
2. Contact an administrator to reset MFA

### Event RSVP Issues

**Can't RSVP:**

- Event may be at capacity (check waitlist option)
- Event may have passed
- You may already be RSVP'd

**Can't cancel RSVP:**

- Some events may not allow cancellation after a certain date
- Contact the event organizer

### General Issues

**Page won't load:**

1. Refresh the page
2. Clear your browser cache
3. Try a different browser
4. Check your internet connection

**Error messages:**

- Note the error message
- Take a screenshot
- Contact an administrator with the details

---

## Getting Help

If you need assistance:

1. **Email:** admin@your-church.com
2. **Phone:** (555) 123-4567
3. **In Person:** Visit the church office during business hours

---

## Keyboard Shortcuts

| Shortcut   | Action        |
| ---------- | ------------- |
| `Ctrl + /` | Open search   |
| `Esc`      | Close dialogs |
| `Enter`    | Submit forms  |

---

_Last updated: December 2024_
