import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';
import { getPastAllenamentoIds, schemaSessionStato } from '@/lib/schemaAllenamenti';

async function loadSession(id, userId) {
  return prisma.session.findFirst({
    where: { id, userId },
    include: {
      items: {
        orderBy: [{ ordine: 'asc' }, { gruppo: 'asc' }],
        include: { esercizio: true, blocco: true },
      },
      considerazioni: { orderBy: { creataIl: 'asc' } },
    },
  });
}

function schemaItemDurata(item) {
  // L'esercizio può non esistere più (eliminato dopo l'uso): in quel caso conta solo la
  // durata già salvata su questo item, senza una durata tipica di fallback.
  const durataTipica = item.esercizio ? item.esercizio.ripetizioni * item.esercizio.durataRipetizione : 0;
  return item.durataMinuti ?? durataTipica;
}

// Carico secondo il metodo session-RPE (Foster): un solo RPE (1-10) per l'intera seduta,
// moltiplicato per la durata totale di lavoro pianificata. Gli item con lo stesso "ordine"
// condividono uno slot: se sono 2+ (un blocco di lavoro parallelo, vedi SessionBlock) NON si
// sommano tra loro, conta solo il più lungo — raddoppiato se il blocco è a gruppi che si
// invertono a metà seduta (blocco.invertono). Un singolo item per slot si comporta come oggi.
async function withComputed(sessionRow, userId) {
  if (!sessionRow) return sessionRow;
  const slots = new Map();
  sessionRow.items.forEach((item) => {
    const arr = slots.get(item.ordine) || [];
    arr.push(item);
    slots.set(item.ordine, arr);
  });
  let durataTotale = 0;
  slots.forEach((group) => {
    if (group.length <= 1) {
      durataTotale += schemaItemDurata(group[0]);
    } else {
      const maxDur = Math.max(...group.map(schemaItemDurata));
      const invertono = group[0].blocco ? group[0].blocco.invertono : false;
      durataTotale += invertono ? maxDur * 2 : maxDur;
    }
  });
  const caricoTotale = sessionRow.rpe != null ? sessionRow.rpe * durataTotale : null;
  const pastAllenamentoIds = await getPastAllenamentoIds(userId);
  const stato = schemaSessionStato(sessionRow, pastAllenamentoIds);
  const hasNoteOnItems = await prisma.note.count({ where: { sedutaId: sessionRow.id } });
  const hasNote = hasNoteOnItems > 0 || sessionRow.considerazioni.length > 0;
  return { ...sessionRow, durataTotale, caricoTotale, stato, hasNote };
}

export async function GET(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'view_allenamenti')) return Response.json({ error: 'forbidden' }, { status: 403 });
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
  if (!hasPermission(session, 'edit_sedute')) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  const existing = await prisma.session.findFirst({ where: { id, userId: session.userId } });
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  // Una seduta resta modificabile anche dopo essere stata svolta: lo stato eseguita/
  // programmata/bozza è solo un'informazione derivata dal calendario, non un blocco.
  const data = {};
  if (typeof body.rpe !== 'undefined') data.rpe = body.rpe === null || body.rpe === '' ? null : Number(body.rpe);
  if (typeof body.titolo === 'string') data.titolo = body.titolo;
  if (typeof body.obiettivoId !== 'undefined') data.obiettivoId = body.obiettivoId || null;
  if (typeof body.allenamentoId !== 'undefined') data.allenamentoId = body.allenamentoId || null;

  await prisma.session.update({ where: { id }, data });
  const row = await loadSession(id, session.userId);
  let obiettivo = null;
  if (row.obiettivoId) obiettivo = await prisma.objective.findFirst({ where: { id: row.obiettivoId, userId: session.userId } });
  return Response.json({ session: { ...(await withComputed(row, session.userId)), obiettivo } });
}

export async function DELETE(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_sedute')) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  const existing = await prisma.session.findFirst({ where: { id, userId: session.userId } });
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });
  await prisma.session.delete({ where: { id } });
  return Response.json({ ok: true });
}
