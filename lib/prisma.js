import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis;

// Adapter Neon (HTTP/WebSocket) invece di una connessione TCP diretta: è quello corretto
// per un ambiente serverless come Vercel, dove ogni invocazione di funzione non può tenersi
// aperta una connessione Postgres tradizionale senza esaurire il pool in fretta.
function createPrismaClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
