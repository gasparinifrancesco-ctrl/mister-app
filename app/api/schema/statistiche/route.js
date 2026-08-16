import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';
import { getActiveStagione } from '@/lib/stagioni';

// Aggregato di stagione, con filtro periodo opzionale (da/a, come il filtro Statistiche
// partite): solo le sedute "eseguite" (collegate a un giorno di allenamento già passato
// nella stagione attiva) contano — una seduta bozza o programmata non è ancora successa.
// Utile per rispondere a "cosa abbiamo lavorato nelle due settimane prima di quella
// partita", non solo alla stagione intera.
export async function GET(request) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'view_allenamenti')) return Response.json({ error: 'forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const da = searchParams.get('da') || null;
  const a = searchParams.get('a') || null;

  const stagione = await getActiveStagione(session.userId);
  const entry = await prisma.kvEntry.findUnique({
    where: { userId_stagioneId_key: { userId: session.userId, stagioneId: stagione.id, key: 'allenamenti' } },
  });
  let list = [];
  if (entry) {
    try {
      const parsed = JSON.parse(entry.value);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      list = [];
    }
  }

  const oggi = new Date().toISOString().slice(0, 10);
  const allenamentoIds = list
    .filter((x) => x && x.data && x.data <= oggi)
    .filter((x) => !da || x.data >= da)
    .filter((x) => !a || x.data <= a)
    .map((x) => x.id);

  if (!allenamentoIds.length) {
    return Response.json({ sedute: 0, items: [] });
  }

  const sessions = await prisma.session.findMany({
    where: { userId: session.userId, allenamentoId: { in: allenamentoIds } },
    include: { items: { include: { esercizio: true } } },
  });

  const items = sessions.flatMap((s) => s.items);
  return Response.json({ sedute: sessions.length, items });
}
