# Environment Variables Reference

Complete reference for all environment variables used in the Church Management Application.

## Table of Contents

1. [Backend Variables](#backend-variables)
2. [Frontend Variables](#frontend-variables)
3. [Docker/Production Variables](#dockerproduction-variables)
4. [Development vs Production](#development-vs-production)

---

## Backend Variables

### Required Variables

| Variable       | Type   | Description                               | Example                                    |
| -------------- | ------ | ----------------------------------------- | ------------------------------------------ |
| `DATABASE_URL` | String | PostgreSQL connection string              | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET`   | String | Secret key for JWT signing (min 64 chars) | `your-64-char-secret...`                   |
| `NODE_ENV`     | String | Environment mode                          | `development`, `production`, `test`        |

### Authentication

| Variable              | Type   | Default     | Description                      |
| --------------------- | ------ | ----------- | -------------------------------- |
| `JWT_ACCESS_EXPIRY`   | String | `15m`       | Access token expiration          |
| `JWT_REFRESH_EXPIRY`  | String | `7d`        | Refresh token expiration         |
| `MFA_ISSUER`          | String | `ChurchApp` | MFA app display name             |
| `PASSWORD_MIN_LENGTH` | Number | `8`         | Minimum password length          |
| `LOGIN_MAX_ATTEMPTS`  | Number | `5`         | Max failed logins before lockout |
| `LOGIN_LOCKOUT_TIME`  | Number | `900000`    | Lockout duration (ms) - 15 min   |

### Server Configuration

| Variable      | Type    | Default                 | Description                 |
| ------------- | ------- | ----------------------- | --------------------------- |
| `PORT`        | Number  | `3000`                  | Server port                 |
| `HOST`        | String  | `0.0.0.0`               | Server host                 |
| `CORS_ORIGIN` | String  | `http://localhost:5173` | Allowed CORS origins        |
| `API_PREFIX`  | String  | `/api/v1`               | API route prefix            |
| `TRUST_PROXY` | Boolean | `false`                 | Trust reverse proxy headers |

### Database

| Variable               | Type    | Default    | Description                  |
| ---------------------- | ------- | ---------- | ---------------------------- |
| `DATABASE_URL`         | String  | _Required_ | PostgreSQL connection string |
| `DATABASE_POOL_MIN`    | Number  | `2`        | Minimum connections          |
| `DATABASE_POOL_MAX`    | Number  | `10`       | Maximum connections          |
| `DATABASE_LOG_QUERIES` | Boolean | `false`    | Log SQL queries              |

### Redis Cache

| Variable         | Type    | Default                  | Description                 |
| ---------------- | ------- | ------------------------ | --------------------------- |
| `REDIS_ENABLED`  | Boolean | `false`                  | Enable Redis caching        |
| `REDIS_URL`      | String  | `redis://localhost:6379` | Redis connection URL        |
| `REDIS_PASSWORD` | String  | -                        | Redis password              |
| `REDIS_PREFIX`   | String  | `church_app:`            | Cache key prefix            |
| `CACHE_TTL`      | Number  | `3600`                   | Default cache TTL (seconds) |

### Email (SMTP)

| Variable          | Type    | Default          | Description                |
| ----------------- | ------- | ---------------- | -------------------------- |
| `EMAIL_ENABLED`   | Boolean | `true`           | Enable email sending       |
| `SMTP_HOST`       | String  | `smtp.gmail.com` | SMTP server host           |
| `SMTP_PORT`       | Number  | `587`            | SMTP server port           |
| `SMTP_SECURE`     | Boolean | `false`          | Use SSL/TLS                |
| `SMTP_USER`       | String  | -                | SMTP username              |
| `SMTP_PASSWORD`   | String  | -                | SMTP password/app password |
| `SMTP_FROM_NAME`  | String  | `Church App`     | Sender display name        |
| `SMTP_FROM_EMAIL` | String  | -                | Sender email address       |

### Push Notifications

| Variable            | Type   | Default | Description                |
| ------------------- | ------ | ------- | -------------------------- |
| `VAPID_PUBLIC_KEY`  | String | -       | VAPID public key           |
| `VAPID_PRIVATE_KEY` | String | -       | VAPID private key          |
| `VAPID_SUBJECT`     | String | -       | VAPID subject (mailto:...) |

Generate VAPID keys with:

```bash
npx web-push generate-vapid-keys
```

### Error Monitoring

| Variable                    | Type    | Default      | Description               |
| --------------------------- | ------- | ------------ | ------------------------- |
| `SENTRY_ENABLED`            | Boolean | `false`      | Enable Sentry integration |
| `SENTRY_DSN`                | String  | -            | Sentry DSN                |
| `SENTRY_ENVIRONMENT`        | String  | `production` | Sentry environment        |
| `SENTRY_TRACES_SAMPLE_RATE` | Number  | `0.1`        | Transaction sampling rate |

### Logging

| Variable           | Type    | Default  | Description                          |
| ------------------ | ------- | -------- | ------------------------------------ |
| `LOG_LEVEL`        | String  | `info`   | Log level (error, warn, info, debug) |
| `LOG_FORMAT`       | String  | `json`   | Log format (json, simple)            |
| `LOG_FILE_ENABLED` | Boolean | `true`   | Write logs to file                   |
| `LOG_FILE_PATH`    | String  | `./logs` | Log file directory                   |

### Rate Limiting

| Variable               | Type   | Default | Description             |
| ---------------------- | ------ | ------- | ----------------------- |
| `RATE_LIMIT_WINDOW`    | Number | `60000` | Window size (ms)        |
| `RATE_LIMIT_MAX`       | Number | `100`   | Max requests per window |
| `RATE_LIMIT_LOGIN_MAX` | Number | `5`     | Max login attempts      |

---

## Frontend Variables

All frontend variables must be prefixed with `VITE_`.

| Variable                | Type    | Default      | Description                   |
| ----------------------- | ------- | ------------ | ----------------------------- |
| `VITE_API_URL`          | String  | `/api/v1`    | Backend API URL               |
| `VITE_WS_URL`           | String  | -            | WebSocket URL (optional)      |
| `VITE_APP_NAME`         | String  | `Church App` | Application name              |
| `VITE_VAPID_PUBLIC_KEY` | String  | -            | Push notifications public key |
| `VITE_SENTRY_DSN`       | String  | -            | Frontend Sentry DSN           |
| `VITE_ENABLE_ANALYTICS` | Boolean | `false`      | Enable analytics              |
| `VITE_GOOGLE_MAPS_KEY`  | String  | -            | Google Maps API key           |

---

## Docker/Production Variables

### Docker Compose

| Variable         | Type   | Default      | Description       |
| ---------------- | ------ | ------------ | ----------------- |
| `DB_USER`        | String | `church_app` | Database username |
| `DB_PASSWORD`    | String | -            | Database password |
| `DB_NAME`        | String | `church_app` | Database name     |
| `REDIS_PASSWORD` | String | -            | Redis password    |

### Monitoring

| Variable            | Type   | Default                 | Description            |
| ------------------- | ------ | ----------------------- | ---------------------- |
| `GRAFANA_USER`      | String | `admin`                 | Grafana admin username |
| `GRAFANA_PASSWORD`  | String | -                       | Grafana admin password |
| `GRAFANA_URL`       | String | `http://localhost:3002` | Grafana URL            |
| `SLACK_WEBHOOK_URL` | String | -                       | Slack alerts webhook   |

### Backups

| Variable                | Type   | Default     | Description             |
| ----------------------- | ------ | ----------- | ----------------------- |
| `BACKUP_S3_BUCKET`      | String | -           | S3 bucket for backups   |
| `AWS_ACCESS_KEY_ID`     | String | -           | AWS access key          |
| `AWS_SECRET_ACCESS_KEY` | String | -           | AWS secret key          |
| `AWS_REGION`            | String | `us-east-1` | AWS region              |
| `BACKUP_RETENTION_DAYS` | Number | `30`        | Backup retention period |

---

## Development vs Production

### Development (.env)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/church_app_dev
JWT_SECRET=dev-secret-change-in-production-min-64-chars-long-here
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
REDIS_ENABLED=false
EMAIL_ENABLED=false
SENTRY_ENABLED=false
LOG_LEVEL=debug
```

### Production (.env.production)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://church_app:STRONG_PASSWORD@postgres:5432/church_app
JWT_SECRET=<generate-64-char-secret>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=https://yourdomain.com
REDIS_ENABLED=true
REDIS_URL=redis://:REDIS_PASSWORD@redis:6379
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-specific-password
SMTP_FROM_EMAIL=noreply@yourdomain.com
SENTRY_ENABLED=true
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=info
```

### Test (.env.test)

```env
NODE_ENV=test
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/church_app_test
JWT_SECRET=test-secret-for-testing-purposes-only-64-chars-min
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=1d
CORS_ORIGIN=*
REDIS_ENABLED=false
EMAIL_ENABLED=false
SENTRY_ENABLED=false
LOG_LEVEL=error
```

---

## Security Best Practices

### Secrets Generation

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate strong password
openssl rand -base64 32

# Generate VAPID keys
npx web-push generate-vapid-keys
```

### Never Commit

Add to `.gitignore`:

```
.env
.env.local
.env.production
.env.*.local
*.pem
*.key
```

### Validation

The application validates required variables at startup:

- Missing required variables will throw an error
- Invalid formats will be logged as warnings
- Sensitive values are masked in logs

---

_Last updated: December 2025_
