import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

// Le etichette non sono un'entità a sé (solo stringhe dentro Exercise.tags), quindi non
// hanno una colonna "ordine" come Categoria — l'ordine scelto dall'allenatore (trascinando i
// chip nel filtro libreria) si salva a parte, come blob KV globale (non legato a una
// stagione: è vocabolario dell'account, non dati di una stagione specifica).
const ORDER_KEY = 'focus-order';
const GLOBAL_STAGIONE_ID = '';

async function getTagOrder(userId) {
  const row = await prisma.kvEntry.findUnique({
    where: { userId_stagioneId_key: { userId, stagioneId: GLOBAL_STAGIONE_ID, key: ORDER_KEY } },
  });
  if (!row) return [];
  try {
    const order = JSON.parse(row.value);
    return Array.isArray(order) ? order : [];
  } catch {
    return [];
  }
}

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

  // Ordine salvato per quelle già note, poi le eventuali etichette nuove (mai riordinate,
  // es. appena create) in coda, alfabetiche fra loro — cosi un'etichetta non sparisce mai
  // solo perché non era ancora entrata nell'ordine personalizzato.
  const savedOrder = await getTagOrder(session.userId);
  const ordered = savedOrder.filter((t) => set.has(t));
  const rest = [...set].filter((t) => !savedOrder.includes(t)).sort((a, b) => a.localeCompare(b));

  return Response.json({ tags: [...ordered, ...rest] });
}

// Rinomina/elimina un'etichetta su TUTTI gli esercizi dell'account che la usano (from/to), o
// salva il nuovo ordine scelto trascinando i chip nel filtro libreria (order) — due azioni
// diverse sulla stessa risorsa, distinte dalla forma del body.
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

  if (Array.isArray(body.order)) {
    const order = body.order.filter((t) => typeof t === 'string' && t.trim());
    await prisma.kvEntry.upsert({
      where: { userId_stagioneId_key: { userId: session.userId, stagioneId: GLOBAL_STAGIONE_ID, key: ORDER_KEY } },
      update: { value: JSON.stringify(order) },
      create: { userId: session.userId, stagioneId: GLOBAL_STAGIONE_ID, key: ORDER_KEY, value: JSON.stringify(order) },
    });
    return Response.json({ ok: true });
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
