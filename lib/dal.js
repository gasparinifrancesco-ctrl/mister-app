import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/session';
import { prisma } from '@/lib/prisma';

// Session-only check, no redirect: safe to use from Route Handlers.
export const getSession = cache(async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return null;
  return { userId: session.userId };
});

// Page-level guard: redirects to /login if there's no valid session.
export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, modules: true },
  });
  if (!user) redirect('/login');
  return user;
});

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
