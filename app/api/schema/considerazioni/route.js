import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

// GET senza ?sedutaId: elenco delle considerazioni GENERICHE (aperte, non legate a una
// seduta). GET con ?sedutaId=X: solo quelle di quella seduta. Mai le due cose insieme,
// evita di dover filtrare lato client.
export async function GET(request) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'view_allenamenti')) return Response.json({ error: 'forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const sedutaId = searchParams.get('sedutaId');

  const considerazioni = await prisma.considerazione.findMany({
    where: { ownerId: session.userId, sedutaId: sedutaId || null },
    orderBy: { creataIl: 'asc' },
  });
  return Response.json({ considerazioni });
}

export async function POST(request) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'write_considerazioni')) return Response.json({ error: 'forbidden' }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }
  const testo = String(body.testo || '').trim();
  if (!testo) return Response.json({ error: 'testo obbligatorio' }, { status: 400 });

  if (body.sedutaId) {
    const seduta = await prisma.session.findFirst({ where: { id: body.sedutaId, userId: session.userId } });
    if (!seduta) return Response.json({ error: 'seduta non valida' }, { status: 400 });
  }

  const autore = await prisma.user.findUnique({ where: { id: session.actorUserId }, select: { email: true, nome: true, cognome: true } });
  // Nome vero se il profilo è compilato, altrimenti l'email come prima (schemaAutoreShortName
  // lato client gestisce già entrambi i casi troncando solo se trova una '@').
  const nomeCompleto = autore && [autore.nome, autore.cognome].filter(Boolean).join(' ');
  const autoreNome = nomeCompleto || (autore ? autore.email : 'sconosciuto');

  const considerazione = await prisma.considerazione.create({
    data: {
      ownerId: session.userId,
      autoreId: session.actorUserId,
      autoreNome,
      sedutaId: body.sedutaId || null,
      testo,
    },
  });
  return Response.json({ considerazione });
}
