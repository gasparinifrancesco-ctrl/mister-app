// Script one-off: copia tutti i dati reali da dev.db (SQLite) al nuovo database Postgres.
// Da eseguire UNA VOLTA sola, dopo aver applicato la migrazione Postgres (`prisma migrate
// deploy`) sul database vuoto. Non tocca dev.db (sola lettura). Ordine di inserimento
// pensato per rispettare le foreign key dichiarate (livelli/notes -> exercises,
// considerazioni/session_items -> sessions).
//
// Uso: DATABASE_URL="postgresql://..." node scripts/migrate-sqlite-to-postgres.mjs
import Database from 'better-sqlite3';
import { PrismaClient } from '../app/generated/prisma/client.js';
import { PrismaNeon } from '@prisma/adapter-neon';

const sqlite = new Database('dev.db', { readonly: true });
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function all(table) {
  return sqlite.prepare(`SELECT * FROM ${table}`).all();
}

// SQLite salva i DATETIME come stringa ISO; Prisma+Postgres vuole oggetti Date per i campi
// DateTime. Converte solo le colonne note per essere date, lascia tutto il resto invariato.
function toDate(v) {
  return v == null ? null : new Date(v);
}

async function main() {
  console.log('Lettura da dev.db...');

  const users = all('users').map((u) => ({ ...u, createdAt: toDate(u.createdAt) }));
  const teamMembers = all('team_members').map((t) => ({
    ...t,
    inviteExpiresAt: toDate(t.inviteExpiresAt),
    invitedAt: toDate(t.invitedAt),
    joinedAt: toDate(t.joinedAt),
    revokedAt: toDate(t.revokedAt),
  }));
  const stagioni = all('stagioni').map((s) => ({ ...s, attiva: !!s.attiva, creataIl: toDate(s.creataIl), chiusaIl: toDate(s.chiusaIl) }));
  const categorie = all('categorie');
  const objectives = all('objectives');
  const exercises = all('exercises').map((e) => ({ ...e, creatoIl: toDate(e.creatoIl) }));
  const livelli = all('livelli');
  const notes = all('notes').map((n) => ({ ...n, data: toDate(n.data) }));
  const sessions = all('sessions').map((s) => ({ ...s, creataIl: toDate(s.creataIl) }));
  const considerazioni = all('considerazioni').map((c) => ({ ...c, creataIl: toDate(c.creataIl) }));
  const sessionItems = all('session_items');
  const kvEntries = all('kv_entries').map((k) => ({ ...k, updatedAt: toDate(k.updatedAt) }));

  console.log(`Trovati: ${users.length} users, ${teamMembers.length} team_members, ${stagioni.length} stagioni, ${categorie.length} categorie, ${objectives.length} objectives, ${exercises.length} exercises, ${livelli.length} livelli, ${notes.length} notes, ${sessions.length} sessions, ${considerazioni.length} considerazioni, ${sessionItems.length} session_items, ${kvEntries.length} kv_entries.`);

  console.log('Scrittura su Postgres...');
  if (users.length) await prisma.user.createMany({ data: users });
  if (teamMembers.length) await prisma.teamMember.createMany({ data: teamMembers });
  if (stagioni.length) await prisma.stagione.createMany({ data: stagioni });
  if (categorie.length) await prisma.categoria.createMany({ data: categorie });
  if (objectives.length) await prisma.objective.createMany({ data: objectives });
  if (exercises.length) await prisma.exercise.createMany({ data: exercises });
  if (livelli.length) await prisma.livello.createMany({ data: livelli });
  if (notes.length) await prisma.note.createMany({ data: notes });
  if (sessions.length) await prisma.session.createMany({ data: sessions });
  if (considerazioni.length) await prisma.considerazione.createMany({ data: considerazioni });
  if (sessionItems.length) await prisma.sessionItem.createMany({ data: sessionItems });
  if (kvEntries.length) await prisma.kvEntry.createMany({ data: kvEntries });

  console.log('Verifica conteggi su Postgres...');
  const counts = {
    users: await prisma.user.count(),
    teamMembers: await prisma.teamMember.count(),
    stagioni: await prisma.stagione.count(),
    categorie: await prisma.categoria.count(),
    objectives: await prisma.objective.count(),
    exercises: await prisma.exercise.count(),
    livelli: await prisma.livello.count(),
    notes: await prisma.note.count(),
    sessions: await prisma.session.count(),
    considerazioni: await prisma.considerazione.count(),
    sessionItems: await prisma.sessionItem.count(),
    kvEntries: await prisma.kvEntry.count(),
  };
  console.log(counts);

  await prisma.$disconnect();
  sqlite.close();
  console.log('Fatto.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
