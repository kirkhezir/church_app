# User Acceptance Testing (UAT) Guide

## Overview

This guide provides test scenarios for church administrators and staff to validate the application functionality before production deployment.

## UAT Testers

| Role   | Name   | Email   | Assigned Modules               |
| ------ | ------ | ------- | ------------------------------ |
| Admin  | [Name] | [Email] | All modules                    |
| Staff  | [Name] | [Email] | Events, Announcements, Members |
| Member | [Name] | [Email] | Events, Messages, Profile      |

## Test Credentials (Staging)

| Role  | Email                        | Password  |
| ----- | ---------------------------- | --------- |
| Admin | admin@singburi-adventist.org | Admin123! |
| Staff | staff@singburi-adventist.org | Staff123! |

---

## Test Scenarios

### Module 1: Authentication

#### TC-AUTH-001: Login Flow

**Precondition**: User has valid credentials

| Step | Action                      | Expected Result         |
| ---- | --------------------------- | ----------------------- |
| 1    | Navigate to login page      | Login form displayed    |
| 2    | Enter valid email           | Email accepted          |
| 3    | Enter valid password        | Password accepted       |
| 4    | Click "Sign In"             | Redirected to dashboard |
| 5    | Verify user name in sidebar | Correct name displayed  |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

#### TC-AUTH-002: MFA Verification (Admin/Staff)

**Precondition**: User has MFA enabled

| Step | Action                                | Expected Result               |
| ---- | ------------------------------------- | ----------------------------- |
| 1    | Login with credentials                | MFA verification screen shown |
| 2    | Enter 6-digit code from authenticator | Code accepted                 |
| 3    | Click "Verify"                        | Redirected to dashboard       |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

#### TC-AUTH-003: Password Reset

**Precondition**: User exists in system

| Step | Action                            | Expected Result            |
| ---- | --------------------------------- | -------------------------- |
| 1    | Click "Forgot Password"           | Password reset form shown  |
| 2    | Enter registered email            | Form accepted              |
| 3    | Click "Send Reset Link"           | Success message shown      |
| 4    | Check email (mailhog for staging) | Reset email received       |
| 5    | Click reset link                  | Password change form shown |
| 6    | Enter new password                | Password updated           |
| 7    | Login with new password           | Login successful           |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

#### TC-AUTH-004: Logout

| Step | Action                      | Expected Result          |
| ---- | --------------------------- | ------------------------ |
| 1    | Click user menu             | Menu dropdown appears    |
| 2    | Click "Logout"              | Redirected to login page |
| 3    | Try accessing dashboard URL | Redirected to login      |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

---

### Module 2: Dashboard

#### TC-DASH-001: Dashboard Display

| Step | Action                       | Expected Result            |
| ---- | ---------------------------- | -------------------------- |
| 1    | Login as member              | Dashboard loads            |
| 2    | Verify welcome message       | Shows user's name          |
| 3    | Check upcoming events widget | Events displayed           |
| 4    | Check announcements widget   | Recent announcements shown |
| 5    | Check profile card           | User info correct          |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

---

### Module 3: Events

#### TC-EVENT-001: View Events List

| Step | Action                  | Expected Result             |
| ---- | ----------------------- | --------------------------- |
| 1    | Navigate to Events      | Events list displayed       |
| 2    | Check event cards       | Shows title, date, location |
| 3    | Switch to Calendar view | Calendar with events shown  |
| 4    | Navigate to next month  | Calendar updates            |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

#### TC-EVENT-002: Create Event (Staff/Admin)

| Step | Action                  | Expected Result                    |
| ---- | ----------------------- | ---------------------------------- |
| 1    | Click "Create Event"    | Event form displayed               |
| 2    | Fill in required fields | Form validates                     |
| 3    | Click "Create Event"    | Event created, redirect to details |
| 4    | Verify event in list    | New event appears                  |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

#### TC-EVENT-003: RSVP to Event

| Step | Action               | Expected Result                 |
| ---- | -------------------- | ------------------------------- |
| 1    | View event details   | Details page shown              |
| 2    | Click "RSVP" button  | Confirmation dialog             |
| 3    | Confirm RSVP         | Success message, button changes |
| 4    | Check attendee count | Count increased                 |
| 5    | View attendee list   | Your name appears               |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

#### TC-EVENT-004: Cancel RSVP

| Step | Action               | Expected Result              |
| ---- | -------------------- | ---------------------------- |
| 1    | View RSVP'd event    | "Cancel RSVP" button visible |
| 2    | Click "Cancel RSVP"  | Confirmation dialog          |
| 3    | Confirm cancellation | Success message              |
| 4    | Check attendee count | Count decreased              |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

#### TC-EVENT-005: Edit Event (Staff/Admin)

| Step | Action               | Expected Result       |
| ---- | -------------------- | --------------------- |
| 1    | View own event       | "Edit" button visible |
| 2    | Click "Edit"         | Edit form pre-filled  |
| 3    | Modify event details | Changes saved         |
| 4    | Verify changes       | Updates reflected     |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

---

### Module 4: Announcements

#### TC-ANN-001: View Announcements

| Step | Action                    | Expected Result              |
| ---- | ------------------------- | ---------------------------- |
| 1    | Navigate to Announcements | Announcements list displayed |
| 2    | Check unread badge        | Badge shows on unread items  |
| 3    | Click announcement        | Full content shown           |
| 4    | Return to list            | Item marked as read          |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

#### TC-ANN-002: Create Announcement (Staff/Admin)

| Step | Action                      | Expected Result                |
| ---- | --------------------------- | ------------------------------ |
| 1    | Click "Create Announcement" | Form displayed                 |
| 2    | Enter title and content     | Form validates                 |
| 3    | Select priority (Urgent)    | Priority selected              |
| 4    | Click "Publish"             | Announcement created           |
| 5    | Verify in list              | New announcement appears first |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

---

### Module 5: Member Directory

#### TC-MEM-001: View Members

| Step | Action                  | Expected Result        |
| ---- | ----------------------- | ---------------------- |
| 1    | Navigate to Members     | Member list displayed  |
| 2    | Verify privacy controls | Only public info shown |
| 3    | Use search              | Results filtered       |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

#### TC-MEM-002: Advanced Filters

| Step | Action                | Expected Result      |
| ---- | --------------------- | -------------------- |
| 1    | Click "Filters"       | Filter panel expands |
| 2    | Filter by role        | Results filtered     |
| 3    | Filter by date range  | Results filtered     |
| 4    | Sort by name          | Order changes        |
| 5    | Click "Reset Filters" | Filters cleared      |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

#### TC-MEM-003: Export Members (Admin)

| Step | Action                  | Expected Result     |
| ---- | ----------------------- | ------------------- |
| 1    | Select multiple members | Checkboxes selected |
| 2    | Click "Export"          | Download starts     |
| 3    | Open CSV file           | Data correct        |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

---

### Module 6: Messages

#### TC-MSG-001: Send Message

| Step | Action                 | Expected Result    |
| ---- | ---------------------- | ------------------ |
| 1    | Navigate to Messages   | Inbox displayed    |
| 2    | Click "New Message"    | Compose form shown |
| 3    | Select recipient       | Recipient added    |
| 4    | Enter subject and body | Form validates     |
| 5    | Click "Send"           | Message sent       |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

#### TC-MSG-002: Read Message

| Step | Action                         | Expected Result        |
| ---- | ------------------------------ | ---------------------- |
| 1    | View inbox with unread message | Unread badge visible   |
| 2    | Click message                  | Full content shown     |
| 3    | Return to inbox                | Message marked as read |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

---

### Module 7: Profile & Settings

#### TC-PROF-001: Edit Profile

| Step | Action               | Expected Result        |
| ---- | -------------------- | ---------------------- |
| 1    | Navigate to Profile  | Profile page displayed |
| 2    | Click "Edit Profile" | Edit form shown        |
| 3    | Update phone number  | Change accepted        |
| 4    | Click "Save"         | Profile updated        |
| 5    | Verify changes       | New value displayed    |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

#### TC-PROF-002: Privacy Settings

| Step | Action                  | Expected Result        |
| ---- | ----------------------- | ---------------------- |
| 1    | Go to Profile Settings  | Privacy settings shown |
| 2    | Toggle email visibility | Setting saved          |
| 3    | Check member directory  | Email hidden/shown     |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

---

### Module 8: Analytics (Admin/Staff)

#### TC-ANA-001: View Analytics Dashboard

| Step | Action                | Expected Result |
| ---- | --------------------- | --------------- |
| 1    | Navigate to Analytics | Dashboard loads |
| 2    | Verify stats cards    | Data displayed  |
| 3    | Check Attendance tab  | Chart rendered  |
| 4    | Check Growth tab      | Chart rendered  |
| 5    | Check Engagement tab  | Metrics shown   |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

#### TC-ANA-002: Filter Analytics

| Step | Action            | Expected Result |
| ---- | ----------------- | --------------- |
| 1    | Change time range | Data updates    |
| 2    | Click Refresh     | Data reloads    |
| 3    | Click Export      | CSV downloaded  |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

---

### Module 9: Admin Features

#### TC-ADM-001: Manage Members

| Step | Action                | Expected Result         |
| ---- | --------------------- | ----------------------- |
| 1    | Go to Admin > Members | Admin member list shown |
| 2    | Click "Add Member"    | Form displayed          |
| 3    | Create new member     | Member created          |
| 4    | Edit member role      | Role updated            |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

#### TC-ADM-002: Audit Logs

| Step | Action                   | Expected Result  |
| ---- | ------------------------ | ---------------- |
| 1    | Go to Admin > Audit Logs | Logs displayed   |
| 2    | Filter by action type    | Results filtered |
| 3    | Export logs              | CSV downloaded   |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

---

### Module 10: Mobile & PWA

#### TC-MOB-001: Mobile Navigation

| Step | Action                    | Expected Result      |
| ---- | ------------------------- | -------------------- |
| 1    | Open on mobile device     | Mobile layout shown  |
| 2    | Check bottom navigation   | Nav bar visible      |
| 3    | Navigate using bottom nav | Pages load correctly |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

#### TC-MOB-002: PWA Installation

| Step | Action                  | Expected Result      |
| ---- | ----------------------- | -------------------- |
| 1    | Open in mobile browser  | App loads            |
| 2    | Add to home screen      | App icon created     |
| 3    | Launch from home screen | App opens fullscreen |

**Result**: [ ] Pass [ ] Fail  
**Notes**: ******\_\_\_******

---

## Issue Reporting

When reporting issues, please include:

1. **Test Case ID**: e.g., TC-EVENT-002
2. **Summary**: Brief description
3. **Steps to Reproduce**: Detailed steps
4. **Expected Result**: What should happen
5. **Actual Result**: What actually happened
6. **Screenshots**: If applicable
7. **Browser/Device**: e.g., Chrome 120, iPhone 15
8. **Severity**:
   - Critical: Blocks core functionality
   - High: Major feature broken
   - Medium: Feature works with issues
   - Low: Minor cosmetic issues

---

## UAT Sign-off

| Module             | Tested By | Date | Status       |
| ------------------ | --------- | ---- | ------------ |
| Authentication     |           |      | [ ] Approved |
| Dashboard          |           |      | [ ] Approved |
| Events             |           |      | [ ] Approved |
| Announcements      |           |      | [ ] Approved |
| Member Directory   |           |      | [ ] Approved |
| Messages           |           |      | [ ] Approved |
| Profile & Settings |           |      | [ ] Approved |
| Analytics          |           |      | [ ] Approved |
| Admin Features     |           |      | [ ] Approved |
| Mobile & PWA       |           |      | [ ] Approved |

**Final Approval**:

- [ ] All critical issues resolved
- [ ] All high-priority issues resolved or deferred
- [ ] Application ready for production

**Approved By**: ********\_******** **Date**: ********\_********

---

_Document Version: 1.0 | Last Updated: January 2026_
