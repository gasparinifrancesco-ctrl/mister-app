import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

// Duplica una seduta (tipicamente già svolta) su un nuovo giorno: stessi esercizi/livelli/
// durate e lo stesso obiettivo fisico, ma RPE e note ripartono vuoti perché riguardano
// come è andata la seduta originale, non quella nuova.
export async function POST(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_sedute')) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;

  const existing = await prisma.session.findFirst({
    where: { id, userId: session.userId },
    include: { items: { orderBy: { ordine: 'asc' } } },
  });
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const newSession = await prisma.$transaction(async (tx) => {
    const created = await tx.session.create({
      data: {
        userId: session.userId,
        titolo: existing.titolo,
        obiettivoId: existing.obiettivoId,
        allenamentoId: body.allenamentoId || null,
      },
    });
    if (existing.items.length) {
      await tx.sessionItem.createMany({
        data: existing.items.map((item, idx) => ({
          sessionId: created.id,
          livelloId: item.livelloId,
          titoloSnapshot: item.titoloSnapshot,
          livelloSnapshot: item.livelloSnapshot,
          ordine: idx,
          durataMinuti: item.durataMinuti,
        })),
      });
    }
    return created;
  });

  return Response.json({ session: newSession });
}
