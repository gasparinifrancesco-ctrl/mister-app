-- Fase 4: le progressioni diventano "livelli" dello stesso esercizio (non più esercizi
-- separati collegati da versioneDiId/varianteDiId, che vengono eliminati); il carico si
-- calcola ora con il metodo session-RPE (Foster) sull'intera seduta, non più per esercizio
-- da campo/obiettivo.

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- CreateTable: livelli
CREATE TABLE "livelli" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "esercizioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL DEFAULT 'A',
    "ordine" INTEGER NOT NULL DEFAULT 0,
    "descrizione" TEXT NOT NULL DEFAULT '',
    "schemaCampo" TEXT NOT NULL DEFAULT '{}',
    "ripetizioni" INTEGER NOT NULL DEFAULT 1,
    "durataRipetizione" INTEGER NOT NULL DEFAULT 15,
    "recuperoSecondi" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "livelli_esercizioId_fkey" FOREIGN KEY ("esercizioId") REFERENCES "exercises" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Backfill: un livello "A" per ogni esercizio esistente, con lo stesso disegno campo,
-- descrizione, ripetizioni/durata/recupero che aveva l'esercizio prima di questo round
-- (nessun dato di disegno viene perso).
INSERT INTO "livelli" ("id", "esercizioId", "nome", "ordine", "descrizione", "schemaCampo", "ripetizioni", "durataRipetizione", "recuperoSecondi")
SELECT lower(hex(randomblob(16))), "id", 'A', 0, "descrizione", "schemaCampo", "ripetizioni", "durataRipetizione", "recuperoSecondi"
FROM "exercises";

-- RedefineTable: session_items ora punta a un livello, non più direttamente a un esercizio.
-- Il livello giusto è quello appena creato per l'esercizio che l'item referenziava.
CREATE TABLE "new_session_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "livelloId" TEXT NOT NULL,
    "ordine" INTEGER NOT NULL DEFAULT 0,
    "durataMinuti" INTEGER,
    CONSTRAINT "session_items_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "session_items_livelloId_fkey" FOREIGN KEY ("livelloId") REFERENCES "livelli" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_session_items" ("id", "sessionId", "livelloId", "ordine", "durataMinuti")
SELECT si."id", si."sessionId", l."id", si."ordine", si."durataMinuti"
FROM "session_items" si
JOIN "livelli" l ON l."esercizioId" = si."esercizioId";
DROP TABLE "session_items";
ALTER TABLE "new_session_items" RENAME TO "session_items";

-- RedefineTable: exercises perde obiettivoId/ripetizioni/durataRipetizione/recuperoSecondi/
-- indiceFatica/schemaCampo (spostati su livelli) e versioneDiId/varianteDiId (concetto
-- eliminato: le progressioni sono livelli, le varianti non esistono più).
CREATE TABLE "new_exercises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "titolo" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL DEFAULT '',
    "numeroGiocatoriBase" INTEGER NOT NULL,
    "larghezzaCampo" REAL,
    "lunghezzaCampo" REAL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "creatoIl" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_exercises" ("id", "userId", "titolo", "descrizione", "numeroGiocatoriBase", "larghezzaCampo", "lunghezzaCampo", "tags", "creatoIl")
SELECT "id", "userId", "titolo", "descrizione", "numeroGiocatoriBase", "larghezzaCampo", "lunghezzaCampo", "tags", "creatoIl" FROM "exercises";
DROP TABLE "exercises";
ALTER TABLE "new_exercises" RENAME TO "exercises";

-- RedefineTable: objectives perde m2PerPlayer/intensityFactor (calcolo su densità campo
-- abbandonato), guadagna rpeSuggerito (default RPE 1-10 per gli obiettivi fisici).
CREATE TABLE "new_objectives" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoria" TEXT NOT NULL DEFAULT 'fisico',
    "rpeSuggerito" INTEGER,
    "loadMin" REAL NOT NULL,
    "loadMax" REAL NOT NULL
);
INSERT INTO "new_objectives" ("id", "userId", "key", "label", "order", "categoria", "loadMin", "loadMax")
SELECT "id", "userId", "key", "label", "order", "categoria", "loadMin", "loadMax" FROM "objectives";
DROP TABLE "objectives";
ALTER TABLE "new_objectives" RENAME TO "objectives";
CREATE UNIQUE INDEX "objectives_userId_key_key" ON "objectives"("userId", "key");

-- AlterTable: sessions guadagna rpe (session-RPE dell'intera seduta).
ALTER TABLE "sessions" ADD COLUMN "rpe" INTEGER;

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
