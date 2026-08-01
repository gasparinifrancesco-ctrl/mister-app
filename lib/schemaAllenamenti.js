import 'server-only';
import { prisma } from '@/lib/prisma';
import { getActiveStagione } from '@/lib/stagioni';

// Gli Allenamento di United Carpi vivono in un blob JSON dentro KvEntry (chiave
// "allenamenti", scoped sulla stagione attiva), non in una tabella relazionale: per
// derivare lo stato di una Session Schema dal calendario reale (invece di un flag
// "eseguita" separato che potrebbe disallinearsi) leggiamo quel blob e ne ricaviamo gli
// id con data <= oggi. Le sedute Schema si riferiscono sempre al calendario della
// stagione attiva al momento in cui vengono create.
export async function getPastAllenamentoIds(userId) {
  const stagione = await getActiveStagione(userId);
  const entry = await prisma.kvEntry.findUnique({
    where: { userId_stagioneId_key: { userId, stagioneId: stagione.id, key: 'allenamenti' } },
  });
  if (!entry) return new Set();
  let list;
  try {
    list = JSON.parse(entry.value);
  } catch {
    return new Set();
  }
  if (!Array.isArray(list)) return new Set();
  const oggi = new Date().toISOString().slice(0, 10);
  return new Set(list.filter((a) => a && a.data && a.data <= oggi).map((a) => a.id));
}

// bozza: nessun giorno collegato. programmata: collegata a un giorno futuro.
// eseguita: collegata a un giorno di allenamento già passato (o odierno). Questo stato è
// solo informativo: una seduta eseguita resta comunque modificabile ed eliminabile.
export function schemaSessionStato(session, pastAllenamentoIds) {
  if (!session.allenamentoId) return 'bozza';
  return pastAllenamentoIds.has(session.allenamentoId) ? 'eseguita' : 'programmata';
}
