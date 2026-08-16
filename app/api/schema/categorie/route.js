import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

// Colori pre-verificati per il contrasto col testo scuro dei chip (~7:1, ben oltre il minimo
// AA 4.5:1): stessa palette già in uso per le fasi di partenza, riofferta per le nuove così
// non si rischia di crearne una poco leggibile scegliendo un colore a caso.
const CATEGORIA_COLORI = ['#F2C94C', '#4FA8E0', '#6FCF7A', '#B591DE', '#E67F78', '#E08A4F', '#4FD1C5', '#7FA8C9', '#C9A0DC', '#8FBF6F'];

// Fasi di gioco di partenza per ogni nuovo account: stessa struttura a macro-fasi usata da
// YouCoach (Attacco/Fase difensiva/Calci piazzati/Transizioni), appiattita in voci singole
// perché il nostro modello Categoria è una lista piatta, non a due livelli — ogni voce eredita
// il colore della sua macro-fase cosi il raggruppamento resta leggibile a colpo d'occhio anche
// senza gerarchia vera. Le transizioni positive/negative sono un'unica voce "Transizione" (non
// due) su richiesta esplicita: nella pratica di un allenatore dilettante non si lavorano come
// momenti distinti, essendo il passaggio continuo tra possesso e non possesso. Restano comunque
// solo un punto di partenza: rinominabili, ricolorabili, eliminabili e affiancabili da nuove
// voci come sempre.
const CATEGORIA_DEFAULTS = [
  { label: 'Costruzione dal basso', color: '#6FCF7A' },
  { label: 'Mantenimento e sviluppo', color: '#6FCF7A' },
  { label: 'Finalizzazione', color: '#6FCF7A' },
  { label: 'Prima pressione', color: '#E67F78' },
  { label: 'Blocco medio', color: '#E67F78' },
  { label: 'Blocco basso', color: '#E67F78' },
  { label: "Calci piazzati in fase d'attacco", color: '#B591DE' },
  { label: 'Calci piazzati in fase difensiva', color: '#B591DE' },
  { label: 'Transizione', color: '#F2C94C' },
];

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

  // Seed automatico, stesso pattern di /api/schema/objectives: un account senza fasi proprie
  // (mai personalizzate) parte con lo stesso punto di partenza per tutti, invece che con la
  // lista vuota e il solo "+ Nuova fase" da premere prima di poter categorizzare qualcosa.
  const existing = await prisma.categoria.count({ where: { userId: session.userId } });
  if (existing === 0) {
    await prisma.categoria.createMany({
      data: CATEGORIA_DEFAULTS.map((c, i) => ({
        userId: session.userId, chiave: slugify(c.label), label: c.label, color: c.color, ordine: i,
      })),
    });
  }

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
