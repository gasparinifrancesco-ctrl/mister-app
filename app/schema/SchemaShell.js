"use client";

import Script from "next/script";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";

export default function SchemaShell({ email, view, exerciseId }) {
  return (
    <>
      <div
        id="schema-app-data"
        data-view={view}
        data-exercise-id={exerciseId || ""}
        style={{ display: "none" }}
      />
      <div className="app-frame">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-title">Schema</span>
            <span className="season-badge">metodologia sedute</span>
            {email ? <span className="sidebar-user-email">{email}</span> : null}
          </div>
          <nav className="side-nav">
            <Link className="side-nav-btn" href="/schema">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
              <span>Libreria esercizi</span>
            </Link>
            <Link className="side-nav-btn" href="/">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              <span>United Carpi</span>
            </Link>
          </nav>
          <div className="sidebar-backup">
            <form action={logoutAction}>
              <button className="btn btn-small" type="submit">Esci</button>
            </form>
          </div>
        </aside>
        <div className="app-main">
          <main id="schema-view-content" className="app-content"></main>
        </div>
      </div>
      <div id="modal-overlay" className="modal-overlay" style={{ display: "none" }}>
        <div className="modal-box">
          <p id="modal-message"></p>
          <div className="modal-actions">
            <button className="btn" onClick={() => window.closeSchemaModal()}>Annulla</button>
            <button className="btn btn-danger" id="schema-modal-confirm-btn" onClick={() => window.triggerSchemaModalConfirm()}>Elimina</button>
          </div>
        </div>
      </div>
      <Script src="/schema.js" strategy="afterInteractive" />
    </>
  );
}
