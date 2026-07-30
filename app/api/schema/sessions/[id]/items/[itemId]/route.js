import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { isSchemaSessionLocked } from '@/lib/schemaAllenamenti';

async function ownedItem(sessionId, itemId, userId) {
  const item = await prisma.sessionItem.findFirst({
    where: { id: itemId, sessionId },
    include: { session: true },
  });
  if (!item || item.session.userId !== userId) return null;
  return item;
}

export async function PATCH(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { id, itemId } = await params;

  const existing = await ownedItem(id, itemId, session.userId);
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  if (await isSchemaSessionLocked(existing.session, session.userId)) {
    return Response.json({ error: 'Seduta già svolta: non è più possibile modificare gli esercizi inclusi.' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const data = {};
  if (typeof body.ordine !== 'undefined') data.ordine = Number(body.ordine);
  if (typeof body.durataMinuti !== 'undefined') {
    data.durataMinuti = body.durataMinuti === null || body.durataMinuti === '' ? null : Number(body.durataMinuti);
  }

  const item = await prisma.sessionItem.update({ where: { id: itemId }, data });
  return Response.json({ item });
}

export async function DELETE(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { id, itemId } = await params;

  const existing = await ownedItem(id, itemId, session.userId);
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  if (await isSchemaSessionLocked(existing.session, session.userId)) {
    return Response.json({ error: 'Seduta già svolta: non è più possibile modificare gli esercizi inclusi.' }, { status: 400 });
  }

  await prisma.sessionItem.delete({ where: { id: itemId } });
  return Response.json({ ok: true });
}
