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
  datasource: {
    url: env('DATABASE_URL'),
  },
});
