import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { computeFieldSize } from '@/lib/schemaCalc';

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
  const obiettivoId = searchParams.get('obiettivoId') || undefined;
  const search = searchParams.get('search') || '';

  const exercises = await prisma.exercise.findMany({
    where: {
      userId: session.userId,
      ...(obiettivoId ? { obiettivoId } : {}),
    },
    include: {
      obiettivo: true,
      valutazioni: { select: { voto: true } },
      _count: { select: { versioni: true, varianti: true } },
    },
    orderBy: { creatoIl: 'desc' },
  });

  const filtered = search
    ? exercises.filter((e) => {
        const s = search.toLowerCase();
        const tags = JSON.parse(e.tags || '[]');
        return e.titolo.toLowerCase().includes(s) || tags.some((t) => t.toLowerCase().includes(s));
      })
    : exercises;

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

  const { titolo, descrizione, obiettivoId, numeroGiocatoriBase, durataTipica, indiceFatica, tags } = body;
  if (!titolo || !obiettivoId || !numeroGiocatoriBase) {
    return Response.json({ error: 'titolo, obiettivoId e numeroGiocatoriBase sono obbligatori' }, { status: 400 });
  }

  const objective = await prisma.objective.findFirst({ where: { id: obiettivoId, userId: session.userId } });
  if (!objective) return Response.json({ error: 'obiettivo non valido' }, { status: 400 });

  const { larghezzaCampo, lunghezzaCampo } = computeFieldSize(objective, numeroGiocatoriBase);

  const exercise = await prisma.exercise.create({
    data: {
      userId: session.userId,
      titolo,
      descrizione: descrizione || '',
      obiettivoId,
      numeroGiocatoriBase: Number(numeroGiocatoriBase),
      durataTipica: durataTipica ? Number(durataTipica) : 15,
      indiceFatica: indiceFatica ? Number(indiceFatica) : 3,
      larghezzaCampo,
      lunghezzaCampo,
      tags: JSON.stringify(Array.isArray(tags) ? tags : []),
    },
  });

  return Response.json({ exercise });
}
