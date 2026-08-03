import 'server-only';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { parsePermissions, serializePermissions } from '@/lib/permissions';

// Stessa palette a 10 colori già usata per le fasi di allenamento (contrasto verificato
// contro testo scuro, vedi app/api/schema/categorie/route.js): riusata qui per i colori
// autore delle Considerazioni, così un colore ha sempre lo stesso significato visivo in
// tutta l'app.
export const TEAM_PALETTE = ['#F2C94C', '#4FA8E0', '#6FCF7A', '#B591DE', '#E67F78', '#E08A4F', '#4FD1C5', '#7FA8C9', '#C9A0DC', '#8FBF6F'];

const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

// L'admin (proprietario dei dati) non ha una riga TeamMember: prende sempre il primo
// colore della palette, per costruzione mai in conflitto con un collaboratore (i
// collaboratori partono dall'indice 1, vedi createInvite).
export async function getTeamRoster(ownerId) {
  const owner = await prisma.user.findUnique({ where: { id: ownerId }, select: { id: true, email: true } });
  const members = await prisma.teamMember.findMany({
    where: { ownerId, joinedAt: { not: null } },
    orderBy: { invitedAt: 'asc' },
  });
  return [
    { userId: owner.id, email: owner.email, isOwner: true, colore: TEAM_PALETTE[0], revoked: false },
    ...members.map((m) => ({ userId: m.userId, email: m.email, isOwner: false, colore: m.colore, revoked: !!m.revokedAt })),
  ];
}

export async function listInvites(ownerId) {
  const rows = await prisma.teamMember.findMany({ where: { ownerId }, orderBy: { invitedAt: 'asc' } });
  return rows.map((m) => ({ ...m, permissions: parsePermissions(m.permissions) }));
}

// Il conteggio di TUTTE le righe mai create per questo owner (comprese quelle revocate)
// decide il prossimo colore: la revoca è sempre soft (mai DELETE), quindi questo contatore
// non torna mai indietro e due persone non finiscono mai con lo stesso colore.
export async function createInvite({ ownerId, email, permissions }) {
  const normalizedEmail = email.trim().toLowerCase();
  const serializedPermissions = serializePermissions(permissions);

  // Invito già pendente per la stessa email: si rigenera token/scadenza sulla riga
  // esistente invece di crearne una seconda (e sprecare uno slot di colore).
  const pending = await prisma.teamMember.findFirst({
    where: { ownerId, email: normalizedEmail, userId: null },
  });
  const inviteToken = crypto.randomBytes(32).toString('base64url');
  const inviteExpiresAt = new Date(Date.now() + INVITE_TTL_MS);

  if (pending) {
    return prisma.teamMember.update({
      where: { id: pending.id },
      data: { permissions: serializedPermissions, inviteToken, inviteExpiresAt, invitedAt: new Date() },
    });
  }

  const totalEverInvited = await prisma.teamMember.count({ where: { ownerId } });
  const colore = TEAM_PALETTE[(totalEverInvited + 1) % TEAM_PALETTE.length];

  return prisma.teamMember.create({
    data: { ownerId, email: normalizedEmail, permissions: serializedPermissions, colore, inviteToken, inviteExpiresAt },
  });
}

// Ritorna { teamMember } se il token è valido, non scaduto e non ancora accettato,
// altrimenti { error }. Non blocca su email diversa da quella invitata: il token (256 bit,
// monouso per costruzione — accettabile solo se userId è ancora null) è prova sufficiente.
export async function findValidInvite(token) {
  if (!token) return { error: null };
  const teamMember = await prisma.teamMember.findUnique({ where: { inviteToken: token } });
  if (!teamMember) return { error: 'Invito non valido.' };
  if (teamMember.userId) return { error: 'Questo invito è già stato usato.' };
  if (teamMember.inviteExpiresAt && teamMember.inviteExpiresAt < new Date()) return { error: 'Questo invito è scaduto: chiedine uno nuovo.' };
  return { teamMember };
}

export async function acceptInvite(teamMemberId, userId) {
  await prisma.teamMember.update({
    where: { id: teamMemberId },
    data: { userId, joinedAt: new Date() },
  });
}
