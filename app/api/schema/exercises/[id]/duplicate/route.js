import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

// Duplica un intero esercizio (descrizione/tags/categoria) insieme a TUTTI i suoi livelli
// (disegno, tempi, misure incluse) — a differenza di duplicateFrom su /livelli, che copia un
// solo livello dentro lo stesso esercizio, questa crea un esercizio nuovo e indipendente.
export async function POST(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_esercizi')) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;

  const source = await prisma.exercise.findFirst({
    where: { id, userId: session.userId },
    include: { livelli: { orderBy: { ordine: 'asc' } } },
  });
  if (!source) return Response.json({ error: 'not found' }, { status: 404 });

  const exercise = await prisma.exercise.create({
    data: {
      userId: session.userId,
      descrizione: source.descrizione,
      tags: source.tags,
      categoria: source.categoria,
      livelli: {
        create: source.livelli.map((l) => ({
          nome: l.nome,
          ordine: l.ordine,
          descrizione: l.descrizione,
          schemaCampo: l.schemaCampo,
          ripetizioni: l.ripetizioni,
          durataRipetizione: l.durataRipetizione,
          recuperoSecondi: l.recuperoSecondi,
          titolo: l.ordine === 0 ? l.titolo + ' (copia)' : l.titolo,
          numeroGiocatoriBase: l.numeroGiocatoriBase,
          numeroPortieri: l.numeroPortieri,
          larghezzaCampo: l.larghezzaCampo,
          lunghezzaCampo: l.lunghezzaCampo,
        })),
      },
    },
    include: { livelli: true },
  });

  return Response.json({ exercise });
}
