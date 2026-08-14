import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';
import { getPastAllenamentoIds } from '@/lib/schemaAllenamenti';

// Aggregato di stagione: solo le sedute "eseguite" (collegate a un giorno di allenamento
// già passato nella stagione attiva, stesso criterio di schemaSessionStato) contano per la
// composizione del lavoro svolto — una seduta bozza o programmata non è ancora successa.
export async function GET() {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'view_allenamenti')) return Response.json({ error: 'forbidden' }, { status: 403 });

  const pastAllenamentoIds = await getPastAllenamentoIds(session.userId);
  const allenamentoIds = Array.from(pastAllenamentoIds);
  if (!allenamentoIds.length) {
    return Response.json({ sedute: 0, items: [] });
  }

  const sessions = await prisma.session.findMany({
    where: { userId: session.userId, allenamentoId: { in: allenamentoIds } },
    include: { items: { include: { livello: { include: { esercizio: true } } } } },
  });

  const items = sessions.flatMap((s) => s.items);
  return Response.json({ sedute: sessions.length, items });
}
