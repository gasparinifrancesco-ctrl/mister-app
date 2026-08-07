# Backup automatici — Mister

Questo branch (`backups`) contiene solo i backup periodici del database di produzione,
creati automaticamente ogni giorno da `.github/workflows/backup.yml` (sul branch `main`).
Non contiene codice dell'app.

I file dentro `dumps/` sono copie del database in formato `pg_dump --format=custom`,
ripristinabili con `pg_restore`. Le copie più vecchie di 30 giorni vengono eliminate
automaticamente a ogni esecuzione.
