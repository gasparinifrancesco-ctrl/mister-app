import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

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
  if (!hasPermission(session, 'edit_sedute')) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id, itemId } = await params;

  const existing = await ownedItem(id, itemId, session.userId);
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

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
  if (typeof body.nota !== 'undefined') data.nota = String(body.nota);

  const item = await prisma.sessionItem.update({ where: { id: itemId }, data });
  return Response.json({ item });
}

// Se l'item rimosso è l'unico che ancora tiene in piedi un blocco parallelo (restava un solo
// gruppo su due), il blocco non ha più senso come "lavoro parallelo": il membro superstite
// torna a essere un item sequenziale normale (blockId/gruppo azzerati) e il blocco si elimina,
// invece di lasciare in giro un blocco fantasma con un solo gruppo.
export async function DELETE(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_sedute')) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id, itemId } = await params;

  const existing = await ownedItem(id, itemId, session.userId);
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  const blockId = existing.blockId;
  await prisma.sessionItem.delete({ where: { id: itemId } });

  if (blockId) {
    const remaining = await prisma.sessionItem.findMany({ where: { blockId } });
    if (remaining.length === 1) {
      await prisma.sessionItem.update({ where: { id: remaining[0].id }, data: { blockId: null, gruppo: null } });
      await prisma.sessionBlock.delete({ where: { id: blockId } });
    } else if (remaining.length === 0) {
      await prisma.sessionBlock.delete({ where: { id: blockId } });
    }
  }

  return Response.json({ ok: true });
}
