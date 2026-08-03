import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/dal';
import { hasPermission, requireOwner } from '@/lib/permissions';
import { ALLOWED_STORAGE_KEYS, isSeasonScopedKey, getActiveStagione, GLOBAL_STAGIONE_ID } from '@/lib/stagioni';

// Mappa chiave KV → permesso granulare richiesto. 'sidebar-order' non compare: è una
// preferenza personale dell'account, mai stata delegabile ai collaboratori (in lettura
// libera per chiunque abbia sessione, in scrittura resta owner-only, vedi PUT sotto).
const VIEW_PERMISSION_BY_KEY = {
  players: 'view_rosa',
  matches: 'view_calendario',
  allenamenti: 'view_calendario',
  'formazione-default': 'view_formazione',
  'piano-squadra': 'view_piano_squadra',
};
const EDIT_PERMISSION_BY_KEY = {
  players: 'edit_rosa',
  matches: 'edit_calendario',
  allenamenti: 'edit_calendario',
  'formazione-default': 'edit_formazione',
  'piano-squadra': 'edit_piano_squadra',
};

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { key } = await params;
  if (!ALLOWED_STORAGE_KEYS.has(key)) {
    return Response.json({ error: 'unknown key' }, { status: 400 });
  }
  const viewPermission = VIEW_PERMISSION_BY_KEY[key];
  if (viewPermission && !hasPermission(session, viewPermission)) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  let stagioneId = GLOBAL_STAGIONE_ID;
  if (isSeasonScopedKey(key)) {
    const { searchParams } = new URL(request.url);
    const requestedStagioneId = searchParams.get('stagioneId');
    if (requestedStagioneId) {
      // Consultazione in sola lettura dell'archivio: solo GET, e solo se la stagione
      // richiesta appartiene davvero a questo account.
      const owned = await prisma.stagione.findFirst({ where: { id: requestedStagioneId, userId: session.userId } });
      if (!owned) return Response.json({ error: 'stagione non valida' }, { status: 400 });
      stagioneId = owned.id;
    } else {
      stagioneId = (await getActiveStagione(session.userId)).id;
    }
  }

  const row = await prisma.kvEntry.findUnique({ where: { userId_stagioneId_key: { userId: session.userId, stagioneId, key } } });
  return Response.json({ value: row ? row.value : null });
}

export async function PUT(request, { params }) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { key } = await params;
  if (!ALLOWED_STORAGE_KEYS.has(key)) {
    return Response.json({ error: 'unknown key' }, { status: 400 });
  }
  // Scrittura "a blob intero": ogni chiave richiede il permesso edit_* granulare
  // corrispondente. 'sidebar-order' non ha una chiave nella mappa — resta owner-only,
  // mai stata delegabile a un collaboratore.
  const editPermission = EDIT_PERMISSION_BY_KEY[key];
  const allowed = editPermission ? hasPermission(session, editPermission) : requireOwner(session);
  if (!allowed) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }
  if (typeof body.value !== 'string') {
    return Response.json({ error: 'value must be a string' }, { status: 400 });
  }

  // In scrittura non si può mai scegliere la stagione: si scrive sempre e solo su quella
  // attiva. Una stagione chiusa è un archivio di sola lettura.
  const stagioneId = isSeasonScopedKey(key) ? (await getActiveStagione(session.userId)).id : GLOBAL_STAGIONE_ID;

  await prisma.kvEntry.upsert({
    where: { userId_stagioneId_key: { userId: session.userId, stagioneId, key } },
    update: { value: body.value },
    create: { userId: session.userId, stagioneId, key, value: body.value },
  });
  return Response.json({ ok: true });
}
