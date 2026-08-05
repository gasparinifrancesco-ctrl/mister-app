'use client';

import { Suspense, useActionState, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { registerAction } from '@/app/actions/auth';
import { PERMISSION_LABELS } from '@/lib/permissions';

// useSearchParams() (per leggere ?invite=) richiede un confine Suspense, altrimenti il
// build fallisce ("should be wrapped in a suspense boundary") perché renderizzerebbe
// l'intera pagina lato client invece di poterne prerenderizzare almeno il guscio.
export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, undefined);
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite') || '';
  const [invite, setInvite] = useState(null); // { email, permissions } | { error } | null (nessun token)

  useEffect(() => {
    if (!inviteToken) return;
    fetch('/api/team/invites/preview?token=' + encodeURIComponent(inviteToken))
      .then((r) => r.json())
      .then(setInvite)
      .catch(() => setInvite({ error: 'Invito non verificabile.' }));
  }, [inviteToken]);

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <img className="auth-logo" src="/brand/mister-logo-horizontal-white.svg" alt="Mister" />
        <h2>Crea account</h2>
        {inviteToken && invite?.email && (
          <div className="auth-invite-banner">
            <p>Stai accettando un invito a collaborare con questi permessi:</p>
            {invite.permissions && invite.permissions.length ? (
              <ul>{invite.permissions.map((p) => <li key={p}>{PERMISSION_LABELS[p] || p}</li>)}</ul>
            ) : (
              <p><em>Nessun permesso ancora assegnato: l'amministratore potrà aggiungerli dopo l'accettazione.</em></p>
            )}
          </div>
        )}
        {inviteToken && invite?.error && (
          <p className="auth-error">{invite.error}</p>
        )}
        <form action={action}>
          <input type="hidden" name="invite" value={inviteToken} />
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" defaultValue={invite?.email || ''} key={invite?.email || 'empty'} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required autoComplete="new-password" minLength={8} />
          </div>
          <div className="field">
            <label htmlFor="password2">Conferma password</label>
            <input id="password2" name="password2" type="password" required autoComplete="new-password" minLength={8} />
          </div>
          {state?.error && <p className="auth-error">{state.error}</p>}
          <button className="btn btn-primary" type="submit" disabled={pending}>
            {pending ? 'Creazione in corso…' : 'Crea account'}
          </button>
        </form>
        <p className="auth-switch">Hai già un account? <Link href="/login">Accedi</Link></p>
      </div>
    </div>
  );
}
