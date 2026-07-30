import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { getPastAllenamentoIds } from '@/lib/schemaAllenamenti';

async function loadExercise(id, userId, pastAllenamentoIds) {
  return prisma.exercise.findFirst({
    where: { id, userId },
    include: {
      note: { orderBy: { data: 'desc' } },
      valutazioni: { orderBy: { data: 'desc' } },
      livelli: {
        orderBy: { ordine: 'asc' },
        include: {
          // Contano per le statistiche solo gli utilizzi in sedute il cui giorno di
          // allenamento collegato è già passato (stato "eseguita" calcolato dal calendario).
          sessionItems: {
            where: { session: { allenamentoId: { in: [...pastAllenamentoIds] } } },
            select: { durataMinuti: true },
          },
        },
      },
    },
  });
}

function withComputed(exercise) {
  const votoMedio = exercise.valutazioni.length
    ? Math.round((exercise.valutazioni.reduce((s, r) => s + r.voto, 0) / exercise.valutazioni.length) * 10) / 10
    : null;
  let minutiTotaliStagione = 0;
  let utilizzi = 0;
  const livelli = exercise.livelli.map((l) => {
    const durataTipica = l.ripetizioni * l.durataRipetizione;
    l.sessionItems.forEach((si) => {
      minutiTotaliStagione += si.durataMinuti ?? durataTipica;
      utilizzi += 1;
    });
    const { sessionItems, ...rest } = l;
    return rest;
  });
  return { ...exercise, livelli, votoMedio, minutiTotaliStagione, utilizzi };
}

export async function GET(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const pastAllenamentoIds = await getPastAllenamentoIds(session.userId);
  const exercise = await loadExercise(id, session.userId, pastAllenamentoIds);
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
  if (Array.isArray(body.tags)) data.tags = JSON.stringify(body.tags);
  if (typeof body.numeroGiocatoriBase !== 'undefined') data.numeroGiocatoriBase = Number(body.numeroGiocatoriBase);
  if (typeof body.larghezzaCampo !== 'undefined') data.larghezzaCampo = Number(body.larghezzaCampo);
  if (typeof body.lunghezzaCampo !== 'undefined') data.lunghezzaCampo = Number(body.lunghezzaCampo);

  await prisma.exercise.update({ where: { id }, data });
  const pastAllenamentoIds = await getPastAllenamentoIds(session.userId);
  const exercise = await loadExercise(id, session.userId, pastAllenamentoIds);
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
