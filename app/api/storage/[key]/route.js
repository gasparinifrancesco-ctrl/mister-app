import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/dal';
import { ALLOWED_STORAGE_KEYS, isSeasonScopedKey, getActiveStagione } from '@/lib/stagioni';

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { key } = await params;
  if (!ALLOWED_STORAGE_KEYS.has(key)) {
    return Response.json({ error: 'unknown key' }, { status: 400 });
  }

  let stagioneId = null;
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
  const stagioneId = isSeasonScopedKey(key) ? (await getActiveStagione(session.userId)).id : null;

  await prisma.kvEntry.upsert({
    where: { userId_stagioneId_key: { userId: session.userId, stagioneId, key } },
    update: { value: body.value },
    create: { userId: session.userId, stagioneId, key, value: body.value },
  });
  return Response.json({ ok: true });
}
