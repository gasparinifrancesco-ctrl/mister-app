-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_exercises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "titolo" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL DEFAULT '',
    "numeroGiocatoriBase" INTEGER NOT NULL,
    "larghezzaCampo" REAL,
    "lunghezzaCampo" REAL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "categoria" TEXT NOT NULL DEFAULT '',
    "creatoIl" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_exercises" ("creatoIl", "descrizione", "id", "larghezzaCampo", "lunghezzaCampo", "numeroGiocatoriBase", "tags", "titolo", "userId") SELECT "creatoIl", "descrizione", "id", "larghezzaCampo", "lunghezzaCampo", "numeroGiocatoriBase", "tags", "titolo", "userId" FROM "exercises";
DROP TABLE "exercises";
ALTER TABLE "new_exercises" RENAME TO "exercises";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
