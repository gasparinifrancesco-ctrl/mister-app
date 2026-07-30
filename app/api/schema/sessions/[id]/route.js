import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { getPastAllenamentoIds, schemaSessionStato, isSchemaSessionLocked } from '@/lib/schemaAllenamenti';

async function loadSession(id, userId) {
  return prisma.session.findFirst({
    where: { id, userId },
    include: {
      items: {
        orderBy: { ordine: 'asc' },
        include: { livello: { include: { esercizio: true } } },
      },
    },
  });
}

// Carico secondo il metodo session-RPE (Foster): un solo RPE (1-10) per l'intera seduta,
// moltiplicato per la durata totale di lavoro pianificata (somma dei singoli esercizi).
// Nessun calcolo per-esercizio: il carico è sempre e solo una proprietà della seduta.
async function withComputed(sessionRow, userId) {
  if (!sessionRow) return sessionRow;
  const durataTotale = sessionRow.items.reduce((s, item) => {
    // Il livello può non esistere più (esercizio eliminato dopo l'uso): in quel caso
    // conta solo la durata già salvata su questo item, senza una durata tipica di fallback.
    const durataTipica = item.livello ? item.livello.ripetizioni * item.livello.durataRipetizione : 0;
    return s + (item.durataMinuti ?? durataTipica);
  }, 0);
  const caricoTotale = sessionRow.rpe != null ? sessionRow.rpe * durataTotale : null;
  const pastAllenamentoIds = await getPastAllenamentoIds(userId);
  const stato = schemaSessionStato(sessionRow, pastAllenamentoIds);
  const hasNoteOnItems = await prisma.note.count({ where: { sedutaId: sessionRow.id } });
  const hasNote = Boolean(sessionRow.note) || hasNoteOnItems > 0;
  return { ...sessionRow, durataTotale, caricoTotale, stato, hasNote };
}

export async function GET(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const row = await loadSession(id, session.userId);
  if (!row) return Response.json({ error: 'not found' }, { status: 404 });
  let obiettivo = null;
  if (row.obiettivoId) obiettivo = await prisma.objective.findFirst({ where: { id: row.obiettivoId, userId: session.userId } });
  return Response.json({ session: { ...(await withComputed(row, session.userId)), obiettivo } });
}

export async function PATCH(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.session.findFirst({ where: { id, userId: session.userId } });
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const locked = await isSchemaSessionLocked(existing, session.userId);
  if (locked) {
    const disallowed = ['titolo', 'obiettivoId', 'allenamentoId'].some((k) => typeof body[k] !== 'undefined');
    if (disallowed) {
      return Response.json({ error: 'La seduta è già stata svolta: puoi modificare solo RPE e note.' }, { status: 400 });
    }
  }

  const data = {};
  if (typeof body.note === 'string') data.note = body.note;
  if (typeof body.rpe !== 'undefined') data.rpe = body.rpe === null || body.rpe === '' ? null : Number(body.rpe);
  if (!locked) {
    if (typeof body.titolo === 'string') data.titolo = body.titolo;
    if (typeof body.obiettivoId !== 'undefined') data.obiettivoId = body.obiettivoId || null;
    if (typeof body.allenamentoId !== 'undefined') data.allenamentoId = body.allenamentoId || null;
  }

  await prisma.session.update({ where: { id }, data });
  const row = await loadSession(id, session.userId);
  let obiettivo = null;
  if (row.obiettivoId) obiettivo = await prisma.objective.findFirst({ where: { id: row.obiettivoId, userId: session.userId } });
  return Response.json({ session: { ...(await withComputed(row, session.userId)), obiettivo } });
}

export async function DELETE(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.session.findFirst({ where: { id, userId: session.userId } });
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });
  await prisma.session.delete({ where: { id } });
  return Response.json({ ok: true });
}
