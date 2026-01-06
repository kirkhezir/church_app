# Security Audit Checklist

## Overview

This document provides a comprehensive security audit checklist for the Church Management Application. Regular security reviews should be conducted before major releases.

## Audit Date: ******\_******

## Auditor: ******\_******

---

## 1. Authentication & Authorization

### 1.1 Password Security

- [ ] Passwords hashed with bcrypt (cost factor ≥ 10)
- [ ] Password complexity requirements enforced
  - [ ] Minimum 8 characters
  - [ ] At least one uppercase letter
  - [ ] At least one lowercase letter
  - [ ] At least one number
  - [ ] At least one special character
- [ ] Password history prevents reuse (last 5 passwords)
- [ ] Secure password reset flow with expiring tokens
- [ ] No password hints stored

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 1.2 Session Management

- [ ] JWT tokens have appropriate expiration (access: 15m, refresh: 7d)
- [ ] Refresh tokens stored securely (httpOnly cookies)
- [ ] Token revocation on logout
- [ ] Session invalidation on password change
- [ ] Concurrent session limits enforced

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 1.3 Multi-Factor Authentication (MFA)

- [ ] TOTP-based MFA implementation
- [ ] MFA required for admin/staff accounts
- [ ] Backup codes generated securely
- [ ] MFA bypass prevention
- [ ] Rate limiting on MFA verification

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 1.4 Account Protection

- [ ] Account lockout after 5 failed attempts
- [ ] Lockout duration (15 minutes)
- [ ] Lockout notification to user
- [ ] CAPTCHA after multiple failures (optional)
- [ ] Login attempt logging

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

---

## 2. Input Validation & Sanitization

### 2.1 Server-Side Validation

- [ ] All inputs validated on server
- [ ] Type checking with Zod schemas
- [ ] Length limits enforced
- [ ] Format validation (email, phone, etc.)
- [ ] Whitelist validation where applicable

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 2.2 SQL Injection Prevention

- [ ] Prisma ORM used (parameterized queries)
- [ ] No raw SQL queries without sanitization
- [ ] Input escaping for any dynamic queries
- [ ] Database user has minimal privileges

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 2.3 XSS Prevention

- [ ] React escapes output by default
- [ ] No dangerouslySetInnerHTML without sanitization
- [ ] Content-Security-Policy headers set
- [ ] Input sanitization for rich text
- [ ] HttpOnly cookies for sensitive data

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 2.4 CSRF Protection

- [ ] SameSite cookie attribute set
- [ ] CSRF tokens for state-changing operations
- [ ] Origin/Referer header validation
- [ ] Double-submit cookie pattern (if applicable)

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

---

## 3. API Security

### 3.1 Rate Limiting

- [ ] Global rate limiting enabled
- [ ] Per-endpoint rate limits for sensitive operations
- [ ] Login: 5 requests/minute
- [ ] General API: 100 requests/minute
- [ ] Report generation: 10 requests/minute

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 3.2 CORS Configuration

- [ ] CORS origin whitelist configured
- [ ] No wildcard (\*) in production
- [ ] Credentials properly handled
- [ ] Preflight requests handled

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 3.3 Request Validation

- [ ] Request size limits enforced
- [ ] File upload size limits
- [ ] File type validation
- [ ] JSON parsing limits

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 3.4 Error Handling

- [ ] Generic error messages to users
- [ ] Detailed errors only in logs
- [ ] No stack traces in production
- [ ] Consistent error response format

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

---

## 4. Data Protection

### 4.1 Sensitive Data Handling

- [ ] PII encrypted at rest
- [ ] Passwords never logged
- [ ] JWT secrets not in code
- [ ] API keys in environment variables
- [ ] No sensitive data in URLs

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 4.2 Data Transmission

- [ ] HTTPS enforced
- [ ] TLS 1.2+ required
- [ ] Secure cipher suites
- [ ] HSTS header set
- [ ] Certificate validation

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 4.3 Data Privacy

- [ ] Privacy settings respected
- [ ] Data minimization in API responses
- [ ] Audit logging for data access
- [ ] Data retention policies implemented
- [ ] Right to deletion supported

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

---

## 5. Infrastructure Security

### 5.1 Security Headers

- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY or SAMEORIGIN
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Strict-Transport-Security (HSTS)
- [ ] Content-Security-Policy
- [ ] Referrer-Policy

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 5.2 Dependencies

- [ ] npm audit run with no high/critical vulnerabilities
- [ ] Dependencies up to date
- [ ] No deprecated packages
- [ ] Lock files committed
- [ ] Automated vulnerability scanning (Snyk/Dependabot)

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 5.3 Environment Security

- [ ] Production secrets not in code
- [ ] .env files in .gitignore
- [ ] Different secrets per environment
- [ ] Secrets rotated regularly
- [ ] No debug mode in production

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 5.4 Container Security (Docker)

- [ ] Non-root user in containers
- [ ] Minimal base images
- [ ] No secrets in Dockerfile
- [ ] Image scanning enabled
- [ ] Resource limits set

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

---

## 6. Logging & Monitoring

### 6.1 Security Logging

- [ ] Authentication events logged
- [ ] Authorization failures logged
- [ ] Admin actions logged (audit trail)
- [ ] Suspicious activity logged
- [ ] Logs don't contain sensitive data

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 6.2 Monitoring

- [ ] Error monitoring (Sentry)
- [ ] Failed login attempt alerts
- [ ] Rate limit breach alerts
- [ ] Health check monitoring
- [ ] Log aggregation configured

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

---

## 7. Access Control

### 7.1 Role-Based Access Control (RBAC)

- [ ] Roles clearly defined (Admin, Staff, Member)
- [ ] Permissions enforced on all endpoints
- [ ] Frontend routes protected
- [ ] Principle of least privilege
- [ ] Role changes audited

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 7.2 Resource Authorization

- [ ] Users can only access own data
- [ ] Admin can access all data
- [ ] Staff has appropriate permissions
- [ ] No horizontal privilege escalation
- [ ] No vertical privilege escalation

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

---

## 8. File Handling

### 8.1 File Uploads

- [ ] File type validation (whitelist)
- [ ] File size limits enforced
- [ ] Virus scanning (if applicable)
- [ ] Secure storage location
- [ ] No executable files allowed

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 8.2 File Downloads

- [ ] Access control on downloads
- [ ] Content-Disposition header set
- [ ] No path traversal vulnerabilities
- [ ] Signed URLs for sensitive files

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

---

## 9. Third-Party Integrations

### 9.1 Email Service (SMTP)

- [ ] TLS for SMTP connection
- [ ] App-specific passwords used
- [ ] Email injection prevention
- [ ] Rate limiting on email sending

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

### 9.2 Push Notifications (VAPID)

- [ ] VAPID keys securely stored
- [ ] Subscription validation
- [ ] Message payload encryption

**Status**: ☐ Pass ☐ Fail ☐ N/A
**Notes**:

---

## 10. Penetration Testing Recommendations

### 10.1 Manual Testing Areas

1. Authentication bypass attempts
2. Session hijacking
3. SQL injection testing
4. XSS testing (stored and reflected)
5. IDOR (Insecure Direct Object Reference)
6. File upload vulnerabilities
7. Rate limit bypass
8. MFA bypass attempts

### 10.2 Automated Scanning Tools

- OWASP ZAP
- Burp Suite
- Nikto
- sqlmap
- nmap

---

## Summary

| Category                       | Pass | Fail | N/A |
| ------------------------------ | ---- | ---- | --- |
| Authentication & Authorization |      |      |     |
| Input Validation               |      |      |     |
| API Security                   |      |      |     |
| Data Protection                |      |      |     |
| Infrastructure Security        |      |      |     |
| Logging & Monitoring           |      |      |     |
| Access Control                 |      |      |     |
| File Handling                  |      |      |     |
| Third-Party Integrations       |      |      |     |

## Critical Findings

1.
2.
3.

## Recommendations

1.
2.
3.

## Sign-off

**Auditor**: ********\_******** **Date**: ******\_******

**Reviewed By**: ********\_******** **Date**: ******\_******

---

_Template Version: 1.0 | Last Updated: January 2026_
