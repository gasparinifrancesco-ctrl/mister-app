-- Un esercizio/livello ora si può eliminare dalla libreria anche se usato in una seduta
-- passata: livelloId diventa facoltativo (SET NULL alla cancellazione), e titoloSnapshot/
-- livelloSnapshot congelano il nome visto al momento dell'inserimento, letti dal titolo
-- reale attuale in questo backfill (nessun dato storico da perdere: tutte le righe esistenti
-- hanno ancora un livelloId valido a questo punto).
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_session_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "livelloId" TEXT,
    "titoloSnapshot" TEXT NOT NULL DEFAULT '',
    "livelloSnapshot" TEXT NOT NULL DEFAULT '',
    "ordine" INTEGER NOT NULL DEFAULT 0,
    "durataMinuti" INTEGER,
    CONSTRAINT "session_items_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "session_items_livelloId_fkey" FOREIGN KEY ("livelloId") REFERENCES "livelli" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_session_items" ("id", "sessionId", "livelloId", "titoloSnapshot", "livelloSnapshot", "ordine", "durataMinuti")
SELECT si."id", si."sessionId", si."livelloId", COALESCE(ex."titolo", ''), COALESCE(l."nome", ''), si."ordine", si."durataMinuti"
FROM "session_items" si
LEFT JOIN "livelli" l ON l."id" = si."livelloId"
LEFT JOIN "exercises" ex ON ex."id" = l."esercizioId";
DROP TABLE "session_items";
ALTER TABLE "new_session_items" RENAME TO "session_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
