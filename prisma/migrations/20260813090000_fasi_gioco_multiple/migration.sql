-- Exercise.categoria (singola "chiave", stringa) -> Exercise.categorie (JSON array di "chiave"),
-- stesso pattern già in uso per tags: un esercizio può appartenere a più fasi di gioco insieme.
ALTER TABLE "exercises" ADD COLUMN "categorie" TEXT NOT NULL DEFAULT '[]';

-- Backfill: ogni valore esistente diventa un array con un solo elemento, '' diventa array vuoto.
UPDATE "exercises" SET "categorie" = CASE WHEN "categoria" IS NULL OR "categoria" = '' THEN '[]' ELSE jsonb_build_array("categoria")::text END;

ALTER TABLE "exercises" DROP COLUMN "categoria";
