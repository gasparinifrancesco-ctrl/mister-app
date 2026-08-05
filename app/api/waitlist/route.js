import { prisma } from '@/lib/prisma';

const RUOLI_VALIDI = new Set(['allenatore', 'dirigente', 'collaboratore-staff']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Endpoint pubblico (nessuna sessione richiesta: chi compila il form dalla landing non ha
// ancora un account). Scrive solo su WaitlistSignup, mai su User: l'iscrizione alla lista
// d'attesa non crea un account, vedi lib/dal.js per il flusso di registrazione vero.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const email = String(body.email || '').trim().toLowerCase();
  const ruolo = String(body.ruolo || '').trim();
  const categoria = String(body.categoria || '').trim();
  const numeroCollaboratori = Number.parseInt(body.numeroCollaboratori, 10);

  if (!EMAIL_RE.test(email)) return Response.json({ error: 'Email non valida.' }, { status: 400 });
  if (!RUOLI_VALIDI.has(ruolo)) return Response.json({ error: 'Ruolo non valido.' }, { status: 400 });
  if (!categoria) return Response.json({ error: 'Indica la categoria che alleni.' }, { status: 400 });
  if (!Number.isInteger(numeroCollaboratori) || numeroCollaboratori < 0) {
    return Response.json({ error: 'Numero di collaboratori non valido.' }, { status: 400 });
  }

  try {
    await prisma.waitlistSignup.create({
      data: { email, ruolo, categoria, numeroCollaboratori },
    });
  } catch (err) {
    // Constraint univoco su email: chi si è già iscritto rivede lo stesso esito positivo,
    // non un errore — dal suo punto di vista l'iscrizione "è comunque a posto".
    if (err?.code === 'P2002') return Response.json({ ok: true, already: true });
    return Response.json({ error: 'Errore imprevisto, riprova.' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
