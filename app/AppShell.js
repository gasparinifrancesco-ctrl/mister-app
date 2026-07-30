"use client";

import Script from "next/script";
import { logoutAction } from "@/app/actions/auth";

export default function AppShell({ email, schemaUnlocked }) {
  return (
    <>
      {/* Data attributes instead of an inline <script>: React's hydration reliably
          preserves attributes but does not re-execute dangerouslySetInnerHTML script
          content, so app.js reads this element instead of a window global. */}
      <div
        id="app-user-data"
        data-email={email}
        data-schema-unlocked={schemaUnlocked ? "1" : "0"}
        style={{ display: "none" }}
      />
      <div id="save-error-banner" style={{ display: "none" }}>
        <span>
          ⚠ Impossibile salvare: verifica la connessione al server. Le
          modifiche recenti potrebbero non essere state salvate.
        </span>
        <button
          onClick={(e) => {
            e.currentTarget.parentElement.style.display = "none";
          }}
          aria-label="Chiudi"
        >
          ×
        </button>
      </div>
      <div className="app-frame">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-title">United Carpi (Juniores èlite)</span>
            <span className="season-badge">2026/27</span>
            {email ? <span className="sidebar-user-email">{email}</span> : null}
          </div>
          <nav id="side-nav" className="side-nav"></nav>
          <div className="sidebar-backup">
            <button className="btn btn-small" onClick={() => window.exportBackup()}>
              Esporta backup
            </button>
            <button className="btn btn-small" onClick={() => window.triggerImportBackup()}>
              Importa backup
            </button>
            <form action={logoutAction}>
              <button className="btn btn-small" type="submit">Esci</button>
            </form>
          </div>
        </aside>
        <div className="app-main">
          <header id="next-match-bar" className="next-match-bar"></header>
          <main id="view-content" className="app-content"></main>
        </div>
      </div>
      <div id="print-area" className="print-only"></div>
      <div
        id="player-context-menu"
        className="context-menu"
        style={{ display: "none" }}
      ></div>
      <input
        type="file"
        id="backup-file-input"
        accept="application/json,.json"
        style={{ display: "none" }}
        onChange={(e) => window.handleBackupFile(e)}
      />
      <input
        type="file"
        id="calendario-import-file-input"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        style={{ display: "none" }}
        onChange={(e) => window.handleCalendarioImportFile(e)}
      />
      <div id="modal-overlay" className="modal-overlay" style={{ display: "none" }}>
        <div className="modal-box">
          <p id="modal-message"></p>
          <div className="modal-actions">
            <button className="btn" onClick={() => window.closeModal()}>
              Annulla
            </button>
            <button
              className="btn btn-danger"
              id="modal-confirm-btn"
              onClick={() => window.triggerModalConfirm()}
            >
              Elimina
            </button>
          </div>
        </div>
      </div>
      <div
        id="event-modal-overlay"
        className="modal-overlay"
        style={{ display: "none" }}
      >
        <div className="modal-box" id="event-modal-box" style={{ maxWidth: 440 }}></div>
      </div>
      <Script src="/app.js" strategy="afterInteractive" />
    </>
  );
}
