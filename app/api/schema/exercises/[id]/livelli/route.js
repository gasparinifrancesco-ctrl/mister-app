import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

// Una progressione (A/B/C...) è un nuovo livello dello STESSO esercizio, non un esercizio
// separato: eredita dimensioni/tag dall'esercizio padre, ma ha il proprio disegno campo,
// descrizione e struttura ripetizioni/durata/recupero.
export async function POST(request, { params }) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_esercizi')) return Response.json({ error: 'forbidden' }, { status: 403 });
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

  // Titolo/N.giocatori/misure campo: se è una duplicazione (base presente) si copiano dal
  // livello di partenza; altrimenti li manda il client (di norma pre-compilati con i valori
  // del livello attualmente aperto, così "+ Livello vuoto" non parte da un campo 0x0 senza
  // giocatori) — sempre modificabili in seguito senza incidere sul livello di origine.
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
      titolo: base ? base.titolo : (typeof body.titolo === 'string' && body.titolo.trim() ? body.titolo.trim() : ''),
      numeroGiocatoriBase: base ? base.numeroGiocatoriBase : (body.numeroGiocatoriBase ? Number(body.numeroGiocatoriBase) : 8),
      numeroPortieri: base ? base.numeroPortieri : (body.numeroPortieri ? Number(body.numeroPortieri) : 0),
      larghezzaCampo: base ? base.larghezzaCampo : (body.larghezzaCampo ? Number(body.larghezzaCampo) : 20),
      lunghezzaCampo: base ? base.lunghezzaCampo : (body.lunghezzaCampo ? Number(body.lunghezzaCampo) : 28),
    },
  });

  return Response.json({ livello });
}
