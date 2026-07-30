import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { getPastAllenamentoIds, schemaSessionStato } from '@/lib/schemaAllenamenti';

export async function GET(request) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const allenamentoId = searchParams.get('allenamentoId') || undefined;

  const sessions = await prisma.session.findMany({
    where: {
      userId: session.userId,
      ...(allenamentoId ? { allenamentoId } : {}),
    },
    include: { items: { select: { id: true } } },
    orderBy: { creataIl: 'desc' },
  });

  const pastAllenamentoIds = await getPastAllenamentoIds(session.userId);
  const notedSedutaIds = sessions.length
    ? new Set(
        (
          await prisma.note.findMany({
            where: { sedutaId: { in: sessions.map((s) => s.id) } },
            select: { sedutaId: true },
          })
        ).map((n) => n.sedutaId)
      )
    : new Set();

  const withStato = sessions.map((s) => ({
    ...s,
    stato: schemaSessionStato(s, pastAllenamentoIds),
    hasNote: Boolean(s.note) || notedSedutaIds.has(s.id),
  }));

  return Response.json({ sessions: withStato });
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

  const { titolo, obiettivoId, allenamentoId } = body;
  if (!titolo) return Response.json({ error: 'titolo è obbligatorio' }, { status: 400 });

  const newSession = await prisma.session.create({
    data: {
      userId: session.userId,
      titolo,
      obiettivoId: obiettivoId || null,
      allenamentoId: allenamentoId || null,
    },
  });

  return Response.json({ session: newSession });
}
