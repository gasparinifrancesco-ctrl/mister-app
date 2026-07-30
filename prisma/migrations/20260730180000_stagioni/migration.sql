-- Introduce le Stagioni: rosa/calendario/formazione predefinita/piano squadra diventano
-- agganciati alla stagione attiva invece che a chiavi con l'anno scritto a mano nel nome
-- ("matches-2026-27" ecc.); la libreria Schema NON viene toccata, resta condivisa.

-- DropIndex
DROP INDEX "kv_entries_userId_key_key";

-- AlterTable
ALTER TABLE "kv_entries" ADD COLUMN "stagioneId" TEXT;

-- CreateTable
CREATE TABLE "stagioni" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "etichetta" TEXT NOT NULL,
    "societa" TEXT NOT NULL,
    "tipoSquadra" TEXT NOT NULL,
    "livello" TEXT NOT NULL,
    "attiva" BOOLEAN NOT NULL DEFAULT true,
    "creataIl" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chiusaIl" DATETIME
);

-- RedefineTables (nessuna modifica sostanziale a session_items, solo l'indice ricreato altrove)
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_session_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "livelloId" TEXT,
    "titoloSnapshot" TEXT NOT NULL,
    "livelloSnapshot" TEXT NOT NULL,
    "ordine" INTEGER NOT NULL DEFAULT 0,
    "durataMinuti" INTEGER,
    CONSTRAINT "session_items_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "session_items_livelloId_fkey" FOREIGN KEY ("livelloId") REFERENCES "livelli" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_session_items" ("durataMinuti", "id", "livelloId", "livelloSnapshot", "ordine", "sessionId", "titoloSnapshot") SELECT "durataMinuti", "id", "livelloId", "livelloSnapshot", "ordine", "sessionId", "titoloSnapshot" FROM "session_items";
DROP TABLE "session_items";
ALTER TABLE "new_session_items" RENAME TO "session_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "kv_entries_userId_stagioneId_key_key" ON "kv_entries"("userId", "stagioneId", "key");

-- Backfill: una stagione "2026/27 — United Carpi, Juniores Élite" per ogni account
-- esistente, che eredita esattamente il branding fisso che l'app aveva finora, così i
-- dati reali continuano ad apparire esattamente come prima (nessuna sorpresa a login).
INSERT INTO "stagioni" ("id", "userId", "etichetta", "societa", "tipoSquadra", "livello", "attiva", "creataIl")
SELECT lower(hex(randomblob(16))), "id", '2026/27', 'United Carpi', 'Juniores', 'Élite', 1, CURRENT_TIMESTAMP
FROM "users";

-- Riassegna i blob esistenti alla stagione appena creata, rinominando le chiavi legate
-- all'anno in chiavi generiche (lo scoping per stagione ora vive in stagioneId, non nel
-- nome della chiave). "sidebar-order" resta senza stagioneId: è una preferenza di
-- interfaccia dell'account, non un dato della squadra.
UPDATE "kv_entries"
SET "stagioneId" = (SELECT "id" FROM "stagioni" WHERE "stagioni"."userId" = "kv_entries"."userId" AND "stagioni"."attiva" = 1),
    "key" = CASE "key"
      WHEN 'matches-2026-27' THEN 'matches'
      WHEN 'allenamenti-2026-27' THEN 'allenamenti'
      WHEN 'piano-squadra-2026-27' THEN 'piano-squadra'
      WHEN 'formazione-default-2026-27' THEN 'formazione-default'
      WHEN 'players' THEN 'players'
      ELSE "key"
    END
WHERE "key" IN ('matches-2026-27', 'allenamenti-2026-27', 'piano-squadra-2026-27', 'formazione-default-2026-27', 'players');
