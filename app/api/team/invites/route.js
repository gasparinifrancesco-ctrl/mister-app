import { getSession } from '@/lib/dal';
import { requireOwner, isValidPermission, parsePermissions } from '@/lib/permissions';
import { listInvites, createInvite } from '@/lib/team';

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!requireOwner(session)) return Response.json({ error: 'forbidden' }, { status: 403 });

  const invites = await listInvites(session.userId);
  return Response.json({ invites });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!requireOwner(session)) return Response.json({ error: 'forbidden' }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const email = String(body.email || '').trim().toLowerCase();
  const permissions = Array.isArray(body.permissions) ? body.permissions : [];
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'email non valida' }, { status: 400 });
  if (!permissions.every(isValidPermission)) return Response.json({ error: 'permessi non validi' }, { status: 400 });

  const invite = await createInvite({ ownerId: session.userId, email, permissions });
  return Response.json({ invite: { ...invite, permissions: parsePermissions(invite.permissions) } });
}
