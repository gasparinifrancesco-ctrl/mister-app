-- Fix: SQLite/Prisma non ammettono NULL dentro una compound unique key usata con
-- findUnique/upsert ("Argument stagioneId must not be null"), quindi le chiavi non
-- legate a una stagione (sidebar-order) usano ora la stringa vuota come sentinel invece
-- di NULL vero.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_kv_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "stagioneId" TEXT NOT NULL DEFAULT '',
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_kv_entries" ("id", "key", "stagioneId", "updatedAt", "userId", "value") SELECT "id", "key", coalesce("stagioneId", '') AS "stagioneId", "updatedAt", "userId", "value" FROM "kv_entries";
DROP TABLE "kv_entries";
ALTER TABLE "new_kv_entries" RENAME TO "kv_entries";
CREATE UNIQUE INDEX "kv_entries_userId_stagioneId_key_key" ON "kv_entries"("userId", "stagioneId", "key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
