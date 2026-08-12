import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';
import { getActiveStagione } from '@/lib/stagioni';

// Stesso elenco di public/app.js (PRESENZA_STATI): duplicato qui come già avviene per
// altre piccole costanti condivise client/server in questo progetto (es. la palette
// colori delle fasi di allenamento).
const PRESENZA_STATI = new Set(['Disponibile', 'Non disponibile', 'Lavoro differenziato']);

// Endpoint mirato: legge il blob "allenamenti", cambia SOLO presenze[playerId] di UN
// allenamento, riscrive. Mai fidarsi di un blob intero inviato dal client per questo ruolo
// (vedi PUT /api/storage/[key], bloccato per chiunque non sia admin) — qui il server fa
// da solo la lettura-modifica-scrittura, quindi non è possibile alterare nient'altro.
export async function POST(request) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_presenze')) return Response.json({ error: 'forbidden' }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }
  const { allenamentoId, playerId } = body;
  const stato = body.stato;
  if (!allenamentoId || !playerId) return Response.json({ error: 'allenamentoId e playerId sono obbligatori' }, { status: 400 });
  if (!PRESENZA_STATI.has(stato)) return Response.json({ error: 'stato non valido' }, { status: 400 });

  const stagione = await getActiveStagione(session.userId);
  const row = await prisma.kvEntry.findUnique({
    where: { userId_stagioneId_key: { userId: session.userId, stagioneId: stagione.id, key: 'allenamenti' } },
  });
  let allenamenti = [];
  try {
    allenamenti = row ? JSON.parse(row.value) : [];
  } catch {
    allenamenti = [];
  }
  if (!Array.isArray(allenamenti)) allenamenti = [];

  const allenamento = allenamenti.find((a) => a && a.id === allenamentoId);
  if (!allenamento) return Response.json({ error: 'allenamento non trovato' }, { status: 404 });

  if (!allenamento.presenze || typeof allenamento.presenze !== 'object') allenamento.presenze = {};
  allenamento.presenze[playerId] = stato;

  await prisma.kvEntry.upsert({
    where: { userId_stagioneId_key: { userId: session.userId, stagioneId: stagione.id, key: 'allenamenti' } },
    update: { value: JSON.stringify(allenamenti) },
    create: { userId: session.userId, stagioneId: stagione.id, key: 'allenamenti', value: JSON.stringify(allenamenti) },
  });

  return Response.json({ ok: true });
}
