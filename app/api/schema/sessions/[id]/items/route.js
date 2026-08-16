import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

export async function POST(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_sedute')) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;

  const existingSession = await prisma.session.findFirst({ where: { id, userId: session.userId } });
  if (!existingSession) return Response.json({ error: 'not found' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const { esercizioId, durataMinuti, blockId } = body;
  if (!esercizioId) return Response.json({ error: 'esercizioId è obbligatorio' }, { status: 400 });

  const esercizio = await prisma.exercise.findFirst({ where: { id: esercizioId, userId: session.userId } });
  if (!esercizio) {
    return Response.json({ error: 'esercizio non valido' }, { status: 400 });
  }

  // Item normale: uno slot nuovo in fondo alla seduta. Item di un blocco parallelo (blockId):
  // se il blocco è ancora vuoto, occupa anch'esso uno slot nuovo (primo gruppo); se ha già
  // membri, condivide il loro stesso "ordine" (stesso slot, lavoro in parallelo) invece di
  // aggiungerne uno — nessuna rinumerazione degli item successivi necessaria.
  let ordine, gruppo = null;
  if (blockId) {
    const block = await prisma.sessionBlock.findFirst({ where: { id: blockId, sessionId: id } });
    if (!block) return Response.json({ error: 'blocco non valido' }, { status: 400 });
    const existingMembers = await prisma.sessionItem.findMany({ where: { blockId } });
    if (existingMembers.length === 0) {
      const maxOrdine = await prisma.sessionItem.aggregate({ where: { sessionId: id }, _max: { ordine: true } });
      ordine = (maxOrdine._max.ordine ?? -1) + 1;
      gruppo = 1;
    } else {
      ordine = existingMembers[0].ordine;
      gruppo = Math.max(...existingMembers.map((m) => m.gruppo || 0)) + 1;
    }
  } else {
    const maxOrdine = await prisma.sessionItem.aggregate({ where: { sessionId: id }, _max: { ordine: true } });
    ordine = (maxOrdine._max.ordine ?? -1) + 1;
  }

  const item = await prisma.sessionItem.create({
    data: {
      sessionId: id,
      esercizioId,
      titoloSnapshot: esercizio.titolo,
      ordine,
      durataMinuti: durataMinuti != null && durataMinuti !== '' ? Number(durataMinuti) : null,
      blockId: blockId || null,
      gruppo,
    },
  });

  return Response.json({ item });
}
