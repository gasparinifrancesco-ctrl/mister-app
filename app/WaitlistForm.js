'use client';

import { useState } from 'react';

const RUOLI = [
  { value: 'allenatore', label: 'Allenatore' },
  { value: 'dirigente', label: 'Dirigente' },
  { value: 'collaboratore-staff', label: 'Collaboratore di staff' },
];

export default function WaitlistForm() {
  const [status, setStatus] = useState('idle'); // idle | pending | done | error
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('pending');
    setError('');
    const form = e.target;
    const body = {
      email: form.email.value,
      ruolo: form.ruolo.value,
      categoria: form.categoria.value,
      numeroCollaboratori: form.numeroCollaboratori.value,
    };
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Errore imprevisto, riprova.');
        setStatus('error');
        return;
      }
      setStatus('done');
    } catch {
      setError('Errore di rete, riprova.');
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="waitlist-done">
        <p>Iscrizione ricevuta. Ti scriviamo appena arriva il tuo turno.</p>
      </div>
    );
  }

  return (
    <form className="waitlist-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="field field-grow">
          <label htmlFor="wl-email">Email</label>
          <input id="wl-email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="field field-grow">
          <label htmlFor="wl-ruolo">Il tuo ruolo</label>
          <select id="wl-ruolo" name="ruolo" required defaultValue="">
            <option value="" disabled>Scegli...</option>
            {RUOLI.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="field field-grow">
          <label htmlFor="wl-categoria">Categoria che alleni</label>
          <input id="wl-categoria" name="categoria" type="text" required placeholder="Es. Under 15, Prima squadra, Femminile..." />
        </div>
        <div className="field">
          <label htmlFor="wl-collab">Collaboratori nello staff</label>
          <input id="wl-collab" name="numeroCollaboratori" type="number" min="0" required placeholder="0" />
        </div>
      </div>
      {status === 'error' && <p className="auth-error">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={status === 'pending'}>
        {status === 'pending' ? 'Invio…' : 'Iscrivimi alla lista d’attesa'}
      </button>
      <p className="waitlist-privacy">
        Usiamo la tua email solo per contattarti riguardo l&apos;accesso a Mister: nessuna newsletter,
        nessuna condivisione con terzi. L&apos;informativa privacy completa sarà disponibile prima
        dell&apos;attivazione dell&apos;account.
      </p>
    </form>
  );
}
