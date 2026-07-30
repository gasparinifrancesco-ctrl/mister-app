import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';

export async function POST(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;

  const exercise = await prisma.exercise.findFirst({ where: { id, userId: session.userId } });
  if (!exercise) return Response.json({ error: 'not found' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }
  const voto = Number(body.voto);
  if (!Number.isInteger(voto) || voto < 1 || voto > 5) {
    return Response.json({ error: 'voto deve essere un intero 1-5' }, { status: 400 });
  }

  const rating = await prisma.rating.create({
    data: { esercizioId: id, voto, sedutaId: body.sedutaId || null },
  });
  return Response.json({ rating });
}
