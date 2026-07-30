-- DropTable (usage_history: 0 righe reali, sostituito da session_items + sessions.eseguita)
PRAGMA foreign_keys=off;
DROP TABLE "usage_history";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "titolo" TEXT NOT NULL,
    "obiettivoId" TEXT,
    "allenamentoId" TEXT,
    "eseguita" BOOLEAN NOT NULL DEFAULT false,
    "creataIl" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "session_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "esercizioId" TEXT NOT NULL,
    "ordine" INTEGER NOT NULL DEFAULT 0,
    "durataMinuti" INTEGER,
    CONSTRAINT "session_items_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "session_items_esercizioId_fkey" FOREIGN KEY ("esercizioId") REFERENCES "exercises" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables: exercises.durataTipica -> ripetizioni/durataRipetizione/recuperoSecondi
-- Backfill esplicito: durataRipetizione eredita il valore di durataTipica (non il default),
-- ripetizioni=1 e recuperoSecondi=0 rappresentano fedelmente lo stato "una singola ripetizione,
-- nessun recupero configurato" per gli esercizi creati prima di questo round.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_exercises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "titolo" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL DEFAULT '',
    "obiettivoId" TEXT NOT NULL,
    "numeroGiocatoriBase" INTEGER NOT NULL,
    "ripetizioni" INTEGER NOT NULL DEFAULT 1,
    "durataRipetizione" INTEGER NOT NULL DEFAULT 15,
    "recuperoSecondi" INTEGER NOT NULL DEFAULT 0,
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
INSERT INTO "new_exercises" ("creatoIl", "descrizione", "id", "indiceFatica", "larghezzaCampo", "lunghezzaCampo", "numeroGiocatoriBase", "obiettivoId", "ripetizioni", "durataRipetizione", "recuperoSecondi", "schemaCampo", "tags", "titolo", "userId", "varianteDiId", "versioneDiId")
SELECT "creatoIl", "descrizione", "id", "indiceFatica", "larghezzaCampo", "lunghezzaCampo", "numeroGiocatoriBase", "obiettivoId", 1, "durataTipica", 0, "schemaCampo", "tags", "titolo", "userId", "varianteDiId", "versioneDiId" FROM "exercises";
DROP TABLE "exercises";
ALTER TABLE "new_exercises" RENAME TO "exercises";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
