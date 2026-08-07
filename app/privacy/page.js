import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Mister",
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px 80px" }}>
      <Link href="/" style={{ color: "var(--accent)" }}>&larr; Torna alla home</Link>
      <h1 style={{ marginTop: "24px" }}>Privacy Policy di Mister</h1>
      <p style={{ color: "var(--text-dim)" }}>Ultimo aggiornamento: 7 agosto 2026</p>

      <h2>Chi tratta i tuoi dati</h2>
      <p>
        Mister è un servizio gestito da Francesco Gasparini. Per qualsiasi domanda sui
        tuoi dati o su questa informativa puoi scrivere a{" "}
        <a href="mailto:gasparini.francesco@gmail.com">gasparini.francesco@gmail.com</a>.
      </p>

      <h2>Che dati raccogliamo</h2>
      <p>Quando crei un account raccogliamo: email e password (salvata in forma cifrata, mai in chiaro).</p>
      <p>
        Se usi Mister per gestire una squadra, tu (l&apos;allenatore o chi crea l&apos;account) inserisci
        volontariamente dati sui giocatori: nome, ruolo, anno di nascita, valutazioni, presenze e note
        che decidi tu di scrivere. Questi dati sono inseriti da te, sotto la tua responsabilità, per
        gestire la tua squadra — Mister li conserva e te li restituisce, non li usa per altri scopi.
      </p>
      <p>
        <strong>Dati di minorenni.</strong> Sappiamo che molti giocatori gestiti nell&apos;app sono
        minorenni. Non chiediamo mai direttamente dati ai minori: è l&apos;allenatore/società a inserirli,
        nell&apos;ambito della normale gestione sportiva della squadra. Raccogliamo solo l&apos;anno di
        nascita (non la data completa) e nessun altro dato sensibile oltre a quanto serve a
        organizzare allenamenti e partite.
      </p>

      <h2>Perché usiamo questi dati</h2>
      <p>
        Solo per fornirti il servizio che hai richiesto: farti gestire rosa, calendario, formazioni e
        allenamenti della tua squadra. Non vendiamo né condividiamo i tuoi dati con terzi per scopi
        pubblicitari o commerciali.
      </p>

      <h2>Dove sono conservati i dati</h2>
      <p>
        I dati sono conservati su server in Europa (Francoforte, Germania), tramite i fornitori
        tecnici Vercel (hosting) e Neon (database). Questi fornitori trattano i dati solo per nostro
        conto, secondo le loro policy di sicurezza.
      </p>

      <h2>Quanto conserviamo i dati</h2>
      <p>
        Finché il tuo account resta attivo. Se chiudi l&apos;account o ci scrivi chiedendo la
        cancellazione, eliminiamo i tuoi dati e quelli della tua squadra entro un tempo ragionevole,
        salvo obblighi di legge che richiedano di conservarne alcuni più a lungo.
      </p>

      <h2>I tuoi diritti</h2>
      <p>
        Puoi in qualsiasi momento chiederci di vedere, correggere o cancellare i tuoi dati (o quelli
        della tua squadra), scrivendo all&apos;indirizzo email sopra. Rispondiamo il prima possibile.
      </p>

      <h2>Cookie</h2>
      <p>
        Usiamo un solo cookie tecnico, necessario per farti restare collegato dopo il login (dura 7
        giorni). Non usiamo cookie pubblicitari o di tracciamento.
      </p>

      <h2>Modifiche a questa informativa</h2>
      <p>
        Se cambieremo in modo rilevante come trattiamo i dati, aggiorneremo questa pagina e, se
        necessario, ti avviseremo direttamente.
      </p>
    </div>
  );
}
