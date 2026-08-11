import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

// Un blocco nasce vuoto (nessun item ancora): non compare nella sequenza della seduta finché
// non gli si assegna almeno un esercizio (POST .../items con blockId), esattamente come un
// esercizio scelto dalla libreria. Non ha un proprio "ordine": la sua posizione è quella dei
// SessionItem che gli appartengono.
export async function POST(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_sedute')) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;

  const existingSession = await prisma.session.findFirst({ where: { id, userId: session.userId } });
  if (!existingSession) return Response.json({ error: 'not found' }, { status: 404 });

  const block = await prisma.sessionBlock.create({ data: { sessionId: id } });
  return Response.json({ block });
}
