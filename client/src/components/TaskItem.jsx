import { SKILLS, formatMinutes } from '../utils.js';

export default function TaskItem({ task, done, onToggle, compact = false }) {
  const skill = SKILLS[task.skill];
  return (
    <li className={`task ${done ? 'is-done' : ''}`} style={{ '--skill': skill.color }}>
      <label className="check">
        <input
          type="checkbox"
          checked={done}
          onChange={() => onToggle(!done)}
          aria-label={`Mark "${task.title}" as ${done ? 'not done' : 'done'}`}
        />
        <span className="box" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </label>
      <div className="task-body">
        <h3>{task.title}</h3>
        {!compact && <p>{task.description}</p>}
        <div className="task-meta">
          <span className="skill-tag">{skill.label}</span>
          <span>{formatMinutes(task.minutes)}</span>
        </div>
      </div>
    </li>
  );
}
