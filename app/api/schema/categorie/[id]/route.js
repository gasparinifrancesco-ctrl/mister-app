import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

async function ownedCategoria(id, userId) {
  const categoria = await prisma.categoria.findFirst({ where: { id, userId } });
  return categoria;
}

export async function PATCH(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_esercizi')) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;

  const existing = await ownedCategoria(id, session.userId);
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  // "chiave" resta fissa una volta creata: è il valore salvato su Exercise.categoria, quindi
  // rinominare qui cambia solo l'etichetta mostrata, senza dover riscrivere ogni esercizio.
  const data = {};
  if (typeof body.label === 'string' && body.label.trim()) data.label = body.label.trim();
  if (typeof body.color === 'string' && body.color.trim()) data.color = body.color.trim();
  if (Object.keys(data).length === 0) return Response.json({ error: 'nessun campo da aggiornare' }, { status: 400 });

  const categoria = await prisma.categoria.update({ where: { id }, data });
  return Response.json({ categoria });
}

export async function DELETE(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_esercizi')) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;

  const existing = await ownedCategoria(id, session.userId);
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  // Gli esercizi che usavano questa fase tornano "non categorizzati" invece di essere
  // bloccati o cancellati: la fase è una classificazione, non una dipendenza strutturale.
  await prisma.$transaction([
    prisma.exercise.updateMany({
      where: { userId: session.userId, categoria: existing.chiave },
      data: { categoria: '' },
    }),
    prisma.categoria.delete({ where: { id } }),
  ]);

  return Response.json({ ok: true });
}
