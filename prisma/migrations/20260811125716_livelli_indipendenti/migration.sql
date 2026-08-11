-- Sposta titolo/numeroGiocatoriBase/larghezzaCampo/lunghezzaCampo da "exercises" a "livelli":
-- ogni livello di progressione diventa indipendente su questi campi (prima erano condivisi
-- da tutti i livelli dello stesso esercizio).

-- AddColumn (con default temporaneo, sovrascritto subito dal backfill sotto)
ALTER TABLE "livelli" ADD COLUMN "titolo" TEXT NOT NULL DEFAULT '';
ALTER TABLE "livelli" ADD COLUMN "numeroGiocatoriBase" INTEGER NOT NULL DEFAULT 8;
ALTER TABLE "livelli" ADD COLUMN "larghezzaCampo" DOUBLE PRECISION NOT NULL DEFAULT 20;
ALTER TABLE "livelli" ADD COLUMN "lunghezzaCampo" DOUBLE PRECISION NOT NULL DEFAULT 28;

-- Backfill: ogni livello esistente eredita i valori attuali del suo esercizio, cosi' nessun
-- dato reale gia' presente cambia aspetto/comportamento dopo la migrazione.
UPDATE "livelli" l SET
  "titolo" = e."titolo",
  "numeroGiocatoriBase" = e."numeroGiocatoriBase",
  "larghezzaCampo" = COALESCE(e."larghezzaCampo", 20),
  "lunghezzaCampo" = COALESCE(e."lunghezzaCampo", 28)
FROM "exercises" e
WHERE l."esercizioId" = e."id";

-- DropColumn
ALTER TABLE "exercises" DROP COLUMN "titolo";
ALTER TABLE "exercises" DROP COLUMN "numeroGiocatoriBase";
ALTER TABLE "exercises" DROP COLUMN "larghezzaCampo";
ALTER TABLE "exercises" DROP COLUMN "lunghezzaCampo";
