'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/session';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerAction(prevState, formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const password2 = String(formData.get('password2') || '');

  if (!EMAIL_RE.test(email)) return { error: 'Email non valida.' };
  if (password.length < 8) return { error: 'La password deve avere almeno 8 caratteri.' };
  if (password !== password2) return { error: 'Le due password non coincidono.' };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'Esiste già un account con questa email.' };

  const passwordHash = await bcrypt.hash(password, 10);
  const isFirstUser = (await prisma.user.count()) === 0;

  const user = await prisma.user.create({
    data: { email, passwordHash, modules: JSON.stringify(['united-carpi']) },
  });

  if (isFirstUser) {
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
