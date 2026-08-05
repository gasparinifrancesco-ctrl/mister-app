import Link from "next/link";
import WaitlistForm from "@/app/WaitlistForm";

const ICONS = {
  users: "M12 8a4 4 0 100 8 4 4 0 000-8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8",
  pitch: "M3 4h18v16H3zM12 4v16M12 12a3 3 0 100 6 3 3 0 000-6z",
  calendar: "M3 5h18v16H3zM3 10h18M8 3v7M16 3v7",
  dumbbell: "M2 9h3v6H2zM19 9h3v6h-3zM5 12h14M6 7h2v10H6zM16 7h2v10h-2z",
  chart: "M4 20V10M10 20V4M16 20v-7M2 20h20",
  shield: "M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z",
  layers: "M12 3l9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5",
  download: "M12 3v12M7 10l5 5 5-5M4 19h16",
};

function Icon({ name }) {
  return (
    <svg className="landing-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

const DIFFERENTIATORS = [
  {
    problem: "Il mister usa strumenti diversi dai suoi collaboratori: ogni informazione va tradotta a mano da un formato all'altro.",
    solution: "Un sistema unico condiviso da tutto lo staff: chi segna un dato lo rende visibile a tutti gli altri, subito.",
  },
  {
    problem: "I gestionali \"da segreteria\" chiedono tesseramenti, quote e documenti che non ti servono ogni settimana.",
    solution: "Mister si occupa solo di quello che usi davvero: rosa, formazioni, calendario, allenamenti.",
  },
  {
    problem: "Rosa su un foglio Excel, convocazioni su WhatsApp, esercizi su un quaderno.",
    solution: "Tutto nello stesso posto, sempre aggiornato e visibile a tutto lo staff.",
  },
];

const FEATURES = [
  { icon: "users", title: "Rosa & presenze", desc: "Anagrafica giocatori, ruoli e disponibilità, con lo storico presenze sempre a portata di mano." },
  { icon: "pitch", title: "Formazioni & tattica", desc: "Lavagna tattica drag & drop, moduli di gioco, convocazioni e distinta gara." },
  { icon: "calendar", title: "Calendario stagione", desc: "Partite, allenamenti e promemoria in un unico calendario, senza incroci di impegni." },
  { icon: "dumbbell", title: "Modulo Allenamenti", desc: "Libreria di esercizi con progressioni, costruttore di sedute e carico di lavoro." },
  { icon: "chart", title: "Statistiche & valutazioni", desc: "Tabellino partite, voti ai giocatori e andamento della stagione a colpo d'occhio." },
  { icon: "shield", title: "Staff & permessi", desc: "Invita il tuo staff con permessi granulari: ognuno vede solo ciò che gli serve." },
  { icon: "layers", title: "Multi-stagione", desc: "Chiudi una stagione e passa alla successiva senza perdere nulla dell'archivio." },
  { icon: "download", title: "Esporta e condividi", desc: "Rosa, calendario e sedute pronti in PDF o immagine da inviare a giocatori e famiglie." },
];

const STEPS = [
  { n: "1", title: "Crea la tua stagione", desc: "Squadra, categoria e livello: bastano pochi dati per iniziare." },
  { n: "2", title: "Costruisci rosa e calendario", desc: "Aggiungi i giocatori, imposta partite e allenamenti, disegna le formazioni." },
  { n: "3", title: "Alleniamo, giochiamo, monitoriamo", desc: "Presenze, sedute e statistiche si aggiornano da soli, settimana dopo settimana." },
];

const EARLY_ACCESS_POINTS = [
  "L'app è già completa e funzionante: non è un progetto sulla carta.",
  "È nata sul campo: chi l'ha creata la usa ogni settimana per allenare la propria squadra.",
  "È ancora giovane e in evoluzione — chi entra ora aiuta a decidere quali funzionalità arrivano dopo.",
];

const FAQS = [
  { q: "Perché una lista d'attesa e non un accesso diretto?", a: "Facciamo entrare i nuovi allenatori in ordine cronologico di iscrizione, senza priorità: cresciamo con calma per garantire qualità e supporto reale a chi entra, anche per motivi tecnici di capacità dei nostri server." },
  { q: "Quando verrò contattato?", a: "Non appena arriva il tuo turno in lista, all'email che ci lasci nel form. Nessuna richiesta di pagamento: l'accesso in questa fase è gratuito." },
  { q: "Devo installare qualcosa?", a: "No, è un'applicazione web: funziona dal browser su computer, tablet e telefono, senza installazioni." },
  { q: "I miei dati sono privati?", a: "Sì. Ogni account vede solo i propri dati e puoi invitare il tuo staff con permessi personalizzati per ogni area." },
  { q: "Posso portarmi via i miei dati?", a: "Sì: rosa, calendario e sedute si esportano in PDF o immagine in un click, in qualsiasi momento." },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <img className="landing-nav-logo" src="/brand/mister-logo-horizontal-white.svg" alt="Mister" />
          <nav className="landing-nav-links">
            <a href="#funzionalita">Funzionalità</a>
            <a href="#come-funziona">Come funziona</a>
            <a href="#faq">Domande</a>
          </nav>
          <div className="landing-nav-actions">
            <Link href="/login" className="btn-link">Accedi</Link>
            <a href="#waitlist" className="btn btn-primary btn-small">Iscriviti</a>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <span className="landing-eyebrow">Lista d&apos;attesa aperta</span>
          <h1>Quello che sa il tuo staff, lo sai anche tu — subito.</h1>
          <p className="landing-hero-sub">
            Le indisponibilità segnate dal team manager arrivano già pronte per costruire la
            seduta. Nessuno chiede, nessuno aggiorna due volte.
          </p>
          <div className="landing-hero-cta">
            <a href="#waitlist" className="btn btn-primary">Iscriviti alla lista d&apos;attesa</a>
            <Link href="/login" className="btn">Accedi</Link>
          </div>
          <p className="landing-hero-note">Gratuito. Attivazioni in ordine di iscrizione.</p>
        </section>

        <section className="landing-problems">
          <h2 className="landing-section-title">Perché Mister è diverso</h2>
          <div className="landing-problems-grid">
            {DIFFERENTIATORS.map((p) => (
              <div className="landing-problem-card" key={p.problem}>
                <p className="landing-problem-before">{p.problem}</p>
                <p className="landing-problem-after">{p.solution}</p>
              </div>
            ))}
          </div>
          <div className="landing-example">
            <p>
              <strong>Un esempio concreto:</strong> il tabellino della partita si inserisce una
              sola volta. Da lì escono da sole le statistiche di stagione, lo storico dei giocatori
              e i resoconti che puoi esportare per giocatori e famiglie. Zero doppio lavoro.
            </p>
          </div>
        </section>

        <section className="landing-features" id="funzionalita">
          <h2 className="landing-section-title">Cosa puoi fare</h2>
          <div className="landing-features-grid">
            {FEATURES.map((f) => (
              <div className="landing-feature-card" key={f.title}>
                <span className="landing-feature-icon"><Icon name={f.icon} /></span>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-steps" id="come-funziona">
          <h2 className="landing-section-title">Come funziona</h2>
          <div className="landing-steps-grid">
            {STEPS.map((s) => (
              <div className="landing-step-card" key={s.n}>
                <span className="landing-step-num">{s.n}</span>
                <h3 className="landing-feature-title">{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-early-access">
          <h2 className="landing-section-title">Cosa significa &quot;accesso anticipato&quot;</h2>
          <ul className="landing-early-access-list">
            {EARLY_ACCESS_POINTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="landing-waitlist" id="waitlist">
          <h2 className="landing-section-title">Iscriviti alla lista d&apos;attesa</h2>
          <p className="landing-waitlist-intro">
            Le attivazioni seguono l&apos;ordine cronologico di iscrizione, senza priorità:
            cresciamo con calma per garantire qualità e supporto reale a chi entra.
          </p>
          <div className="landing-waitlist-card">
            <WaitlistForm />
          </div>
        </section>

        <section className="landing-faq" id="faq">
          <h2 className="landing-section-title">Domande frequenti</h2>
          <div className="landing-faq-list">
            {FAQS.map((f) => (
              <details className="landing-faq-item" key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <img className="landing-footer-logo" src="/brand/mister-logo-horizontal-white.svg" alt="Mister" />
        <p>Il gestionale per l&apos;allenatore dilettante.</p>
        <div className="landing-footer-links">
          <Link href="/login">Accedi</Link>
          <a href="#waitlist">Lista d&apos;attesa</a>
        </div>
      </footer>
    </div>
  );
}
