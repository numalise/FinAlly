import { PrismaClient } from '@prisma/client';

// Global singleton for Lambda container reuse
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

/**
 * Get Prisma Client for direct database connection
 * Uses global singleton for Lambda container reuse
 */
export function getPrismaClient(): PrismaClient {
  if (!global.prismaGlobal) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Create client with connection pooling for Lambda
    global.prismaGlobal = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  return global.prismaGlobal;
}

/**
 * Disconnect Prisma (for graceful shutdown)
 */
export async function disconnectPrisma(): Promise<void> {
  if (global.prismaGlobal) {
    await global.prismaGlobal.$disconnect();
    global.prismaGlobal = undefined;
  }
}
