import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

const PUBLIC_ROUTES = ['/login', '/register'];

export default async function proxy(req) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = PUBLIC_ROUTES.includes(path);

  const cookie = req.cookies.get('session')?.value;
  const session = await decrypt(cookie);
  const isAuthed = !!session?.userId;

  if (!isPublicRoute && !isAuthed) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }
  if (isPublicRoute && isAuthed) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:png|ico|svg)$).*)'],
};
