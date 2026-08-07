import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/dal';

// Profilo personale (nome/cognome/ruolo): sempre quello di chi è REALMENTE collegato
// (actorUserId), mai del proprietario della squadra a cui si collabora. Il colore squadra
// (accentColor) è invece un'impostazione di tutto l'account, letta/scritta sull'utente
// proprietario (userId) — un collaboratore la vede ma non la cambia.
export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const actor = await prisma.user.findUnique({
    where: { id: session.actorUserId },
    select: { nome: true, cognome: true, ruolo: true, accentColor: true },
  });

  const accentColor = session.isOwner
    ? actor?.accentColor || null
    : (await prisma.user.findUnique({ where: { id: session.userId }, select: { accentColor: true } }))?.accentColor || null;

  return Response.json({
    nome: actor?.nome || '',
    cognome: actor?.cognome || '',
    ruolo: actor?.ruolo || '',
    accentColor,
    isOwner: session.isOwner,
  });
}

export async function PATCH(request) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const personalData = {};
  if (typeof body.nome === 'string') personalData.nome = body.nome.trim();
  if (typeof body.cognome === 'string') personalData.cognome = body.cognome.trim();
  if (typeof body.ruolo === 'string') personalData.ruolo = body.ruolo.trim();
  if (Object.keys(personalData).length) {
    await prisma.user.update({ where: { id: session.actorUserId }, data: personalData });
  }

  if (typeof body.accentColor !== 'undefined') {
    if (!session.isOwner) {
      return Response.json({ error: "Solo il proprietario dell'account può cambiare il colore della squadra." }, { status: 403 });
    }
    const value = body.accentColor === null ? null : String(body.accentColor);
    if (value !== null && !/^#[0-9a-fA-F]{6}$/.test(value)) {
      return Response.json({ error: 'Colore non valido.' }, { status: 400 });
    }
    await prisma.user.update({ where: { id: session.userId }, data: { accentColor: value } });
  }

  return Response.json({ ok: true });
}
