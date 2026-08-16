-- Elimina la progressione a più livelli: ogni Exercise assorbe i campi del suo primo
-- Livello (ordine minimo), i SessionItem ripuntano direttamente all'Exercise, la tabella
-- livelli viene droppata. Backup JSON pre-migrazione salvato fuori dal repo.

-- 1. Nuove colonne su exercises (con default, cosi le righe esistenti restano valide finché
--    non vengono popolate dal passo 2)
ALTER TABLE "exercises" ADD COLUMN "titolo" TEXT NOT NULL DEFAULT '';
ALTER TABLE "exercises" ADD COLUMN "svolgimento" TEXT NOT NULL DEFAULT '';
ALTER TABLE "exercises" ADD COLUMN "vincoli" TEXT NOT NULL DEFAULT '';
ALTER TABLE "exercises" ADD COLUMN "schemaCampo" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "exercises" ADD COLUMN "ripetizioni" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "exercises" ADD COLUMN "durataRipetizione" INTEGER NOT NULL DEFAULT 15;
ALTER TABLE "exercises" ADD COLUMN "recuperoSecondi" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "exercises" ADD COLUMN "numeroGiocatoriBase" INTEGER NOT NULL DEFAULT 8;
ALTER TABLE "exercises" ADD COLUMN "numeroPortieri" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "exercises" ADD COLUMN "larghezzaCampo" DOUBLE PRECISION NOT NULL DEFAULT 20;
ALTER TABLE "exercises" ADD COLUMN "lunghezzaCampo" DOUBLE PRECISION NOT NULL DEFAULT 28;
ALTER TABLE "exercises" ADD COLUMN "mostraDisegno" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "exercises" ADD COLUMN "tipoEsercitazione" TEXT;

-- 2. Popola dai campi del livello con ordine minimo di ciascun esercizio
UPDATE "exercises" e SET
  "titolo" = l."titolo",
  "svolgimento" = l."descrizione",
  "schemaCampo" = l."schemaCampo",
  "ripetizioni" = l."ripetizioni",
  "durataRipetizione" = l."durataRipetizione",
  "recuperoSecondi" = l."recuperoSecondi",
  "numeroGiocatoriBase" = l."numeroGiocatoriBase",
  "numeroPortieri" = l."numeroPortieri",
  "larghezzaCampo" = l."larghezzaCampo",
  "lunghezzaCampo" = l."lunghezzaCampo",
  "mostraDisegno" = l."mostraDisegno",
  "tipoEsercitazione" = l."tipoEsercitazione"
FROM (
  SELECT DISTINCT ON ("esercizioId") *
  FROM "livelli"
  ORDER BY "esercizioId", "ordine" ASC
) l
WHERE e."id" = l."esercizioId";

-- 3. session_items: aggiungi esercizioId, popolalo dal livello puntato, poi rimuovi
--    livelloId/livelloSnapshot
ALTER TABLE "session_items" ADD COLUMN "esercizioId" TEXT;

UPDATE "session_items" si SET "esercizioId" = l."esercizioId"
FROM "livelli" l
WHERE si."livelloId" = l."id";

ALTER TABLE "session_items" DROP CONSTRAINT "session_items_livelloId_fkey";
ALTER TABLE "session_items" DROP COLUMN "livelloId";
ALTER TABLE "session_items" DROP COLUMN "livelloSnapshot";

ALTER TABLE "session_items" ADD CONSTRAINT "session_items_esercizioId_fkey"
  FOREIGN KEY ("esercizioId") REFERENCES "exercises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Elimina la tabella livelli
ALTER TABLE "livelli" DROP CONSTRAINT "livelli_esercizioId_fkey";
DROP TABLE "livelli";
