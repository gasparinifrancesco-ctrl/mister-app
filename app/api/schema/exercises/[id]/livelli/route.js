import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';

// Una progressione (A/B/C...) è un nuovo livello dello STESSO esercizio, non un esercizio
// separato: eredita dimensioni/tag dall'esercizio padre, ma ha il proprio disegno campo,
// descrizione e struttura ripetizioni/durata/recupero.
export async function POST(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;

  const exercise = await prisma.exercise.findFirst({ where: { id, userId: session.userId } });
  if (!exercise) return Response.json({ error: 'not found' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const maxOrdine = await prisma.livello.aggregate({ where: { esercizioId: id }, _max: { ordine: true } });
  const ordine = (maxOrdine._max.ordine ?? -1) + 1;
  const nomeDefault = String.fromCharCode('A'.charCodeAt(0) + ordine);

  // Duplicazione: il client può passare duplicateFrom (id di un livello dello stesso
  // esercizio) per usarne disegno/testo/ripetizioni come punto di partenza della
  // progressione, invece di ripartire sempre da un livello vuoto.
  let base = null;
  if (typeof body.duplicateFrom === 'string' && body.duplicateFrom) {
    base = await prisma.livello.findFirst({ where: { id: body.duplicateFrom, esercizioId: id } });
  }

  const livello = await prisma.livello.create({
    data: {
      esercizioId: id,
      nome: typeof body.nome === 'string' && body.nome.trim() ? body.nome.trim() : nomeDefault,
      ordine,
      descrizione: base ? base.descrizione : (typeof body.descrizione === 'string' ? body.descrizione : ''),
      schemaCampo: base ? base.schemaCampo : undefined,
      ripetizioni: base ? base.ripetizioni : undefined,
      durataRipetizione: base ? base.durataRipetizione : undefined,
      recuperoSecondi: base ? base.recuperoSecondi : undefined,
    },
  });

  return Response.json({ livello });
}
