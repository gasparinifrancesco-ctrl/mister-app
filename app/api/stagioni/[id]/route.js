import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

// Solo l'identità (etichetta/società/tipo/livello) è modificabile, e su qualunque stagione
// (anche chiusa: è per correggere un refuso, non per riaprire l'archivio alla modifica dei
// dati che contiene — quelli restano intoccabili).
export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'manage_stagioni')) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;

  const existing = await prisma.stagione.findFirst({ where: { id, userId: session.userId } });
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const data = {};
  if (typeof body.etichetta === 'string') data.etichetta = body.etichetta;
  if (typeof body.societa === 'string') data.societa = body.societa;
  if (typeof body.tipoSquadra === 'string') data.tipoSquadra = body.tipoSquadra;
  if (typeof body.livello === 'string') data.livello = body.livello;

  const stagione = await prisma.stagione.update({ where: { id }, data });
  return Response.json({ stagione });
}
