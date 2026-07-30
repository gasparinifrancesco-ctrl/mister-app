-- CreateTable
CREATE TABLE "objectives" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "m2PerPlayer" REAL NOT NULL,
    "intensityFactor" REAL NOT NULL,
    "loadMin" REAL NOT NULL,
    "loadMax" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "titolo" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL DEFAULT '',
    "obiettivoId" TEXT NOT NULL,
    "numeroGiocatoriBase" INTEGER NOT NULL,
    "durataTipica" INTEGER NOT NULL DEFAULT 15,
    "larghezzaCampo" REAL,
    "lunghezzaCampo" REAL,
    "indiceFatica" INTEGER NOT NULL DEFAULT 3,
    "schemaCampo" TEXT NOT NULL DEFAULT '{}',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "versioneDiId" TEXT,
    "varianteDiId" TEXT,
    "creatoIl" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "exercises_obiettivoId_fkey" FOREIGN KEY ("obiettivoId") REFERENCES "objectives" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "exercises_versioneDiId_fkey" FOREIGN KEY ("versioneDiId") REFERENCES "exercises" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "exercises_varianteDiId_fkey" FOREIGN KEY ("varianteDiId") REFERENCES "exercises" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "esercizioId" TEXT NOT NULL,
    "sedutaId" TEXT,
    "testo" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notes_esercizioId_fkey" FOREIGN KEY ("esercizioId") REFERENCES "exercises" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "esercizioId" TEXT NOT NULL,
    "sedutaId" TEXT,
    "voto" INTEGER NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ratings_esercizioId_fkey" FOREIGN KEY ("esercizioId") REFERENCES "exercises" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "usage_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "esercizioId" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "minutiDedicati" INTEGER NOT NULL,
    CONSTRAINT "usage_history_esercizioId_fkey" FOREIGN KEY ("esercizioId") REFERENCES "exercises" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "objectives_userId_key_key" ON "objectives"("userId", "key");
