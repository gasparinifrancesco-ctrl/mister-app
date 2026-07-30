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

  const livello = await prisma.livello.create({
    data: {
      esercizioId: id,
      nome: typeof body.nome === 'string' && body.nome.trim() ? body.nome.trim() : nomeDefault,
      ordine,
      descrizione: typeof body.descrizione === 'string' ? body.descrizione : '',
    },
  });

  return Response.json({ livello });
}
