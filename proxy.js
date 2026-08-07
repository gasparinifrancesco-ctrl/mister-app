import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

// Pagine che ha senso vedere SOLO da anonimi: chi è già loggato viene rimbalzato a "/".
const AUTH_ONLY_ROUTES = ['/login', '/register'];
// "/" è l'unica rotta a doppio uso: senza sessione mostra la landing pubblica, con
// sessione la dashboard (la scelta la fa app/page.js) — quindi non deve mai finire nel
// redirect-a-/login qui sotto, né nel rimbalzo-via-da-/login qui sopra (altrimenti "/"
// autenticato rimbalzerebbe su se stesso all'infinito).
const ALWAYS_ACCESSIBLE = ['/', '/privacy', ...AUTH_ONLY_ROUTES];

export default async function proxy(req) {
  const path = req.nextUrl.pathname;

  const cookie = req.cookies.get('session')?.value;
  const session = await decrypt(cookie);
  const isAuthed = !!session?.userId;

  if (!ALWAYS_ACCESSIBLE.includes(path) && !isAuthed) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }
  if (AUTH_ONLY_ROUTES.includes(path) && isAuthed) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:png|ico|svg)$).*)'],
};
