-- AlterTable
ALTER TABLE "exercises" ADD COLUMN "votoPreferenza" INTEGER;

-- Backfill: l'ultima valutazione esplicita data ad ogni esercizio diventa la nuova
-- preferenza singola (niente media: il modello a valutazioni multiple viene sostituito
-- da un solo voto sovrascrivibile, la preferenza dell'allenatore).
UPDATE "exercises"
SET "votoPreferenza" = (
  SELECT "voto" FROM "ratings"
  WHERE "ratings"."esercizioId" = "exercises"."id"
  ORDER BY "data" DESC
  LIMIT 1
);

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ratings";
PRAGMA foreign_keys=on;
