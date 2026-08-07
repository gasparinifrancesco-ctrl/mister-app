import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { parsePermissions } from '@/lib/permissions';

// Session-only check, no redirect: safe to use from Route Handlers.
//
// userId qui è sempre lo SCOPE DEI DATI (rosa/calendario/esercizi/...), non necessariamente
// la persona collegata: se chi si è loggato è un collaboratore invitato (TeamMember con
// joinedAt valorizzato e non revocato), userId diventa l'id dell'admin proprietario della
// squadra — questo mantiene ogni rotta esistente (che filtra sempre per session.userId)
// corretta senza doverla toccare. actorUserId è invece SEMPRE la persona realmente
// collegata (per autorialità delle Considerazioni, permessi, identità mostrata in sidebar);
// isOwner è true per il proprietario (o per chiunque non sia un collaboratore, cioè ogni
// account solista di oggi si comporta esattamente come prima) e bypassa ogni controllo
// permessi; permissions è l'array granulare scelto dall'admin per questo collaboratore.
export const getSession = cache(async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return null;
  const rawId = session.userId;
  const membership = await prisma.teamMember.findFirst({
    where: { userId: rawId, joinedAt: { not: null }, revokedAt: null },
  });
  if (membership) {
    return { userId: membership.ownerId, actorUserId: rawId, isOwner: false, permissions: parsePermissions(membership.permissions) };
  }
  return { userId: rawId, actorUserId: rawId, isOwner: true, permissions: [] };
});

// Page-level guard: redirects to /login if there's no valid session.
export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
});

// Identità di chi è REALMENTE collegato (per mostrare la sua email in sidebar, non quella
// del proprietario della squadra se è un collaboratore) — vedi getTeamModules per
// l'entitlement, che invece va sempre letta dal proprietario.
export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  const user = await prisma.user.findUnique({
    where: { id: session.actorUserId },
    select: { id: true, email: true, modules: true, nome: true, cognome: true, ruolo: true },
  });
  // redirect('/login') qui non basterebbe: il cookie (JWT valido, userId ormai
  // inesistente) resterebbe intatto e proxy.js rimbalzerebbe /login→/ all'infinito.
  // Questa rotta cancella il cookie prima di mandare a /login.
  if (!user) redirect('/api/session/clear');
  return { ...user, isOwner: session.isOwner, permissions: session.permissions };
});

// Colore squadra (sostituisce solo --accent): impostazione di tutto l'account, letta sempre
// dal proprietario (userId), MAI dal collaboratore che si è collegato — stesso motivo di
// getTeamModules: un collaboratore deve vedere il colore scelto dalla squadra, non uno suo.
export async function getTeamAccentColor(session) {
  const owner = await prisma.user.findUnique({ where: { id: session.userId }, select: { accentColor: true } });
  return owner?.accentColor || null;
}

// Entitlement a livello di squadra (es. modulo Allenamenti sbloccato): va sempre risolta
// da session.userId (il proprietario), MAI da actorUserId — altrimenti un collaboratore
// vedrebbe i moduli sempre bloccati, perché il suo account personale non ha mai
// l'entitlement della squadra a cui collabora.
export async function getTeamModules(session) {
  const owner = await prisma.user.findUnique({ where: { id: session.userId }, select: { modules: true } });
  return owner ? owner.modules : '[]';
}

export function hasSchemaModule(user) {
  try {
    const modules = JSON.parse(user.modules || '[]');
    return modules.includes('schema');
  } catch {
    return false;
  }
}

// Route Handler variant: no redirect (an XHR/fetch can't follow one meaningfully).
// Returns { userId } if authenticated AND entitled to the schema module, else null.
//
// Duplica la risoluzione owner/collaboratore già in getSession() invece di chiamarla e poi
// interrogare separatamente `modules`: farlo in due passi obbligherebbe la query di
// entitlement ad aspettare il risultato della query di sessione anche nel caso comune
// (account proprietario, non collaboratore), dove invece userId è già noto dal solo JWT e
// le due query possono partire in parallelo. Ogni sezione "Allenamenti" chiama questa
// funzione su più endpoint contemporaneamente: risparmiare un round-trip qui si sente su
// tutta la sezione.
export async function getSchemaSessionOrNull() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const decoded = await decrypt(cookie);
  if (!decoded?.userId) return null;
  const rawId = decoded.userId;

  const [membership, rawUser] = await Promise.all([
    prisma.teamMember.findFirst({ where: { userId: rawId, joinedAt: { not: null }, revokedAt: null } }),
    prisma.user.findUnique({ where: { id: rawId }, select: { modules: true } }),
  ]);

  let session, user;
  if (membership) {
    session = { userId: membership.ownerId, actorUserId: rawId, isOwner: false, permissions: parsePermissions(membership.permissions) };
    // Collaboratore: l'entitlement va letta dal proprietario, non da sé stesso — rawUser
    // (già recuperato sopra) non serve in questo ramo, e qui serve per forza una query in più.
    user = await prisma.user.findUnique({ where: { id: membership.ownerId }, select: { modules: true } });
  } else {
    session = { userId: rawId, actorUserId: rawId, isOwner: true, permissions: [] };
    user = rawUser;
  }
  if (!user || !hasSchemaModule(user)) return null;
  return session;
}
