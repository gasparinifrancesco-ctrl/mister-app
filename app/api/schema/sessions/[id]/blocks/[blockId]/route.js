import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

async function ownedBlock(sessionId, blockId, userId) {
  const block = await prisma.sessionBlock.findFirst({
    where: { id: blockId, sessionId },
    include: { session: true },
  });
  if (!block || block.session.userId !== userId) return null;
  return block;
}

export async function PATCH(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_sedute')) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id, blockId } = await params;

  const existing = await ownedBlock(id, blockId, session.userId);
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const data = {};
  if (typeof body.invertono !== 'undefined') data.invertono = !!body.invertono;

  const block = await prisma.sessionBlock.update({ where: { id: blockId }, data });
  return Response.json({ block });
}

// Elimina l'intero blocco parallelo, compresi tutti i suoi gruppi/esercizi: per rimuovere
// solo UN gruppo mantenendo gli altri si usa invece DELETE sul singolo item (vedi
// app/api/schema/sessions/[id]/items/[itemId]/route.js, che scioglie automaticamente il
// blocco se resta un solo membro).
export async function DELETE(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_sedute')) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id, blockId } = await params;

  const existing = await ownedBlock(id, blockId, session.userId);
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  await prisma.sessionItem.deleteMany({ where: { blockId } });
  await prisma.sessionBlock.delete({ where: { id: blockId } });
  return Response.json({ ok: true });
}
