import { Link, Navigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import TaskItem from '../components/TaskItem.jsx';
import { TOTAL_DAYS, formatMinutes } from '../utils.js';

export default function Day() {
  const { day: param } = useParams();
  const d = useData();
  const day = Number(param);
  if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS) return <Navigate to="/roadmap" replace />;

  const tasks = d.tasksByDay[day - 1];
  const phase = d.phaseOf(day);
  const stats = d.dayStats(day);
  const minutes = tasks.reduce((s, t) => s + t.minutes, 0);
  const dayTitle = tasks[0]?.dayTitle;
  const dayTip = tasks[0]?.dayTip;

  return (
    <>
      <header className="page-head">
        <p className="muted">Phase {phase.id}: {phase.name}{day === d.currentDay ? '. This is today.' : ''}</p>
        <h1>Day {day}{dayTitle ? `: ${dayTitle}` : ''}</h1>
        {dayTip && (
          <div className="day-tip-banner">
            <span className="tip-icon" aria-hidden="true">💡</span>
            <p>{dayTip}</p>
          </div>
        )}
        <p className="muted">
          {stats.done} of {stats.total} tasks done. About {formatMinutes(minutes)} of study.
        </p>
        <div className="bar bar-lg" aria-hidden="true"><span style={{ width: `${(stats.done / stats.total) * 100}%` }} /></div>
      </header>

      <section className="panel">
        <ul className="task-list">
          {tasks.map((t) => (
            <TaskItem key={t.number} task={t} done={d.isDone(t.number)} onToggle={(v) => d.setTask(t.number, v)} />
          ))}
        </ul>
        <div className="day-actions">
          <button className="btn" onClick={() => d.setDay(day, !stats.complete)}>
            {stats.complete ? 'Mark all as not done' : 'Mark all as done'}
          </button>
        </div>
        {stats.complete && <p className="note success">Day {day} complete. {day < TOTAL_DAYS ? 'Move on to the next day when you are ready.' : 'You have finished the whole course.'}</p>}
      </section>

      <nav className="pager" aria-label="Day navigation">
        {day > 1 ? <Link className="btn btn-ghost" to={`/day/${day - 1}`}>Day {day - 1}</Link> : <span />}
        <Link className="text-link" to="/roadmap">All days</Link>
        {day < TOTAL_DAYS ? <Link className="btn btn-ghost" to={`/day/${day + 1}`}>Day {day + 1}</Link> : <span />}
      </nav>
    </>
  );
}
