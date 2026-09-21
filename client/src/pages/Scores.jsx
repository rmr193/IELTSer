import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { dateKey, formatDate } from '../utils.js';

const PARTS = ['listening', 'reading', 'writing', 'speaking'];
const emptyForm = () => ({ date: dateKey(), type: 'mock', listening: '', reading: '', writing: '', speaking: '', note: '' });

function Chart({ scores, target }) {
  const W = 1000, H = 260, P = { l: 40, r: 24, t: 20, b: 32 };
  const lo = 4, hi = 9;
  const x = (i) => (scores.length === 1 ? (W + P.l - P.r) / 2 : P.l + (i * (W - P.l - P.r)) / (scores.length - 1));
  const y = (v) => P.t + ((hi - v) / (hi - lo)) * (H - P.t - P.b);
  const line = scores.map((s, i) => `${i ? 'L' : 'M'}${x(i)},${y(Math.max(lo, s.overall))}`).join(' ');

  return (
    <div className="chart-container">
      <div className="chart-scroll-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Overall band score over time">
          {[4, 5, 6, 7, 8, 9].map((v) => (
            <g key={v}>
              <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="var(--line)" />
              <text x={P.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{v}</text>
            </g>
          ))}
          <line x1={P.l} x2={W - P.r} y1={y(target)} y2={y(target)} stroke="var(--teal)" strokeDasharray="5 5" />
          <text x={W - P.r} y={y(target) - 6} textAnchor="end" fontSize="11" fill="var(--teal)">Target {target.toFixed(1)}</text>
          {scores.length > 1 && <path d={line} fill="none" stroke="var(--ink)" strokeWidth="2.5" />}
          {scores.map((s, i) => (
            <g key={s.id}>
              <circle cx={x(i)} cy={y(Math.max(lo, s.overall))} r="5" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
              <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--muted)">
                {new Date(s.date + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default function Scores() {
  const { user } = useAuth();
  const [scores, setScores] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.scores().then(setScores).catch((e) => setError(e.message));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const created = await api.addScore(form);
      setScores((s) => [...s, created].sort((a, b) => a.date.localeCompare(b.date)));
      setForm(emptyForm());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    await api.deleteScore(id);
    setScores((s) => s.filter((x) => x.id !== id));
  }

  const latest = scores?.length ? scores[scores.length - 1] : null;

  return (
    <>
      <header className="page-head">
        <h1>Score tracker</h1>
        <p className="muted">Log your mock and practice test bands. The overall band is the average of the four skills, rounded to the nearest half band.</p>
      </header>

      <section className="panel">
        <div className="panel-head row">
          <h2>Overall band over time</h2>
          {latest && <span className="muted">Latest {latest.overall.toFixed(1)} of target {user.targetBand.toFixed(1)}</span>}
        </div>
        {scores === null ? <p className="muted">Loading…</p> : scores.length ? (
          <Chart scores={scores} target={user.targetBand} />
        ) : (
          <p className="empty">No scores yet. Add your first result below, for example your Day 1 diagnostic or Mock Test 1 on Day 78.</p>
        )}
      </section>

      <section className="panel">
        <div className="panel-head"><h2>Add a score</h2></div>
        <form className="score-form" onSubmit={submit}>
          <label className="field date-field">Date<input type="date" value={form.date} onChange={set('date')} required /></label>
          <label className="field type-field">Type
            <select value={form.type} onChange={set('type')}>
              <option value="mock">Mock test</option>
              <option value="practice">Practice</option>
            </select>
          </label>
          <div className="score-skills-grid">
            {PARTS.map((p) => (
              <label className="field" key={p}>{p[0].toUpperCase() + p.slice(1)}
                <input type="number" min="0" max="9" step="0.5" inputMode="decimal" value={form[p]} onChange={set(p)} required />
              </label>
            ))}
          </div>
          <label className="field wide">Note (optional)
            <input value={form.note} onChange={set('note')} maxLength={200} placeholder="For example: Cambridge 17, Test 2" />
          </label>
          <button className="btn btn-block" disabled={busy}>{busy ? 'Saving…' : 'Save score'}</button>
        </form>
        {error && <p className="error" role="alert">{error}</p>}
      </section>

      {scores?.length > 0 && (
        <section className="panel">
          <div className="panel-head"><h2>History</h2></div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Date</th><th>Type</th><th>L</th><th>R</th><th>W</th><th>S</th><th>Overall</th><th>Note</th><th /></tr>
              </thead>
              <tbody>
                {[...scores].reverse().map((s) => (
                  <tr key={s.id}>
                    <td>{formatDate(s.date)}</td>
                    <td>{s.type === 'mock' ? 'Mock' : 'Practice'}</td>
                    <td>{s.listening}</td><td>{s.reading}</td><td>{s.writing}</td><td>{s.speaking}</td>
                    <td><strong>{s.overall.toFixed(1)}</strong></td>
                    <td className="note-cell">{s.note}</td>
                    <td><button className="link-btn danger" onClick={() => remove(s.id)} aria-label={`Delete score from ${formatDate(s.date)}`}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
