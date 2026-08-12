import { prisma } from '@/lib/prisma';
import { getSchemaSessionOrNull } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';

// Fase di allenamento a scelta vincolata, ma non più una lista fissa: deve corrispondere a
// una Categoria dell'account (o essere '' = non categorizzato).
async function isValidCategoria(userId, categoria) {
  if (!categoria) return true;
  const found = await prisma.categoria.findFirst({ where: { userId, chiave: categoria } });
  return !!found;
}

export async function GET(request) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'view_allenamenti')) return Response.json({ error: 'forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const tagsParam = searchParams.get('tags') || '';
  const wantedTags = tagsParam.split(',').map((t) => t.trim()).filter(Boolean);
  const categoriaParam = searchParams.get('categoria') || '';

  const exercises = await prisma.exercise.findMany({
    where: { userId: session.userId, ...(categoriaParam ? { categoria: categoriaParam } : {}) },
    include: {
      // schemaCampo del primo livello serve alla card libreria per mostrare l'anteprima
      // in miniatura del disegno, invece di una lista "cieca" di soli titoli. titolo/
      // numeroGiocatoriBase/larghezzaCampo/lunghezzaCampo sono per-livello (indipendenti
      // tra loro): la card mostra sempre quelli del primo livello come rappresentativi.
      livelli: { select: { id: true, nome: true, titolo: true, numeroGiocatoriBase: true, numeroPortieri: true, larghezzaCampo: true, lunghezzaCampo: true, ripetizioni: true, durataRipetizione: true, recuperoSecondi: true, schemaCampo: true }, orderBy: { ordine: 'asc' } },
    },
    orderBy: { creatoIl: 'desc' },
  });

  let filtered = search
    ? exercises.filter((e) => {
        const s = search.toLowerCase();
        const tags = JSON.parse(e.tags || '[]');
        // Il titolo ora vive sul livello (indipendente per progressione): un esercizio
        // compare se la ricerca combacia con il titolo di ALMENO uno dei suoi livelli.
        return e.livelli.some((l) => l.titolo.toLowerCase().includes(s)) || tags.some((t) => t.toLowerCase().includes(s));
      })
    : exercises;

  // Filtro etichette: un esercizio compare se ha ALMENO UNA delle etichette selezionate.
  if (wantedTags.length) {
    filtered = filtered.filter((e) => {
      const tags = JSON.parse(e.tags || '[]');
      return wantedTags.some((wt) => tags.includes(wt));
    });
  }

  return Response.json({ exercises: filtered });
}

export async function POST(request) {
  const session = await getSchemaSessionOrNull();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'edit_esercizi')) return Response.json({ error: 'forbidden' }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const { titolo, descrizione, numeroGiocatoriBase, numeroPortieri, larghezzaCampo, lunghezzaCampo, tags, categoria } = body;
  if (!titolo || !numeroGiocatoriBase) {
    return Response.json({ error: 'titolo e numeroGiocatoriBase sono obbligatori' }, { status: 400 });
  }
  if (typeof categoria !== 'undefined' && !(await isValidCategoria(session.userId, categoria))) {
    return Response.json({ error: 'categoria non valida' }, { status: 400 });
  }

  // Nessun calcolo automatico dalle dimensioni: un default ragionevole, sempre modificabile.
  // Titolo/N.giocatori/misure campo vivono sul primo livello (indipendenti da eventuali
  // livelli aggiunti dopo), non sull'esercizio.
  const exercise = await prisma.exercise.create({
    data: {
      userId: session.userId,
      descrizione: descrizione || '',
      tags: JSON.stringify(Array.isArray(tags) ? tags : []),
      categoria: categoria || '',
      // Il livello nasce con lo svolgimento vuoto: la descrizione generale (perché/a cosa
      // serve) e lo svolgimento del livello (come si fa, l'unico stampato) sono due campi
      // con scopi diversi, non uno la copia dell'altro.
      livelli: {
        create: [{
          nome: 'A', ordine: 0, descrizione: '',
          titolo,
          numeroGiocatoriBase: Number(numeroGiocatoriBase),
          numeroPortieri: numeroPortieri ? Number(numeroPortieri) : 0,
          larghezzaCampo: larghezzaCampo ? Number(larghezzaCampo) : 20,
          lunghezzaCampo: lunghezzaCampo ? Number(lunghezzaCampo) : 28,
        }],
      },
    },
    include: { livelli: true },
  });

  return Response.json({ exercise });
}
