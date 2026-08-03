import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/dal';
import { requireOwner, isValidPermission, serializePermissions, parsePermissions } from '@/lib/permissions';

async function ownedMember(id, ownerId) {
  return prisma.teamMember.findFirst({ where: { id, ownerId } });
}

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!requireOwner(session)) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;

  const existing = await ownedMember(id, session.userId);
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const data = {};
  if (Array.isArray(body.permissions)) {
    if (!body.permissions.every(isValidPermission)) return Response.json({ error: 'permessi non validi' }, { status: 400 });
    data.permissions = serializePermissions(body.permissions);
  }
  // Revoca sempre soft (mai DELETE, vedi lib/team.js sul perché): riattivare è solo
  // azzerare revokedAt, praticamente gratis con questo modello.
  if (body.revoke === true) data.revokedAt = new Date();
  if (body.reactivate === true) data.revokedAt = null;

  if (Object.keys(data).length === 0) return Response.json({ error: 'nessun campo da aggiornare' }, { status: 400 });

  const teamMember = await prisma.teamMember.update({ where: { id }, data });
  return Response.json({ teamMember: { ...teamMember, permissions: parsePermissions(teamMember.permissions) } });
}
