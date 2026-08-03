'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/session';
import { findValidInvite, acceptInvite } from '@/lib/team';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerAction(prevState, formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const password2 = String(formData.get('password2') || '');
  const inviteToken = String(formData.get('invite') || '').trim();

  if (!EMAIL_RE.test(email)) return { error: 'Email non valida.' };
  if (password.length < 8) return { error: 'La password deve avere almeno 8 caratteri.' };
  if (password !== password2) return { error: 'Le due password non coincidono.' };

  // Un invito valido va ricontrollato ORA (non solo mostrato in anteprima nel form): può
  // essere scaduto, revocato o già accettato da qualcun altro nel frattempo.
  let invite = null;
  if (inviteToken) {
    const result = await findValidInvite(inviteToken);
    if (result.error) return { error: result.error };
    invite = result.teamMember;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // v1 non supporta collegare un account già esistente a una seconda squadra come
    // collaboratore: più semplice e meno rischioso chiedere un'altra email.
    return { error: invite ? 'Questa email è già registrata: chiedi al mister di invitarti con un\'altra email.' : 'Esiste già un account con questa email.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const isFirstUser = (await prisma.user.count()) === 0;

  const user = await prisma.user.create({
    data: { email, passwordHash, modules: JSON.stringify(['united-carpi']) },
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

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: 'Email o password non corretti.' };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: 'Email o password non corretti.' };

  await createSession(user.id);
  redirect('/');
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
