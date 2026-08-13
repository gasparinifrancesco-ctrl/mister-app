import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { requireOwner } from '@/lib/permissions';

export async function DELETE(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { id, noteId } = await params;

  const existing = await prisma.note.findFirst({ where: { id: noteId, esercizioId: id, esercizio: { userId: session.userId } } });
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  // Ognuno può cancellare la propria nota; il vero proprietario può cancellare qualunque,
  // come "responsabile ultimo" dello spazio squadra — stesso criterio di Considerazione.
  if (existing.autoreId !== session.actorUserId && !requireOwner(session)) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  await prisma.note.delete({ where: { id: noteId } });
  return Response.json({ ok: true });
}
