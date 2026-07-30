import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';

// Vocabolario libero per allenatore: nessuna etichetta imposta dal sistema, solo l'elenco
// distinto di quelle già usate da questo account, per l'autocompletamento nell'input.
export async function GET() {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const exercises = await prisma.exercise.findMany({
    where: { userId: session.userId },
    select: { tags: true },
  });

  const set = new Set();
  exercises.forEach((e) => {
    try {
      const tags = JSON.parse(e.tags || '[]');
      if (Array.isArray(tags)) tags.forEach((t) => { if (typeof t === 'string' && t.trim()) set.add(t.trim()); });
    } catch {
      // ignora tag non parsabili
    }
  });

  return Response.json({ tags: [...set].sort((a, b) => a.localeCompare(b)) });
}
