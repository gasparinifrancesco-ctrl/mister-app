import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';
import { getActiveStagione } from '@/lib/stagioni';
import { randomUUID } from 'crypto';

// Importare un giocatore da una stagione precedente crea una copia indipendente nella
// stagione attiva (nuovo id): è un giocatore "cresciuto" di categoria, non un riferimento
// condiviso. Modificarlo dopo l'import non tocca la scheda della stagione di origine.
export async function POST(request) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'manage_stagioni')) return Response.json({ error: 'forbidden' }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const { daStagioneId, giocatoreIds } = body;
  if (!daStagioneId || !Array.isArray(giocatoreIds) || !giocatoreIds.length) {
    return Response.json({ error: 'daStagioneId e giocatoreIds sono obbligatori' }, { status: 400 });
  }

  const sourceStagione = await prisma.stagione.findFirst({ where: { id: daStagioneId, userId: session.userId } });
  if (!sourceStagione) return Response.json({ error: 'stagione di origine non valida' }, { status: 400 });

  const activeStagione = await getActiveStagione(session.userId);

  const sourceRow = await prisma.kvEntry.findUnique({
    where: { userId_stagioneId_key: { userId: session.userId, stagioneId: sourceStagione.id, key: 'players' } },
  });
  let sourcePlayers = [];
  try {
    sourcePlayers = sourceRow ? JSON.parse(sourceRow.value) : [];
  } catch {
    sourcePlayers = [];
  }
  if (!Array.isArray(sourcePlayers)) sourcePlayers = [];

  const wanted = new Set(giocatoreIds);
  const toImport = sourcePlayers
    .filter((p) => p && wanted.has(p.id))
    .map((p) => ({ ...p, id: randomUUID() }));

  if (!toImport.length) return Response.json({ error: 'nessun giocatore trovato da importare' }, { status: 400 });

  const activeRow = await prisma.kvEntry.findUnique({
    where: { userId_stagioneId_key: { userId: session.userId, stagioneId: activeStagione.id, key: 'players' } },
  });
  let activePlayers = [];
  try {
    activePlayers = activeRow ? JSON.parse(activeRow.value) : [];
  } catch {
    activePlayers = [];
  }
  if (!Array.isArray(activePlayers)) activePlayers = [];

  const merged = activePlayers.concat(toImport);

  await prisma.kvEntry.upsert({
    where: { userId_stagioneId_key: { userId: session.userId, stagioneId: activeStagione.id, key: 'players' } },
    update: { value: JSON.stringify(merged) },
    create: { userId: session.userId, stagioneId: activeStagione.id, key: 'players', value: JSON.stringify(merged) },
  });

  return Response.json({ importati: toImport, players: merged });
}
