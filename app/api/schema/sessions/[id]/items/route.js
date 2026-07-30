import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { isSchemaSessionLocked } from '@/lib/schemaAllenamenti';

export async function POST(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;

  const existingSession = await prisma.session.findFirst({ where: { id, userId: session.userId } });
  if (!existingSession) return Response.json({ error: 'not found' }, { status: 404 });

  if (await isSchemaSessionLocked(existingSession, session.userId)) {
    return Response.json({ error: 'Seduta già svolta: non è più possibile modificare gli esercizi inclusi.' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const { livelloId, durataMinuti } = body;
  if (!livelloId) return Response.json({ error: 'livelloId è obbligatorio' }, { status: 400 });

  const livello = await prisma.livello.findFirst({ where: { id: livelloId }, include: { esercizio: true } });
  if (!livello || livello.esercizio.userId !== session.userId) {
    return Response.json({ error: 'livello non valido' }, { status: 400 });
  }

  const maxOrdine = await prisma.sessionItem.aggregate({ where: { sessionId: id }, _max: { ordine: true } });
  const ordine = (maxOrdine._max.ordine ?? -1) + 1;

  const item = await prisma.sessionItem.create({
    data: {
      sessionId: id,
      livelloId,
      titoloSnapshot: livello.esercizio.titolo,
      livelloSnapshot: livello.nome,
      ordine,
      durataMinuti: durataMinuti != null && durataMinuti !== '' ? Number(durataMinuti) : null,
    },
  });

  return Response.json({ item });
}
