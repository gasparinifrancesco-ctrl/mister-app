import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';
import { getPastAllenamentoIds } from '@/lib/schemaAllenamenti';

// Filtra invece di rifiutare in blocco: un esercizio può portarsi dietro una chiave ormai
// orfana (fase rinominata/eliminata altrove, o backfill da una vecchia migrazione) — se la
// intera modifica venisse respinta per quella, l'allenatore non riuscirebbe più ad
// aggiungere NESSUNA fase valida finché non ripulisce a mano quella vecchia. Il filtro la
// fa sparire da sola al primo salvataggio, senza bisogno di intervento.
async function sanitizeCategorie(userId, chiavi) {
  if (!chiavi.length) return [];
  const found = await prisma.categoria.findMany({ where: { userId, chiave: { in: chiavi } }, select: { chiave: true } });
  const valid = new Set(found.map((c) => c.chiave));
  return chiavi.filter((c) => valid.has(c));
}

async function loadExercise(id, userId, pastAllenamentoIds) {
  return prisma.exercise.findFirst({
    where: { id, userId },
    include: {
      note: { orderBy: { data: 'desc' } },
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
  return { ...exercise, livelli, minutiTotaliStagione, utilizzi };
}

export async function GET(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'view_allenamenti')) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  const pastAllenamentoIds = await getPastAllenamentoIds(session.userId);
  const exercise = await loadExercise(id, session.userId, pastAllenamentoIds);
  if (!exercise) return Response.json({ error: 'not found' }, { status: 404 });
  return Response.json({ exercise: withComputed(exercise) });
}

export async function PATCH(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_esercizi')) return Response.json({ error: 'forbidden' }, { status: 403 });
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
  if (typeof body.descrizione === 'string') data.descrizione = body.descrizione;
  if (Array.isArray(body.tags)) data.tags = JSON.stringify(body.tags);
  if (Array.isArray(body.categorie)) {
    data.categorie = JSON.stringify(await sanitizeCategorie(session.userId, body.categorie));
  }
  if (typeof body.votoPreferenza !== 'undefined') {
    const voto = body.votoPreferenza === null || body.votoPreferenza === '' ? null : Number(body.votoPreferenza);
    if (voto !== null && (!Number.isInteger(voto) || voto < 1 || voto > 5)) {
      return Response.json({ error: 'votoPreferenza deve essere un intero 1-5' }, { status: 400 });
    }
    data.votoPreferenza = voto;
  }
  if (typeof body.difficolta !== 'undefined') {
    const difficolta = body.difficolta === null || body.difficolta === '' ? null : Number(body.difficolta);
    if (difficolta !== null && (!Number.isInteger(difficolta) || difficolta < 1 || difficolta > 5)) {
      return Response.json({ error: 'difficolta deve essere un intero 1-5' }, { status: 400 });
    }
    data.difficolta = difficolta;
  }

  await prisma.exercise.update({ where: { id }, data });
  const pastAllenamentoIds = await getPastAllenamentoIds(session.userId);
  const exercise = await loadExercise(id, session.userId, pastAllenamentoIds);
  return Response.json({ exercise: withComputed(exercise) });
}

export async function DELETE(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_esercizi')) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  const existing = await prisma.exercise.findFirst({ where: { id, userId: session.userId } });
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });
  await prisma.exercise.delete({ where: { id } });
  return Response.json({ ok: true });
}
