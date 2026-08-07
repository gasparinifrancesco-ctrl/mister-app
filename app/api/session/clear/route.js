import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';

// Un cookie di sessione può decodificarsi correttamente (firma JWT valida) ma puntare a
// uno userId ormai cancellato. Il redirect('/login') da un Server Component non può
// cancellare il cookie (solo Server Action/Route Handler possono farlo), quindi il
// cookie invalido resta e proxy.js rimbalza '/login'→'/' all'infinito. Questa rotta,
// esclusa dal matcher di proxy.js (prefisso 'api'), è raggiungibile in ogni stato e
// rompe il loop cancellando il cookie prima di mandare a /login.
export async function GET(request) {
  await deleteSession();
  return NextResponse.redirect(new URL('/login', request.url));
}
