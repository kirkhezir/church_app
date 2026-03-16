/**
 * Prisma 7 Configuration
 * https://pris.ly/d/prisma7-client-config
 */

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // the main entry for your schema
  schema: 'prisma/schema.prisma',
  // where migrations should be generated
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  // The database URL
  // Use DIRECT_DATABASE_URL for migrations (bypasses pooler advisory-lock issues);
  // falls back to DATABASE_URL for local dev where a direct URL may not be set separately.
  datasource: {
    url: process.env.DIRECT_DATABASE_URL ?? env('DATABASE_URL'),
  },
});
