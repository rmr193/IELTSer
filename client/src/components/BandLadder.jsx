import { Link } from 'react-router-dom';

const DARK_FROM = 3; // steps from this index use light text

export default function BandLadder({ phaseStats, currentPhaseId }) {
  return (
    <ol className="ladder">
      {phaseStats.map((p, i) => (
        <li key={p.id} className="ladder-item">
          <Link
            to={`/roadmap#phase-${p.id}`}
            className={`step tone-${i} ${i >= DARK_FROM ? 'on-dark' : ''} ${p.id === currentPhaseId ? 'is-current' : ''}`}
            style={{ '--rise': `${88 + i * 26}px` }}
            aria-current={p.id === currentPhaseId ? 'step' : undefined}
          >
            <span className="step-band">{p.band}</span>
            <span className="step-name">{p.name}</span>
            <span className="step-count">{p.done}/{p.total} tasks</span>
            <span className="step-track"><span style={{ width: `${Math.round(p.pct * 100)}%` }} /></span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
