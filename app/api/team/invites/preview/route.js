import { findValidInvite } from '@/lib/team';
import { parsePermissions } from '@/lib/permissions';

// Rotta pubblica (chi la chiama non è ancora loggato: sta per registrarsi accettando un
// invito): espone solo email/permessi invitati, mai altro, e solo se il token è valido.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || '';
  const { teamMember, error } = await findValidInvite(token);
  if (error) return Response.json({ error }, { status: 400 });
  return Response.json({ email: teamMember.email, permissions: parsePermissions(teamMember.permissions) });
}
