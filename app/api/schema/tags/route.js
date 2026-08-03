import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

// Vocabolario libero per allenatore: nessuna etichetta imposta dal sistema, solo l'elenco
// distinto di quelle già usate da questo account, per l'autocompletamento nell'input.
export async function GET() {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'view_allenamenti')) return Response.json({ error: 'forbidden' }, { status: 403 });

  const exercises = await prisma.exercise.findMany({
    where: { userId: session.userId },
    select: { tags: true },
  });

  const set = new Set();
  exercises.forEach((e) => {
    try {
      const tags = JSON.parse(e.tags || '[]');
      if (Array.isArray(tags)) tags.forEach((t) => { if (typeof t === 'string' && t.trim()) set.add(t.trim()); });
    } catch {
      // ignora tag non parsabili
    }
  });

  return Response.json({ tags: [...set].sort((a, b) => a.localeCompare(b)) });
}

// Rinomina o elimina un'etichetta su TUTTI gli esercizi dell'account che la usano: le
// etichette non sono un'entità a sé (solo stringhe dentro Exercise.tags), quindi
// "gestire" un'etichetta significa riscrivere quell'array su ogni esercizio coinvolto.
export async function PATCH(request) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_esercizi')) return Response.json({ error: 'forbidden' }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const from = typeof body.from === 'string' ? body.from.trim() : '';
  const to = typeof body.to === 'string' ? body.to.trim() : '';
  if (!from) return Response.json({ error: '"from" obbligatorio' }, { status: 400 });

  const exercises = await prisma.exercise.findMany({
    where: { userId: session.userId },
    select: { id: true, tags: true },
  });

  let updated = 0;
  for (const e of exercises) {
    let tags;
    try {
      tags = JSON.parse(e.tags || '[]');
    } catch {
      continue;
    }
    if (!Array.isArray(tags) || !tags.includes(from)) continue;
    const next = to
      ? tags.map((t) => (t === from ? to : t))
      : tags.filter((t) => t !== from);
    // Rinominando, due etichette potrebbero confluire sullo stesso esercizio: niente doppioni.
    const deduped = [...new Set(next)];
    await prisma.exercise.update({ where: { id: e.id }, data: { tags: JSON.stringify(deduped) } });
    updated++;
  }

  return Response.json({ ok: true, updated });
}
