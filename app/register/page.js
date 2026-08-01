'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction } from '@/app/actions/auth';

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, undefined);

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2>Mister — Crea account</h2>
        <form action={action}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" />
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
