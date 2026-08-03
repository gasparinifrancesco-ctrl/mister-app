import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { requireOwner } from '@/lib/permissions';

export async function DELETE(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.considerazione.findFirst({ where: { id, ownerId: session.userId } });
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  // Ognuno può cancellare la propria considerazione; il vero proprietario può cancellare
  // qualunque, come "responsabile ultimo" dello spazio squadra.
  if (existing.autoreId !== session.actorUserId && !requireOwner(session)) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  await prisma.considerazione.delete({ where: { id } });
  return Response.json({ ok: true });
}
