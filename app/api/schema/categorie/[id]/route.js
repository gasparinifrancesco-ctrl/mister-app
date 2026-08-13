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

  // "chiave" resta fissa una volta creata: è il valore salvato dentro Exercise.categorie, quindi
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

  // Gli esercizi che usavano questa fase la perdono (restando comunque nelle altre fasi
  // eventualmente assegnate) invece di essere bloccati o cancellati: la fase è una
  // classificazione, non una dipendenza strutturale. Stesso pattern già in uso per le
  // etichette (PATCH /api/schema/tags): niente filtro nella query, si scorre e si riscrive
  // solo chi la contiene davvero, perché "categorie" è testo JSON, non una colonna nativa.
  const exercises = await prisma.exercise.findMany({
    where: { userId: session.userId },
    select: { id: true, categorie: true },
  });
  const updates = [];
  for (const e of exercises) {
    let categorie;
    try {
      categorie = JSON.parse(e.categorie || '[]');
    } catch {
      continue;
    }
    if (!Array.isArray(categorie) || !categorie.includes(existing.chiave)) continue;
    updates.push(prisma.exercise.update({
      where: { id: e.id },
      data: { categorie: JSON.stringify(categorie.filter((c) => c !== existing.chiave)) },
    }));
  }
  await prisma.$transaction([...updates, prisma.categoria.delete({ where: { id } })]);

  return Response.json({ ok: true });
}
