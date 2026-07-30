import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';

// Valori tarati sul metodo session-RPE (Foster, applicato al calcio): rpeSuggerito è un
// punto di partenza 1-10 (Borg CR10) per gli obiettivi fisici, loadMin/loadMax sono un
// range realistico di "unità arbitrarie" (RPE × minuti) per una singola seduta con quel
// focus — non un punteggio 0-100, ma un ordine di grandezza osservato nella pratica.
const OBJECTIVE_DEFAULTS = [
  { key: 'forza-esplosivita', label: 'Forza / esplosività', order: 0, categoria: 'fisico', rpeSuggerito: 7, loadMin: 400, loadMax: 650 },
  { key: 'velocita-rapidita', label: 'Velocità / rapidità', order: 1, categoria: 'fisico', rpeSuggerito: 5, loadMin: 150, loadMax: 300 },
  { key: 'tecnica-individuale', label: 'Tecnica individuale', order: 2, categoria: 'tecnico-tattico', rpeSuggerito: null, loadMin: 200, loadMax: 400 },
  { key: 'tecnica-collettiva', label: 'Tecnica collettiva / possesso palla', order: 3, categoria: 'tecnico-tattico', rpeSuggerito: null, loadMin: 200, loadMax: 400 },
  { key: 'tattica-situazionale', label: 'Tattica / situazionale', order: 4, categoria: 'tecnico-tattico', rpeSuggerito: null, loadMin: 250, loadMax: 450 },
  { key: 'resistenza-aerobica', label: 'Resistenza aerobica', order: 5, categoria: 'fisico', rpeSuggerito: 4, loadMin: 200, loadMax: 400 },
  { key: 'recupero-attivo', label: 'Recupero attivo', order: 6, categoria: 'fisico', rpeSuggerito: 2, loadMin: 70, loadMax: 150 },
];

export async function GET() {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const existing = await prisma.objective.count({ where: { userId: session.userId } });
  if (existing === 0) {
    await prisma.objective.createMany({
      data: OBJECTIVE_DEFAULTS.map((o) => ({ ...o, userId: session.userId })),
    });
  }

  const objectives = await prisma.objective.findMany({
    where: { userId: session.userId },
    orderBy: { order: 'asc' },
  });
  return Response.json({ objectives });
}
