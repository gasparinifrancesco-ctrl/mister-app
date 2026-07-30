import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { computeFieldSize, computeLoadIndex } from '@/lib/schemaCalc';

async function loadExercise(id, userId) {
  return prisma.exercise.findFirst({
    where: { id, userId },
    include: {
      obiettivo: true,
      note: { orderBy: { data: 'desc' } },
      valutazioni: { orderBy: { data: 'desc' } },
      utilizzi: { orderBy: { data: 'desc' } },
      versioneDi: { select: { id: true, titolo: true } },
      versioni: { select: { id: true, titolo: true } },
      varianteDi: { select: { id: true, titolo: true } },
      varianti: { select: { id: true, titolo: true } },
    },
  });
}

function withComputed(exercise) {
  const votoMedio = exercise.valutazioni.length
    ? Math.round((exercise.valutazioni.reduce((s, r) => s + r.voto, 0) / exercise.valutazioni.length) * 10) / 10
    : null;
  const minutiTotaliStagione = exercise.utilizzi.reduce((s, u) => s + u.minutiDedicati, 0);
  const indiceCarico = computeLoadIndex({
    objective: exercise.obiettivo,
    larghezzaCampo: exercise.larghezzaCampo,
    lunghezzaCampo: exercise.lunghezzaCampo,
    numeroGiocatoriBase: exercise.numeroGiocatoriBase,
    durataTipica: exercise.durataTipica,
    indiceFatica: exercise.indiceFatica,
  });
  return { ...exercise, votoMedio, minutiTotaliStagione, indiceCarico };
}

export async function GET(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const exercise = await loadExercise(id, session.userId);
  if (!exercise) return Response.json({ error: 'not found' }, { status: 404 });
  return Response.json({ exercise: withComputed(exercise) });
}

export async function PATCH(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.exercise.findFirst({ where: { id, userId: session.userId } });
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const data = {};
  if (typeof body.titolo === 'string') data.titolo = body.titolo;
  if (typeof body.descrizione === 'string') data.descrizione = body.descrizione;
  if (typeof body.durataTipica !== 'undefined') data.durataTipica = Number(body.durataTipica);
  if (typeof body.indiceFatica !== 'undefined') data.indiceFatica = Number(body.indiceFatica);
  if (typeof body.schemaCampo === 'string') data.schemaCampo = body.schemaCampo;
  if (Array.isArray(body.tags)) data.tags = JSON.stringify(body.tags);
  if (typeof body.obiettivoId === 'string') data.obiettivoId = body.obiettivoId;
  if (typeof body.numeroGiocatoriBase !== 'undefined') data.numeroGiocatoriBase = Number(body.numeroGiocatoriBase);

  const manualFieldSize = typeof body.larghezzaCampo !== 'undefined' && typeof body.lunghezzaCampo !== 'undefined';
  if (manualFieldSize) {
    data.larghezzaCampo = Number(body.larghezzaCampo);
    data.lunghezzaCampo = Number(body.lunghezzaCampo);
  } else if (data.obiettivoId || typeof data.numeroGiocatoriBase !== 'undefined') {
    // §5.1: l'override manuale vale finché obiettivo o numero giocatori non cambiano di nuovo.
    const objective = await prisma.objective.findFirst({
      where: { id: data.obiettivoId || existing.obiettivoId, userId: session.userId },
    });
    if (!objective) return Response.json({ error: 'obiettivo non valido' }, { status: 400 });
    const size = computeFieldSize(objective, data.numeroGiocatoriBase ?? existing.numeroGiocatoriBase);
    data.larghezzaCampo = size.larghezzaCampo;
    data.lunghezzaCampo = size.lunghezzaCampo;
  }

  await prisma.exercise.update({ where: { id }, data });
  const exercise = await loadExercise(id, session.userId);
  return Response.json({ exercise: withComputed(exercise) });
}

export async function DELETE(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.exercise.findFirst({ where: { id, userId: session.userId } });
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });
  await prisma.exercise.delete({ where: { id } });
  return Response.json({ ok: true });
}
