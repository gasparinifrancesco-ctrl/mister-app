import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

// Colori pre-verificati per il contrasto col testo scuro dei chip (~7:1, ben oltre il minimo
// AA 4.5:1): stessa palette già in uso per le 7 fasi di partenza, riofferta per le nuove così
// non si rischia di crearne una poco leggibile scegliendo un colore a caso.
const CATEGORIA_COLORI = ['#F2C94C', '#4FA8E0', '#6FCF7A', '#B591DE', '#E67F78', '#E08A4F', '#4FD1C5', '#7FA8C9', '#C9A0DC', '#8FBF6F'];

function slugify(label) {
  return label
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // rimuove accenti (es. "à" -> "a")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'view_allenamenti')) return Response.json({ error: 'forbidden' }, { status: 403 });

  const categorie = await prisma.categoria.findMany({
    where: { userId: session.userId },
    orderBy: { ordine: 'asc' },
  });
  return Response.json({ categorie });
}

export async function POST(request) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_esercizi')) return Response.json({ error: 'forbidden' }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const label = typeof body.label === 'string' ? body.label.trim() : '';
  if (!label) return Response.json({ error: 'label obbligatoria' }, { status: 400 });

  const baseSlug = slugify(label) || 'fase';
  const existing = await prisma.categoria.findMany({ where: { userId: session.userId } });
  const existingChiavi = new Set(existing.map((c) => c.chiave));
  let chiave = baseSlug;
  let n = 2;
  while (existingChiavi.has(chiave)) { chiave = baseSlug + '-' + n; n++; }

  const color = CATEGORIA_COLORI[existing.length % CATEGORIA_COLORI.length];
  const maxOrdine = existing.reduce((m, c) => Math.max(m, c.ordine), -1);

  const categoria = await prisma.categoria.create({
    data: { userId: session.userId, chiave, label, color, ordine: maxOrdine + 1 },
  });
  return Response.json({ categoria });
}
