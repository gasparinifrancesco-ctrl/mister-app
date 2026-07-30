import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/dal';

const ALLOWED_KEYS = new Set(['players', 'matches-2026-27', 'allenamenti-2026-27', 'piano-squadra-2026-27', 'formazione-default-2026-27', 'sidebar-order']);

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { key } = await params;
  if (!ALLOWED_KEYS.has(key)) {
    return Response.json({ error: 'unknown key' }, { status: 400 });
  }
  const row = await prisma.kvEntry.findUnique({ where: { userId_key: { userId: session.userId, key } } });
  return Response.json({ value: row ? row.value : null });
}

export async function PUT(request, { params }) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { key } = await params;
  if (!ALLOWED_KEYS.has(key)) {
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
  await prisma.kvEntry.upsert({
    where: { userId_key: { userId: session.userId, key } },
    update: { value: body.value },
    create: { userId: session.userId, key, value: body.value },
  });
  return Response.json({ ok: true });
}
