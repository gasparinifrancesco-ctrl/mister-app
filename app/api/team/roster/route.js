import { getSession } from '@/lib/dal';
import { getTeamRoster } from '@/lib/team';

// A differenza di /api/team/invites (solo admin, gestisce gli inviti), questa è aperta a
// chiunque abbia una sessione valida sulla squadra: serve al client per risolvere nome e
// colore di chi ha scritto una Considerazione, non per amministrare i collaboratori.
export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const roster = await getTeamRoster(session.userId);
  return Response.json({ roster });
}
