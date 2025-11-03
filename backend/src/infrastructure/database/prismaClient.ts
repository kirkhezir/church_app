import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 * Ensures only one instance of Prisma Client exists throughout the application lifecycle
 */
class PrismaClientSingleton {
  private static instance: PrismaClient | null = null;

  /**
   * Get Prisma Client instance
   */
  static getInstance(): PrismaClient {
    if (!this.instance) {
      this.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    return this.instance;
  }

  /**
   * Disconnect Prisma Client
   */
  static async disconnect(): Promise<void> {
    if (this.instance) {
      await this.instance.$disconnect();
      this.instance = null;
    }
  }
}

export { PrismaClientSingleton };
export const prisma = PrismaClientSingleton.getInstance();
export default prisma;
