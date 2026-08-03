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
    select: { id: true, email: true, modules: true },
  });
  if (!user) redirect('/login');
  return { ...user, isOwner: session.isOwner, permissions: session.permissions };
});

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
export async function getSchemaSessionOrNull() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { modules: true } });
  if (!user || !hasSchemaModule(user)) return null;
  return session;
}
