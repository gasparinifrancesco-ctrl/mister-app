-- AlterTable
ALTER TABLE "exercises" ADD COLUMN     "difficolta" INTEGER;

-- AlterTable
ALTER TABLE "livelli" ADD COLUMN     "numeroPortieri" INTEGER NOT NULL DEFAULT 0;
