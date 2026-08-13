-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "autoreId" TEXT,
ADD COLUMN     "autoreNome" TEXT;

-- AlterTable
ALTER TABLE "livelli" ADD COLUMN     "mostraDisegno" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "considerazioni" ADD COLUMN     "momento" TEXT NOT NULL DEFAULT 'post';

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_autoreId_fkey" FOREIGN KEY ("autoreId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
