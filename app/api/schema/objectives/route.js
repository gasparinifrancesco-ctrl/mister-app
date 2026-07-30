import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';

// §5.1/§5.2: valori di partenza tradotti dalle indicazioni qualitative della spec,
// esplicitamente pensati per essere ritoccati dall'allenatore (pannello impostazioni, passo 7).
const OBJECTIVE_DEFAULTS = [
  { key: 'forza-esplosivita', label: 'Forza / esplosività', order: 0, m2PerPlayer: 8, intensityFactor: 1.8, loadMin: 40, loadMax: 70 },
  { key: 'velocita-rapidita', label: 'Velocità / rapidità', order: 1, m2PerPlayer: 25, intensityFactor: 1.7, loadMin: 40, loadMax: 70 },
  { key: 'tecnica-individuale', label: 'Tecnica individuale', order: 2, m2PerPlayer: 15, intensityFactor: 1.0, loadMin: 30, loadMax: 55 },
  { key: 'tecnica-collettiva', label: 'Tecnica collettiva / possesso palla', order: 3, m2PerPlayer: 18, intensityFactor: 1.1, loadMin: 30, loadMax: 55 },
  { key: 'tattica-situazionale', label: 'Tattica / situazionale', order: 4, m2PerPlayer: 30, intensityFactor: 1.2, loadMin: 35, loadMax: 60 },
  { key: 'resistenza-aerobica', label: 'Resistenza aerobica', order: 5, m2PerPlayer: 22, intensityFactor: 1.4, loadMin: 45, loadMax: 75 },
  { key: 'recupero-attivo', label: 'Recupero attivo', order: 6, m2PerPlayer: 35, intensityFactor: 0.4, loadMin: 10, loadMax: 25 },
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
