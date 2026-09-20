import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import BandLadder from '../components/BandLadder.jsx';
import TaskItem from '../components/TaskItem.jsx';
import { SKILLS, TOTAL_DAYS, daysSince } from '../utils.js';

export default function Dashboard() {
  const { user } = useAuth();
  const d = useData();
  const firstName = user.name.split(' ')[0];

  const phase = d.phaseOf(d.currentDay);
  const todays = d.tasksByDay[d.currentDay - 1];
  const todayTitle = todays?.[0]?.dayTitle;
  const todayTip = todays?.[0]?.dayTip;
  const todayStats = d.dayStats(d.currentDay);
  const untilStart = -daysSince(user.startDate);
  const finished = d.doneCount === d.totalCount;

  const behind = d.currentDay - 1 - d.daysCompleted; // days elapsed but not fully done

  return (
    <>
      <header className="hero">
        <div className="hero-text">
          <p className="hello">
            {finished ? `Well done, ${firstName}. You finished the course.` : `Hi ${firstName}, today is`}
          </p>
          <h1>{finished ? 'All 449 tasks complete' : `Day ${d.currentDay}${todayTitle ? `: ${todayTitle}` : ` of ${TOTAL_DAYS}`}`}</h1>
          <p className="hero-sub">
            {untilStart > 0
              ? `Your plan starts in ${untilStart} day${untilStart === 1 ? '' : 's'}. You can begin early.`
              : (todayTip || `Phase ${phase.id}: ${phase.name}. ${phase.goal}`)}
          </p>
          <div className="hero-actions">
            <Link className="btn" to={`/day/${d.currentDay}`}>
              {todayStats.complete ? `Review Day ${d.currentDay}` : todayStats.done ? `Continue Day ${d.currentDay}` : `Start Day ${d.currentDay}`}
            </Link>
            <Link className="btn btn-ghost" to="/roadmap">See the roadmap</Link>
          </div>
        </div>
        <ProgressRing value={d.pct} size={148} stroke={14} label="of course" />
      </header>

      <section className="panel">
        <div className="panel-head">
          <h2>Your route to Band {user.targetBand.toFixed(1)}</h2>
          <p className="muted">Each step is a phase. Select one to see its days.</p>
        </div>
        <BandLadder phaseStats={d.phaseStats} currentPhaseId={phase.id} />
      </section>

      <section className="stats">
        <div className="stat"><span className="stat-num">{d.doneCount}<small>/{d.totalCount}</small></span><span className="stat-label">Tasks done</span></div>
        <div className="stat"><span className="stat-num">{d.daysCompleted}<small>/{TOTAL_DAYS}</small></span><span className="stat-label">Days completed</span></div>
        <div className="stat"><span className="stat-num">{d.streak}<small> day{d.streak === 1 ? '' : 's'}</small></span><span className="stat-label">Current streak</span></div>
        <div className="stat"><span className="stat-num">{Math.round(d.minutesDone / 60)}<small> h</small></span><span className="stat-label">Time studied</span></div>
      </section>

      <div className="two-col">
        <section className="panel">
          <div className="panel-head row">
            <h2>Today&rsquo;s tasks</h2>
            <span className="muted">{todayStats.done} of {todayStats.total} done</span>
          </div>
          <ul className="task-list">
            {todays.map((t) => (
              <TaskItem key={t.number} task={t} done={d.isDone(t.number)} onToggle={(v) => d.setTask(t.number, v)} compact />
            ))}
          </ul>
          <Link className="text-link" to={`/day/${d.currentDay}`}>Open full instructions for Day {d.currentDay}</Link>
          {behind > 0 && !finished && (
            <p className="note">You have {behind} earlier day{behind === 1 ? '' : 's'} not fully finished. Open the roadmap to catch up.</p>
          )}
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Progress by skill</h2></div>
          <ul className="skill-bars">
            {d.skillStats.map((s) => (
              <li key={s.skill} style={{ '--skill': SKILLS[s.skill].color }}>
                <div className="skill-bar-head">
                  <span>{SKILLS[s.skill].label}</span>
                  <span className="muted">{s.done}/{s.total}</span>
                </div>
                <div className="bar"><span style={{ width: `${Math.round(s.pct * 100)}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
