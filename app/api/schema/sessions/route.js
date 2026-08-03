import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';
import { getPastAllenamentoIds, schemaSessionStato } from '@/lib/schemaAllenamenti';

export async function GET(request) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'view_allenamenti')) return Response.json({ error: 'forbidden' }, { status: 403 });

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
  const sedutaIds = sessions.map((s) => s.id);
  const [notedSedutaIds, consideratedSedutaIds] = sedutaIds.length
    ? await Promise.all([
        prisma.note.findMany({ where: { sedutaId: { in: sedutaIds } }, select: { sedutaId: true } })
          .then((rows) => new Set(rows.map((n) => n.sedutaId))),
        prisma.considerazione.findMany({ where: { sedutaId: { in: sedutaIds } }, select: { sedutaId: true } })
          .then((rows) => new Set(rows.map((c) => c.sedutaId))),
      ])
    : [new Set(), new Set()];

  const withStato = sessions.map((s) => ({
    ...s,
    stato: schemaSessionStato(s, pastAllenamentoIds),
    hasNote: notedSedutaIds.has(s.id) || consideratedSedutaIds.has(s.id),
  }));

  return Response.json({ sessions: withStato });
}

export async function POST(request) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_sedute')) return Response.json({ error: 'forbidden' }, { status: 403 });

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
