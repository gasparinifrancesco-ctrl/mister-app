import 'server-only';
import { prisma } from '@/lib/prisma';

const SEASON_SCOPED_KEYS = new Set(['players', 'matches', 'allenamenti', 'piano-squadra', 'formazione-default']);
const GLOBAL_KEYS = new Set(['sidebar-order']);
export const ALLOWED_STORAGE_KEYS = new Set([...SEASON_SCOPED_KEYS, ...GLOBAL_KEYS]);

// Sentinel per le chiavi non legate a una stagione: SQLite/Prisma non ammettono NULL
// dentro una compound unique key usata con findUnique/upsert, quindi si usa '' invece
// di un vero null.
export const GLOBAL_STAGIONE_ID = '';

export function isSeasonScopedKey(key) {
  return SEASON_SCOPED_KEYS.has(key);
}

// Ogni account deve avere sempre una stagione attiva. Se per qualche motivo non esiste
// (account creato prima di questa funzionalità e mai passato dalla migrazione, caso
// difensivo) ne viene creata una di default al volo.
export async function getActiveStagione(userId) {
  let stagione = await prisma.stagione.findFirst({ where: { userId, attiva: true } });
  if (!stagione) {
    stagione = await prisma.stagione.create({
      data: { userId, etichetta: 'Stagione corrente', societa: '', tipoSquadra: '', livello: '', attiva: true },
    });
  }
  return stagione;
}
