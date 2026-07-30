import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';

async function ownedLivello(esercizioId, livelloId, userId) {
  const livello = await prisma.livello.findFirst({
    where: { id: livelloId, esercizioId },
    include: { esercizio: true },
  });
  if (!livello || livello.esercizio.userId !== userId) return null;
  return livello;
}

export async function PATCH(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { id, livelloId } = await params;

  const existing = await ownedLivello(id, livelloId, session.userId);
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const data = {};
  if (typeof body.nome === 'string') data.nome = body.nome;
  if (typeof body.descrizione === 'string') data.descrizione = body.descrizione;
  if (typeof body.schemaCampo === 'string') data.schemaCampo = body.schemaCampo;
  if (typeof body.ripetizioni !== 'undefined') data.ripetizioni = Number(body.ripetizioni);
  if (typeof body.durataRipetizione !== 'undefined') data.durataRipetizione = Number(body.durataRipetizione);
  if (typeof body.recuperoSecondi !== 'undefined') data.recuperoSecondi = Number(body.recuperoSecondi);

  const livello = await prisma.livello.update({ where: { id: livelloId }, data });
  return Response.json({ livello });
}

export async function DELETE(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { id, livelloId } = await params;

  const existing = await ownedLivello(id, livelloId, session.userId);
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  const totalLivelli = await prisma.livello.count({ where: { esercizioId: id } });
  if (totalLivelli <= 1) {
    return Response.json({ error: "Un esercizio deve avere almeno un livello: elimina l'esercizio invece di svuotarlo." }, { status: 400 });
  }

  const usedInSeduta = await prisma.sessionItem.count({ where: { livelloId } });
  if (usedInSeduta > 0) {
    return Response.json({ error: 'Questo livello è usato in almeno una seduta: rimuovilo prima dalla seduta.' }, { status: 400 });
  }

  await prisma.livello.delete({ where: { id: livelloId } });
  return Response.json({ ok: true });
}
