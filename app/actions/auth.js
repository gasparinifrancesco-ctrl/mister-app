'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/session';
import { findValidInvite, acceptInvite } from '@/lib/team';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Protezione brute-force sul login: dopo troppi tentativi falliti ravvicinati sulla
// stessa email, si blocca il login per quell'email a prescindere dalla password
// inserita — niente servizi esterni, solo una tabella Postgres già usata come storico.
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function registerAction(prevState, formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const password2 = String(formData.get('password2') || '');
  const inviteToken = String(formData.get('invite') || '').trim();
  const accessCode = String(formData.get('accesso') || '').trim();

  if (!EMAIL_RE.test(email)) return { error: 'Email non valida.' };
  if (password.length < 8) return { error: 'La password deve avere almeno 8 caratteri.' };
  if (password !== password2) return { error: 'Le due password non coincidono.' };
  // Validato anche lato server (non solo con l'attributo required nel form): un form
  // manipolato o inviato senza JS non deve poter bypassare il consenso.
  if (!formData.get('privacyConsent')) return { error: 'Devi accettare la Privacy Policy per registrarti.' };

  // Un invito valido va ricontrollato ORA (non solo mostrato in anteprima nel form): può
  // essere scaduto, revocato o già accettato da qualcun altro nel frattempo.
  let invite = null;
  if (inviteToken) {
    const result = await findValidInvite(inviteToken);
    if (result.error) return { error: result.error };
    invite = result.teamMember;
  }

  // Registrazione libera chiusa: senza un invito a collaborare su una squadra esistente,
  // serve il codice di accesso condiviso (dato a mano a chi si vuole far provare l'app
  // con un account nuovo e vuoto, non collegato a nessuna squadra esistente).
  if (!invite) {
    const validCode = process.env.REGISTRATION_ACCESS_CODE;
    if (!validCode || accessCode !== validCode) {
      return { error: 'Per registrarti serve un invito o un codice di accesso valido.' };
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // v1 non supporta collegare un account già esistente a una seconda squadra come
    // collaboratore: più semplice e meno rischioso chiedere un'altra email.
    return { error: invite ? 'Questa email è già registrata: chiedi al mister di invitarti con un\'altra email.' : 'Esiste già un account con questa email.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const isFirstUser = (await prisma.user.count()) === 0;

  // Chi si registra col codice di accesso (non con un invito a collaborare) sta provando
  // l'app da zero: sblocca subito tutti i moduli, altrimenti vedrebbe una versione
  // dimezzata (senza Allenamenti) e l'esperienza di prova sarebbe fuorviante.
  const modules = invite ? ['united-carpi'] : ['united-carpi', 'schema'];

  const user = await prisma.user.create({
    data: { email, passwordHash, modules: JSON.stringify(modules) },
  });

  if (invite) {
    await acceptInvite(invite.id, user.id);
  } else if (isFirstUser) {
    // Attach any pre-existing, not-yet-claimed data to the first account ever created.
    await prisma.kvEntry.updateMany({ where: { userId: null }, data: { userId: user.id } });
  }

  await createSession(user.id);
  redirect('/');
}

export async function loginAction(prevState, formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  const windowStart = new Date(Date.now() - LOGIN_WINDOW_MS);
  const recentAttempts = await prisma.loginAttempt.count({
    where: { email, createdAt: { gte: windowStart } },
  });
  if (recentAttempts >= LOGIN_MAX_ATTEMPTS) {
    return { error: 'Troppi tentativi falliti. Riprova tra qualche minuto.' };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!ok) {
    await prisma.loginAttempt.create({ data: { email } });
    return { error: 'Email o password non corretti.' };
  }

  // Login riuscito: azzera lo storico dei tentativi falliti su questa email, così un
  // fallimento vecchio non contribuisce più al conteggio del prossimo blocco.
  await prisma.loginAttempt.deleteMany({ where: { email } });

  await createSession(user.id);
  redirect('/');
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
