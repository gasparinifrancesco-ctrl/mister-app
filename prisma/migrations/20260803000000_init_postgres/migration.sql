-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "modules" TEXT NOT NULL DEFAULT '["united-carpi"]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "permissions" TEXT NOT NULL DEFAULT '[]',
    "colore" TEXT NOT NULL,
    "inviteToken" TEXT,
    "inviteExpiresAt" TIMESTAMP(3),
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kv_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "stagioneId" TEXT NOT NULL DEFAULT '',
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kv_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stagioni" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "etichetta" TEXT NOT NULL,
    "societa" TEXT NOT NULL,
    "tipoSquadra" TEXT NOT NULL,
    "livello" TEXT NOT NULL,
    "attiva" BOOLEAN NOT NULL DEFAULT true,
    "creataIl" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chiusaIl" TIMESTAMP(3),

    CONSTRAINT "stagioni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorie" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chiave" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "ordine" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "categorie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objectives" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoria" TEXT NOT NULL DEFAULT 'fisico',
    "rpeSuggerito" INTEGER,
    "loadMin" DOUBLE PRECISION NOT NULL,
    "loadMax" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titolo" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL DEFAULT '',
    "numeroGiocatoriBase" INTEGER NOT NULL,
    "larghezzaCampo" DOUBLE PRECISION,
    "lunghezzaCampo" DOUBLE PRECISION,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "categoria" TEXT NOT NULL DEFAULT '',
    "votoPreferenza" INTEGER,
    "creatoIl" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livelli" (
    "id" TEXT NOT NULL,
    "esercizioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL DEFAULT 'A',
    "ordine" INTEGER NOT NULL DEFAULT 0,
    "descrizione" TEXT NOT NULL DEFAULT '',
    "schemaCampo" TEXT NOT NULL DEFAULT '{}',
    "ripetizioni" INTEGER NOT NULL DEFAULT 1,
    "durataRipetizione" INTEGER NOT NULL DEFAULT 15,
    "recuperoSecondi" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "livelli_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "esercizioId" TEXT NOT NULL,
    "sedutaId" TEXT,
    "testo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titolo" TEXT NOT NULL,
    "obiettivoId" TEXT,
    "allenamentoId" TEXT,
    "rpe" INTEGER,
    "creataIl" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "considerazioni" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "autoreId" TEXT NOT NULL,
    "autoreNome" TEXT NOT NULL,
    "sedutaId" TEXT,
    "testo" TEXT NOT NULL,
    "creataIl" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "considerazioni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_items" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "livelloId" TEXT,
    "titoloSnapshot" TEXT NOT NULL,
    "livelloSnapshot" TEXT NOT NULL,
    "ordine" INTEGER NOT NULL DEFAULT 0,
    "durataMinuti" INTEGER,

    CONSTRAINT "session_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_inviteToken_key" ON "team_members"("inviteToken");

-- Una persona appartiene al più a UNA squadra come collaboratore: indice parziale (non
-- esprimibile in schema.prisma) perché più righe con userId NULL (inviti pendenti) sono
-- ammesse, solo i valori NON NULL devono essere unici. Stesso indice già usato in SQLite,
-- sintassi identica in Postgres.
CREATE UNIQUE INDEX "team_members_userId_key" ON "team_members"("userId") WHERE "userId" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "kv_entries_userId_stagioneId_key_key" ON "kv_entries"("userId", "stagioneId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "categorie_userId_chiave_key" ON "categorie"("userId", "chiave");

-- CreateIndex
CREATE UNIQUE INDEX "objectives_userId_key_key" ON "objectives"("userId", "key");

-- AddForeignKey
ALTER TABLE "livelli" ADD CONSTRAINT "livelli_esercizioId_fkey" FOREIGN KEY ("esercizioId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_esercizioId_fkey" FOREIGN KEY ("esercizioId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "considerazioni" ADD CONSTRAINT "considerazioni_sedutaId_fkey" FOREIGN KEY ("sedutaId") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_items" ADD CONSTRAINT "session_items_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_items" ADD CONSTRAINT "session_items_livelloId_fkey" FOREIGN KEY ("livelloId") REFERENCES "livelli"("id") ON DELETE SET NULL ON UPDATE CASCADE;
