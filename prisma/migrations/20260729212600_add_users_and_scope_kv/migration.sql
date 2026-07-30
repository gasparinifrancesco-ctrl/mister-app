-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "modules" TEXT NOT NULL DEFAULT '["united-carpi"]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_kv_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_kv_entries" ("id", "userId", "key", "updatedAt", "value")
  SELECT lower(hex(randomblob(16))), NULL, "key", "updatedAt", "value" FROM "kv_entries";
DROP TABLE "kv_entries";
ALTER TABLE "new_kv_entries" RENAME TO "kv_entries";
CREATE UNIQUE INDEX "kv_entries_userId_key_key" ON "kv_entries"("userId", "key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
