-- Ricalibra i 7 obiettivi seed già creati per gli account esistenti (prima di questo
-- round avevano loadMin/loadMax derivati dalla vecchia formula densità-campo, e
-- rpeSuggerito non esisteva ancora): li allinea ai nuovi valori basati su session-RPE.
UPDATE "objectives" SET "rpeSuggerito" = 7, "loadMin" = 400, "loadMax" = 650 WHERE "key" = 'forza-esplosivita';
UPDATE "objectives" SET "rpeSuggerito" = 5, "loadMin" = 150, "loadMax" = 300 WHERE "key" = 'velocita-rapidita';
UPDATE "objectives" SET "loadMin" = 200, "loadMax" = 400 WHERE "key" = 'tecnica-individuale';
UPDATE "objectives" SET "loadMin" = 200, "loadMax" = 400 WHERE "key" = 'tecnica-collettiva';
UPDATE "objectives" SET "loadMin" = 250, "loadMax" = 450 WHERE "key" = 'tattica-situazionale';
UPDATE "objectives" SET "rpeSuggerito" = 4, "loadMin" = 200, "loadMax" = 400 WHERE "key" = 'resistenza-aerobica';
UPDATE "objectives" SET "rpeSuggerito" = 2, "loadMin" = 70, "loadMax" = 150 WHERE "key" = 'recupero-attivo';
