import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

// Duplica un intero esercizio (disegno, tempi, misure, fasi/focus incluse) come esercizio
// nuovo e indipendente — la modifica di uno non tocca mai l'altro.
export async function POST(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_esercizi')) return Response.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;

  const source = await prisma.exercise.findFirst({ where: { id, userId: session.userId } });
  if (!source) return Response.json({ error: 'not found' }, { status: 404 });

  const exercise = await prisma.exercise.create({
    data: {
      userId: session.userId,
      titolo: source.titolo + ' (copia)',
      descrizione: source.descrizione,
      svolgimento: source.svolgimento,
      vincoli: source.vincoli,
      tags: source.tags,
      categorie: source.categorie,
      schemaCampo: source.schemaCampo,
      ripetizioni: source.ripetizioni,
      durataRipetizione: source.durataRipetizione,
      recuperoSecondi: source.recuperoSecondi,
      numeroGiocatoriBase: source.numeroGiocatoriBase,
      numeroPortieri: source.numeroPortieri,
      larghezzaCampo: source.larghezzaCampo,
      lunghezzaCampo: source.lunghezzaCampo,
      mostraDisegno: source.mostraDisegno,
      tipoEsercitazione: source.tipoEsercitazione,
    },
  });

  return Response.json({ exercise });
}
