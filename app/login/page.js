'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/app/actions/auth';

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2>United Carpi — Accedi</h2>
        <form action={action}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          {state?.error && <p className="auth-error">{state.error}</p>}
          <button className="btn btn-primary" type="submit" disabled={pending}>
            {pending ? 'Accesso in corso…' : 'Accedi'}
          </button>
        </form>
        <p className="auth-switch">Non hai un account? <Link href="/register">Registrati</Link></p>
      </div>
    </div>
  );
}
