import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';

function withVotoMedio(exercise) {
  const { valutazioni, ...rest } = exercise;
  const votoMedio = valutazioni.length
    ? Math.round((valutazioni.reduce((s, r) => s + r.voto, 0) / valutazioni.length) * 10) / 10
    : null;
  return { ...rest, votoMedio, numeroValutazioni: valutazioni.length };
}

export async function GET(request) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const tagsParam = searchParams.get('tags') || '';
  const wantedTags = tagsParam.split(',').map((t) => t.trim()).filter(Boolean);

  const exercises = await prisma.exercise.findMany({
    where: { userId: session.userId },
    include: {
      valutazioni: { select: { voto: true } },
      livelli: { select: { id: true, nome: true, ripetizioni: true, durataRipetizione: true }, orderBy: { ordine: 'asc' } },
    },
    orderBy: { creatoIl: 'desc' },
  });

  let filtered = search
    ? exercises.filter((e) => {
        const s = search.toLowerCase();
        const tags = JSON.parse(e.tags || '[]');
        return e.titolo.toLowerCase().includes(s) || tags.some((t) => t.toLowerCase().includes(s));
      })
    : exercises;

  // Filtro etichette: un esercizio compare se ha ALMENO UNA delle etichette selezionate.
  if (wantedTags.length) {
    filtered = filtered.filter((e) => {
      const tags = JSON.parse(e.tags || '[]');
      return wantedTags.some((wt) => tags.includes(wt));
    });
  }

  return Response.json({ exercises: filtered.map(withVotoMedio) });
}

export async function POST(request) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const { titolo, descrizione, numeroGiocatoriBase, larghezzaCampo, lunghezzaCampo, tags } = body;
  if (!titolo || !numeroGiocatoriBase) {
    return Response.json({ error: 'titolo e numeroGiocatoriBase sono obbligatori' }, { status: 400 });
  }

  // Nessun calcolo automatico dalle dimensioni: un default ragionevole, sempre modificabile.
  const exercise = await prisma.exercise.create({
    data: {
      userId: session.userId,
      titolo,
      descrizione: descrizione || '',
      numeroGiocatoriBase: Number(numeroGiocatoriBase),
      larghezzaCampo: larghezzaCampo ? Number(larghezzaCampo) : 20,
      lunghezzaCampo: lunghezzaCampo ? Number(lunghezzaCampo) : 28,
      tags: JSON.stringify(Array.isArray(tags) ? tags : []),
      livelli: {
        create: [{ nome: 'A', ordine: 0, descrizione: descrizione || '' }],
      },
    },
    include: { livelli: true },
  });

  return Response.json({ exercise });
}
