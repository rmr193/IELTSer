import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { dateKey } from '../utils.js';

const BANDS = [];
for (let b = 5; b <= 9; b += 0.5) BANDS.push(b);

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const d = useData();
  const [form, setForm] = useState({ name: user.name, targetBand: user.targetBand, startDate: user.startDate });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save(e) {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await updateProfile({ ...form, targetBand: Number(form.targetBand) });
      setMsg('Settings saved.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function reset() {
    if (window.confirm('Reset all progress? Every completed task will be cleared. This cannot be undone.')) {
      await d.resetProgress();
      setMsg('Progress reset. You can start again from Day 1.');
    }
  }

  return (
    <>
      <header className="page-head"><h1>Settings</h1></header>

      <section className="panel narrow">
        <form onSubmit={save}>
          <label className="field">Name<input value={form.name} onChange={set('name')} required /></label>
          <label className="field">Target band
            <select value={form.targetBand} onChange={set('targetBand')}>
              {BANDS.map((b) => <option key={b} value={b}>{b.toFixed(1)}</option>)}
            </select>
          </label>
          <label className="field">Course start date
            <input type="date" value={form.startDate} onChange={set('startDate')} required />
            <span className="hint">Day 1 is this date. &ldquo;Today&rdquo; on your dashboard is worked out from it.</span>
          </label>
          <div className="row-actions">
            <button className="btn">Save settings</button>
            <button type="button" className="btn btn-ghost" onClick={() => setForm({ ...form, startDate: dateKey() })}>Start today</button>
          </div>
          {msg && <p className="note success" role="status">{msg}</p>}
          {error && <p className="error" role="alert">{error}</p>}
        </form>
      </section>

      <section className="panel narrow">
        <h2>Account & Session</h2>
        <p className="muted" style={{ margin: '0.35rem 0 1rem' }}>
          Signed in as <strong>{user.name}</strong> ({user.email}).
        </p>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => { logout(); navigate('/'); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </section>

      <section className="panel narrow danger-zone">
        <h2>Start over</h2>
        <p className="muted">Clear every completed task and begin again. Your score history is kept.</p>
        <button className="btn btn-danger" onClick={reset}>Reset progress</button>
      </section>
    </>
  );
}
