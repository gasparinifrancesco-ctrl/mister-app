"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { logoutAction } from "@/app/actions/auth";
import { deriveAccentPalette } from "@/lib/color";

export default function AppShell({ email, nome, cognome, ruolo, accentColor, temaChiaro, isOwner, permissions, actorId, schemaUnlocked, stagione }) {
  const squadraLabel = [stagione?.tipoSquadra, stagione?.livello].filter(Boolean).join(" ");
  const displayName = [nome, cognome].filter(Boolean).join(" ");
  // Solo --accent* cambia (mai bg/pannelli/testo): calcolato lato server per evitare un
  // lampo del colore di default prima che il client applichi la scelta dell'utente.
  const palette = accentColor ? deriveAccentPalette(accentColor) : null;
  // Preferenza personale (mai letta dal proprietario per un collaboratore, vedi
  // getCurrentUser): scambia solo sfondo/pannelli/bordi/testo, mai --accent* (quello resta
  // il colore squadra) — calcolato lato server per lo stesso motivo della palette accent,
  // niente lampo del tema scuro di default prima che React idrati.
  const LIGHT_THEME_CSS = ":root{--bg:#FFFFFF;--panel:#F6F6F4;--panel-2:#ECECE8;--border:rgba(0,0,0,0.12);--chalk:#111111;--text:#1C1C1C;--text-dim:#6B6B6B;--shadow-card:0 1px 2px rgba(0,0,0,0.10);--shadow-elevated:0 10px 28px rgba(0,0,0,0.18);}";
  // Su telefono la barra di navigazione in alto non ha spazio per "Esporta/Importa
  // backup" ed "Esci" insieme alle 6 voci di navigazione (misurato: ~1100px di
  // contenuto su un viewport da 375px). Questi tre pulsanti, usati raramente, si
  // spostano in un menu a comparsa dietro un'iconetta "⋯" — invisibile sopra i 760px,
  // dove restano sempre visibili nella sidebar come prima.
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  useEffect(() => {
    if (!moreOpen) return;
    function onDocClick(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [moreOpen]);
  return (
    <>
      {palette && (
        <style>{":root{--accent:" + palette.accent + ";--accent-hover:" + palette.accentHover + ";--accent-dim:" + palette.accentDim + ";--accent-wash:" + palette.accentWash + ";--accent-rgb:" + palette.accentRgb + ";}"}</style>
      )}
      {temaChiaro && <style>{LIGHT_THEME_CSS}</style>}
      {/* Data attributes instead of an inline <script>: React's hydration reliably
          preserves attributes but does not re-execute dangerouslySetInnerHTML script
          content, so app.js reads this element instead of a window global. */}
      <div
        id="app-user-data"
        data-email={email}
        data-nome={nome || ""}
        data-cognome={cognome || ""}
        data-ruolo={ruolo || ""}
        data-accent-color={accentColor || ""}
        data-tema-chiaro={temaChiaro ? "1" : "0"}
        data-is-owner={isOwner === false ? "0" : "1"}
        data-permissions={JSON.stringify(permissions || [])}
        data-actor-id={actorId || ""}
        data-schema-unlocked={schemaUnlocked ? "1" : "0"}
        data-stagione-etichetta={stagione?.etichetta || ""}
        data-stagione-societa={stagione?.societa || ""}
        data-stagione-tipo={stagione?.tipoSquadra || ""}
        data-stagione-livello={stagione?.livello || ""}
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
            <img className="app-brand-logo" src="/brand/mister-logo-horizontal-white.svg" alt="Mister" />
            <button className="brand-title brand-title-btn" onClick={() => window.openStagioni && window.openStagioni()} title="Gestisci stagioni">
              {stagione?.societa || "Società non impostata"}
            </button>
            {squadraLabel ? <span className="brand-subtitle">{squadraLabel}</span> : null}
            <span className="season-badge">{stagione?.etichetta || "—"}</span>
            {email ? (
              <button className="sidebar-user-email sidebar-user-btn" onClick={() => window.openProfileModal && window.openProfileModal()} title="Il mio profilo">
                {displayName || email}
              </button>
            ) : null}
          </div>
          <nav id="side-nav" className="side-nav"></nav>
          <div className="sidebar-more" ref={moreRef}>
            <button
              className="mobile-more-toggle"
              onClick={() => setMoreOpen((v) => !v)}
              aria-label="Altre azioni"
              aria-expanded={moreOpen}
              aria-haspopup="true"
            >
              ⋯
            </button>
            <div className={"sidebar-backup" + (moreOpen ? " sidebar-backup-open" : "")}>
              <button className="btn btn-small" onClick={() => { window.exportBackup(); setMoreOpen(false); }}>
                Esporta backup
              </button>
              <button className="btn btn-small" onClick={() => { window.triggerImportBackup(); setMoreOpen(false); }}>
                Importa backup
              </button>
              <form action={logoutAction}>
                <button className="btn btn-small" type="submit">Esci</button>
              </form>
            </div>
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
