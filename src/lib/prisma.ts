import { PrismaClient } from '@prisma/client';

// En desarrollo Next.js recarga los módulos en cada cambio. Sin este singleton
// cada recarga abre un pool nuevo y termina agotando las conexiones de Postgres.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
