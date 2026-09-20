import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';

export default function Roadmap() {
  const d = useData();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash && d.ready) document.querySelector(hash)?.scrollIntoView({ block: 'start' });
  }, [hash, d.ready]);

  return (
    <>
      <header className="page-head">
        <h1>90-day roadmap</h1>
        <p className="muted">Select any day to open its tasks. Today is highlighted.</p>
      </header>

      {d.phaseStats.map((p) => (
        <section className="panel phase" id={`phase-${p.id}`} key={p.id}>
          <div className="phase-head">
            <div>
              <h2>Phase {p.id}: {p.name}</h2>
              <p className="muted">Days {p.startDay} to {p.endDay}. Target band {p.band}.</p>
              <p className="phase-goal">{p.goal}</p>
            </div>
            <div className="phase-progress">
              <strong>{Math.round(p.pct * 100)}%</strong>
              <span className="muted">{p.done}/{p.total} tasks</span>
            </div>
          </div>
          <ul className="days">
            {Array.from({ length: p.endDay - p.startDay + 1 }, (_, i) => p.startDay + i).map((day) => {
              const s = d.dayStats(day);
              const titleText = d.tasksByDay[day - 1]?.[0]?.dayTitle;
              const cls = [
                'day',
                s.complete ? 'is-complete' : s.done ? 'is-partial' : '',
                day === d.currentDay ? 'is-today' : '',
              ].join(' ');
              return (
                <li key={day}>
                  <Link
                    to={`/day/${day}`}
                    className={cls}
                    title={titleText ? `Day ${day}: ${titleText}` : `Day ${day}`}
                    aria-label={`Day ${day}${titleText ? `: ${titleText}` : ''}, ${s.done} of ${s.total} tasks done${day === d.currentDay ? ', today' : ''}`}
                  >
                    <span className="day-num">{day}</span>
                    <span className="day-dots" aria-hidden="true">
                      {d.tasksByDay[day - 1].map((t) => <i key={t.number} className={d.isDone(t.number) ? 'on' : ''} />)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}
