-- CreateTable: blocco di lavoro parallelo (N esercizi svolti nello stesso momento)
CREATE TABLE "session_blocks" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "invertono" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "session_blocks_pkey" PRIMARY KEY ("id")
);

-- AlterTable: appartenenza (facoltativa) di un item a un blocco + posizione del gruppo
ALTER TABLE "session_items" ADD COLUMN "blockId" TEXT;
ALTER TABLE "session_items" ADD COLUMN "gruppo" INTEGER;

-- AddForeignKey
ALTER TABLE "session_blocks" ADD CONSTRAINT "session_blocks_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_items" ADD CONSTRAINT "session_items_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "session_blocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
