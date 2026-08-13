import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

export async function POST(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_esercizi')) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;

  const exercise = await prisma.exercise.findFirst({ where: { id, userId: session.userId } });
  if (!exercise) return Response.json({ error: 'not found' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }
  const testo = String(body.testo || '').trim();
  if (!testo) return Response.json({ error: 'testo obbligatorio' }, { status: 400 });

  const autore = await prisma.user.findUnique({ where: { id: session.actorUserId }, select: { email: true, nome: true, cognome: true } });
  const nomeCompleto = autore && [autore.nome, autore.cognome].filter(Boolean).join(' ');
  const autoreNome = nomeCompleto || (autore ? autore.email : 'sconosciuto');

  const note = await prisma.note.create({
    data: { esercizioId: id, testo, sedutaId: body.sedutaId || null, autoreId: session.actorUserId, autoreNome },
  });
  return Response.json({ note });
}
