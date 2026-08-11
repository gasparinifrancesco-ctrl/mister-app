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
    include: {
      items: { orderBy: [{ ordine: 'asc' }, { gruppo: 'asc' }] },
      blocchi: true,
    },
  });
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // Gli item condividono lo stesso "ordine" quando fanno parte dello stesso blocco parallelo
  // (stesso slot): si rimappa ogni valore di ordine DISTINTO alla propria nuova posizione
  // compatta, così tutti gli item di uno stesso blocco restano nello stesso slot anche nella
  // copia, invece di rinumerare ogni item singolarmente (che romperebbe il raggruppamento).
  const distinctOrdini = [...new Set(existing.items.map((i) => i.ordine))].sort((a, b) => a - b);
  const ordineMap = new Map(distinctOrdini.map((o, idx) => [o, idx]));

  const newSession = await prisma.$transaction(async (tx) => {
    const created = await tx.session.create({
      data: {
        userId: session.userId,
        titolo: existing.titolo,
        obiettivoId: existing.obiettivoId,
        allenamentoId: body.allenamentoId || null,
      },
    });
    const blockIdMap = new Map();
    for (const b of existing.blocchi) {
      const nb = await tx.sessionBlock.create({ data: { sessionId: created.id, invertono: b.invertono } });
      blockIdMap.set(b.id, nb.id);
    }
    if (existing.items.length) {
      await tx.sessionItem.createMany({
        data: existing.items.map((item) => ({
          sessionId: created.id,
          livelloId: item.livelloId,
          titoloSnapshot: item.titoloSnapshot,
          livelloSnapshot: item.livelloSnapshot,
          ordine: ordineMap.get(item.ordine),
          durataMinuti: item.durataMinuti,
          blockId: item.blockId ? blockIdMap.get(item.blockId) : null,
          gruppo: item.gruppo,
        })),
      });
    }
    return created;
  });

  return Response.json({ session: newSession });
}
