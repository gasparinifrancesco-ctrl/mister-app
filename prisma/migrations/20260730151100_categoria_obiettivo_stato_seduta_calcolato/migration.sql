-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_objectives" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoria" TEXT NOT NULL DEFAULT 'fisico',
    "m2PerPlayer" REAL NOT NULL,
    "intensityFactor" REAL NOT NULL,
    "loadMin" REAL NOT NULL,
    "loadMax" REAL NOT NULL
);
INSERT INTO "new_objectives" ("id", "intensityFactor", "key", "label", "loadMax", "loadMin", "m2PerPlayer", "order", "userId") SELECT "id", "intensityFactor", "key", "label", "loadMax", "loadMin", "m2PerPlayer", "order", "userId" FROM "objectives";
DROP TABLE "objectives";
ALTER TABLE "new_objectives" RENAME TO "objectives";
CREATE UNIQUE INDEX "objectives_userId_key_key" ON "objectives"("userId", "key");

-- Backfill: i 3 obiettivi seed che sono tecnico-tattici, non fisici (tutti gli altri
-- restano sul default 'fisico' impostato dalla colonna).
UPDATE "objectives" SET "categoria" = 'tecnico-tattico' WHERE "key" IN ('tecnica-individuale', 'tecnica-collettiva', 'tattica-situazionale');

-- sessions.eseguita viene rimosso: lo stato (bozza/programmata/eseguita) si calcola
-- ora dal collegamento allenamentoId + data del giorno di allenamento nel calendario,
-- non da un flag separato che potrebbe disallinearsi dalla realtà del calendario.
CREATE TABLE "new_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "titolo" TEXT NOT NULL,
    "obiettivoId" TEXT,
    "allenamentoId" TEXT,
    "note" TEXT NOT NULL DEFAULT '',
    "creataIl" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_sessions" ("allenamentoId", "creataIl", "id", "obiettivoId", "titolo", "userId") SELECT "allenamentoId", "creataIl", "id", "obiettivoId", "titolo", "userId" FROM "sessions";
DROP TABLE "sessions";
ALTER TABLE "new_sessions" RENAME TO "sessions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
