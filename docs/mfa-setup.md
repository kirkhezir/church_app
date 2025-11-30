# Multi-Factor Authentication (MFA) Setup Guide

This guide explains how to set up and manage Multi-Factor Authentication (MFA) for administrator and staff accounts in the Church Management Application.

## 📋 Overview

Multi-Factor Authentication (MFA) provides an additional layer of security for privileged accounts. The system uses Time-based One-Time Password (TOTP) technology, compatible with authenticator apps like:

- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- Any TOTP-compatible app

## 🔐 Who Needs MFA?

MFA is **mandatory** for:

- **Admin accounts** - Full system administrators
- **Staff accounts** - Church staff with elevated privileges

Regular member accounts can optionally enable MFA for enhanced security.

## 📱 Setting Up MFA

### Step 1: Access MFA Enrollment

1. Log in to your account
2. Navigate to **Settings** → **Security** → **Two-Factor Authentication**
3. Click **Enable MFA**

### Step 2: Scan QR Code

1. Open your authenticator app on your mobile device
2. Tap **Add Account** or the **+** button
3. Select **Scan QR Code**
4. Point your camera at the QR code displayed on screen

![MFA QR Code Setup](./images/mfa-qr-setup.png)

> **Manual Entry**: If you cannot scan the QR code, click "Can't scan?" to reveal the secret key for manual entry.

### Step 3: Enter Verification Code

1. Your authenticator app will display a 6-digit code
2. Enter this code in the verification field
3. Click **Verify and Enable**

### Step 4: Save Backup Codes

**IMPORTANT**: After enabling MFA, you will receive 10 backup codes.

1. **Download** or **copy** these codes immediately
2. Store them in a secure location (password manager, safe, etc.)
3. Each code can only be used once
4. These codes allow recovery if you lose your authenticator device

Example backup codes:

```
XXXX-XXXX-XXXX
YYYY-YYYY-YYYY
ZZZZ-ZZZZ-ZZZZ
...
```

## 🔑 Logging In with MFA

### Normal Login Flow

1. Enter your email and password
2. Click **Login**
3. On the MFA screen, enter the 6-digit code from your authenticator app
4. Click **Verify**

### Using Backup Codes

If you don't have access to your authenticator app:

1. Enter your email and password
2. On the MFA screen, click **Use backup code**
3. Enter one of your saved backup codes
4. Click **Verify**

> **Note**: Each backup code can only be used once. Generate new codes after using them.

## ⚙️ Managing MFA

### Regenerating Backup Codes

If you've used several backup codes or lost them:

1. Go to **Settings** → **Security** → **Two-Factor Authentication**
2. Click **Regenerate Backup Codes**
3. Enter your MFA code to confirm
4. Save the new backup codes securely
5. Old backup codes will be invalidated

### Disabling MFA

> ⚠️ **Admin/Staff accounts**: MFA cannot be disabled for security reasons.

For optional MFA accounts:

1. Go to **Settings** → **Security** → **Two-Factor Authentication**
2. Click **Disable MFA**
3. Enter your MFA code or backup code to confirm
4. MFA will be disabled

### Changing Authenticator Device

To move MFA to a new device:

1. Go to **Settings** → **Security** → **Two-Factor Authentication**
2. Click **Reset MFA**
3. Enter your current MFA code or backup code
4. Scan the new QR code with your new device
5. Verify with a code from the new device

## 🆘 Account Recovery

### Lost Authenticator App Access

If you lose access to your authenticator app:

1. Use one of your backup codes to log in
2. Immediately regenerate backup codes or reset MFA

### Lost Backup Codes

If you've lost both your authenticator access AND backup codes:

1. Contact a system administrator
2. Administrator can reset MFA from the admin panel:
   - Navigate to **Admin** → **Member Management**
   - Find the affected account
   - Click **Reset MFA**
3. User will need to re-enroll in MFA

### Administrator MFA Reset Process

For administrators resetting another user's MFA:

1. Go to **Admin** → **Member Management**
2. Search for the user
3. Click **Actions** → **Reset MFA**
4. Confirm the action
5. Notify the user to set up MFA again

## 🛡️ Security Best Practices

### Do's ✅

- Use a reputable authenticator app
- Enable biometric lock on your authenticator app
- Store backup codes in a password manager or secure location
- Regenerate backup codes after using them
- Keep your authenticator app updated

### Don'ts ❌

- Don't share your MFA codes with anyone
- Don't screenshot backup codes (they may sync to cloud)
- Don't store backup codes in email or unencrypted notes
- Don't disable MFA unless absolutely necessary
- Don't use SMS-based 2FA (we use TOTP for security)

## 🔧 Technical Details

### TOTP Specifications

- **Algorithm**: SHA-1
- **Period**: 30 seconds
- **Digits**: 6
- **Issuer**: Sing Buri Adventist Center

### Backup Code Format

- 10 codes generated per enrollment
- Format: `XXXX-XXXX-XXXX`
- Each code is 12 alphanumeric characters
- Codes are hashed before storage (cannot be recovered)

### Time Synchronization

TOTP requires accurate time on both the server and your device:

- Ensure your phone's time is set to automatic
- Server uses NTP for time synchronization
- Up to 30 seconds of clock drift is tolerated

## ❓ Frequently Asked Questions

### Q: Why can't I disable MFA on my admin account?

A: MFA is mandatory for admin/staff accounts to protect sensitive church data. This is a security requirement that cannot be overridden.

### Q: My authenticator code isn't working. What should I do?

A:

1. Check your phone's time is set to automatic
2. Try waiting for the next code (they change every 30 seconds)
3. Use a backup code if the issue persists
4. Contact an administrator for MFA reset if needed

### Q: Can I use the same authenticator account on multiple devices?

A: Most authenticator apps support cloud sync. Check your app's documentation for multi-device setup.

### Q: How often do backup codes expire?

A: Backup codes don't expire until used or until you regenerate new codes.

### Q: What happens if I enter the wrong MFA code?

A: After 5 failed attempts, your account will be temporarily locked for 15 minutes.

## 📞 Support

If you need assistance with MFA:

- **Email**: admin@singburi-adventist.org
- **Phone**: [Church Office Number]
- **In Person**: Visit the church office during business hours

---

_Last updated: November 2025_
