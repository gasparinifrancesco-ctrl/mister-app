import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

// Riordina le fasi di gioco trascinandole nel filtro libreria: riscrive "ordine" su ognuna
// in base alla posizione nell'array ricevuto, stesso campo già usato per l'ordinamento in
// GET /api/schema/categorie.
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

  const ids = Array.isArray(body.ids) ? body.ids : [];
  if (!ids.length) return Response.json({ error: 'ids obbligatorio' }, { status: 400 });

  // Deve essere esattamente l'insieme delle fasi dell'account, nessuna in più o in meno:
  // altrimenti un id di un altro account (o inventato) potrebbe sfuggire al controllo di
  // proprietà facendo comunque parte di un update valido.
  const owned = await prisma.categoria.findMany({ where: { userId: session.userId }, select: { id: true } });
  const ownedIds = new Set(owned.map((c) => c.id));
  if (ids.length !== owned.length || !ids.every((id) => ownedIds.has(id))) {
    return Response.json({ error: 'elenco non valido' }, { status: 400 });
  }

  await prisma.$transaction(ids.map((id, i) => prisma.categoria.update({ where: { id }, data: { ordine: i } })));

  const categorie = await prisma.categoria.findMany({ where: { userId: session.userId }, orderBy: { ordine: 'asc' } });
  return Response.json({ categorie });
}
