import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { dateKey } from '../utils.js';

export default function Auth() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login({ email: form.email, password: form.password });
      else await register({ ...form, startDate: dateKey() });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <section className="auth-intro">
        <div className="brand brand-lg">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="brand-name">IELTS 90-Day Mastery Platform</span>
        </div>
        <h1>From foundations to Band 8.0+ in 90 days.</h1>
        <p>
          Six phases, 90 days and 449 study tasks across Listening, Reading, Writing,
          Speaking, vocabulary and grammar. Tick off each task and watch your progress climb.
        </p>
        <ul className="auth-facts">
          <li><strong>6</strong> phases</li>
          <li><strong>90</strong> days</li>
          <li><strong>449</strong> tasks</li>
        </ul>
      </section>

      <section className="auth-card">
        <h2>{mode === 'login' ? 'Sign in' : 'Create your account'}</h2>
        <form onSubmit={submit} noValidate>
          {mode === 'register' && (
            <label className="field">Name
              <input value={form.name} onChange={set('name')} autoComplete="name" required />
            </label>
          )}
          <label className="field">Email
            <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
          </label>
          <label className="field">Password
            <input type="password" value={form.password} onChange={set('password')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} required />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn btn-block" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Start Day 1'}
          </button>
        </form>
        <p className="switch">
          {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
          <button className="link-btn" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </section>
    </div>
  );
}
