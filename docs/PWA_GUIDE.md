# Progressive Web App (PWA) Guide

## Overview

The Church Management App is a Progressive Web App that can be installed on mobile devices and desktops for a native app-like experience.

## Features

### Installability

- Add to home screen on iOS and Android
- Launch without browser chrome
- App icon and splash screen

### Offline Support

- View cached events and announcements
- Queue actions for when back online
- Offline indicator in UI

### Push Notifications

- Event reminders
- New announcement alerts
- Message notifications
- Admin alerts

## Installation Instructions

### iOS (Safari)

1. Open Safari and navigate to the app URL
2. Tap the **Share** button (box with arrow)
3. Scroll down and tap **Add to Home Screen**
4. (Optional) Edit the name
5. Tap **Add**

> Note: iOS requires Safari for PWA installation. Chrome/Firefox on iOS cannot install PWAs.

### Android (Chrome)

1. Open Chrome and navigate to the app URL
2. Tap the **Menu** (three dots) in the top right
3. Tap **Add to Home Screen** or **Install App**
4. Tap **Add** or **Install**

Alternatively, an install prompt may appear automatically at the bottom of the screen.

### Desktop (Chrome/Edge)

1. Open Chrome/Edge and navigate to the app URL
2. Look for the **Install** icon in the address bar (plus sign)
3. Click **Install**

Or:

1. Click the **Menu** (three dots)
2. Click **Install Sing Buri Adventist Center...**

## Offline Functionality

### What Works Offline

| Feature                      | Offline Support     |
| ---------------------------- | ------------------- |
| View cached events           | ✅ Full             |
| View cached announcements    | ✅ Full             |
| View cached member directory | ✅ Full             |
| View profile                 | ✅ Full             |
| Create new event             | 📝 Queued           |
| RSVP to event                | 📝 Queued           |
| Send message                 | 📝 Queued           |
| Login                        | ❌ Requires network |

### Offline Indicator

When offline, you'll see:

- A banner at the top of the screen
- Grayed-out buttons for unavailable actions
- A sync icon when back online

### Data Sync

When you return online:

1. Queued actions are processed automatically
2. A notification shows sync status
3. Failed actions can be retried

## Push Notifications

### Enabling Notifications

1. When prompted, click **Allow** for notifications
2. Or go to **Settings > Notifications** in the app
3. Toggle on desired notification types

### Notification Types

| Type              | Description                       | Default |
| ----------------- | --------------------------------- | ------- |
| Event Reminders   | 24h and 1h before events          | On      |
| New Announcements | When new announcements posted     | On      |
| New Messages      | When you receive a message        | On      |
| Admin Alerts      | System notifications (Admin only) | On      |

### Managing Notifications

In the app:

1. Go to **Settings > Notifications**
2. Toggle notification types on/off
3. Set quiet hours if desired

In your device:

- **iOS**: Settings > Notifications > SBAC
- **Android**: Settings > Apps > SBAC > Notifications

## Troubleshooting

### App Won't Install

**iOS:**

- Make sure you're using Safari
- Clear Safari cache and try again
- Check available storage space

**Android:**

- Make sure you're using Chrome
- Check Chrome is up to date
- Try clearing Chrome cache

### Notifications Not Working

1. Check browser notification permissions
2. Check device notification settings
3. Ensure notifications are enabled in app settings
4. Try re-enabling push notifications

### App Stuck or Slow

1. Close and reopen the app
2. Check your internet connection
3. Clear app cache:
   - **iOS**: Delete and reinstall app
   - **Android**: App Info > Storage > Clear Cache

### Data Not Syncing

1. Check internet connection
2. Pull down to refresh
3. Log out and log back in
4. Wait a few minutes and try again

## Technical Details

### Cache Strategy

- **Static assets**: Cache-first, 7-day expiration
- **API data**: Network-first with 5-minute cache fallback
- **Dynamic content**: Cache-first with background sync

### Storage Limits

| Platform       | Storage Limit      |
| -------------- | ------------------ |
| iOS Safari     | ~50MB              |
| Android Chrome | ~10% of free space |
| Desktop Chrome | ~60% of free space |

### Browser Support

| Browser        | Install | Offline | Push |
| -------------- | ------- | ------- | ---- |
| Safari iOS     | ✅      | ✅      | ❌   |
| Chrome Android | ✅      | ✅      | ✅   |
| Chrome Desktop | ✅      | ✅      | ✅   |
| Edge Desktop   | ✅      | ✅      | ✅   |
| Firefox        | ❌      | ✅      | ✅   |

### Service Worker

The app uses a service worker for:

- Caching static assets
- Offline data access
- Push notification handling
- Background sync

## Updates

The app updates automatically when connected to the internet. You may see a prompt to refresh for the latest version.

To force an update:

1. Close all app windows
2. Clear browser/app cache
3. Reopen the app

---

_Last updated: January 2026_
