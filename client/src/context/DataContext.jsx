import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from './AuthContext.jsx';
import { TOTAL_DAYS, SKILLS, clamp, dateKey, daysSince } from '../utils.js';

const DataContext = createContext(null);
export const useData = () => useContext(DataContext);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [curriculum, setCurriculum] = useState(null);
  const [done, setDone] = useState({}); // task number -> ISO completion time
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setCurriculum(null);
      setDone({});
      return undefined;
    }
    let cancelled = false;
    setError('');
    Promise.all([api.curriculum(), api.progress()])
      .then(([c, p]) => {
        if (cancelled) return;
        setCurriculum(c);
        setDone(Object.fromEntries(p.map((x) => [x.task, x.completedAt])));
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const setTask = useCallback(async (number, value) => {
    const prev = done[number];
    setDone((d) => {
      const next = { ...d };
      if (value) next[number] = new Date().toISOString();
      else delete next[number];
      return next;
    });
    try {
      await api.setTask(number, value);
    } catch (e) {
      setDone((d) => {
        const next = { ...d };
        if (prev) next[number] = prev;
        else delete next[number];
        return next;
      });
      setError(e.message);
    }
  }, [done]);

  const setDay = useCallback(async (day, value) => {
    const nums = curriculum.tasks.filter((t) => t.day === day).map((t) => t.number);
    const before = done;
    setDone((d) => {
      const next = { ...d };
      const now = new Date().toISOString();
      nums.forEach((n) => {
        if (value) next[n] = next[n] || now;
        else delete next[n];
      });
      return next;
    });
    try {
      await api.setDay(day, value);
    } catch (e) {
      setDone(before);
      setError(e.message);
    }
  }, [curriculum, done]);

  const resetProgress = useCallback(async () => {
    await api.resetProgress();
    setDone({});
  }, []);

  const value = useMemo(() => {
    if (!curriculum) return { ready: false, error };
    const { phases, tasks } = curriculum;

    const tasksByDay = Array.from({ length: TOTAL_DAYS }, () => []);
    tasks.forEach((t) => tasksByDay[t.day - 1].push(t));

    const isDone = (n) => Boolean(done[n]);
    const dayStats = (day) => {
      const list = tasksByDay[day - 1];
      const d = list.filter((t) => isDone(t.number)).length;
      return { done: d, total: list.length, complete: d === list.length };
    };

    const doneCount = tasks.filter((t) => isDone(t.number)).length;
    const minutesDone = tasks.reduce((s, t) => s + (isDone(t.number) ? t.minutes : 0), 0);
    const daysCompleted = tasksByDay.filter((_, i) => dayStats(i + 1).complete).length;

    const phaseStats = phases.map((p) => {
      const list = tasks.filter((t) => t.phase === p.id);
      const d = list.filter((t) => isDone(t.number)).length;
      return { ...p, done: d, total: list.length, pct: list.length ? d / list.length : 0 };
    });

    const skillStats = Object.keys(SKILLS).map((skill) => {
      const list = tasks.filter((t) => t.skill === skill);
      const d = list.filter((t) => isDone(t.number)).length;
      return { skill, done: d, total: list.length, pct: list.length ? d / list.length : 0 };
    });

    const diff = user ? daysSince(user.startDate) : 0;
    const currentDay = clamp(diff + 1, 1, TOTAL_DAYS);
    const phaseOf = (day) => phases.find((p) => day >= p.startDay && day <= p.endDay);

    // Streak: consecutive calendar days with at least one completed task
    const active = new Set(Object.values(done).map((iso) => dateKey(new Date(iso))));
    let streak = 0;
    const cursor = new Date();
    if (!active.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (active.has(dateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return {
      ready: true,
      error,
      clearError: () => setError(''),
      phases,
      tasks,
      tasksByDay,
      isDone,
      dayStats,
      phaseOf,
      doneCount,
      totalCount: tasks.length,
      pct: tasks.length ? doneCount / tasks.length : 0,
      minutesDone,
      daysCompleted,
      phaseStats,
      skillStats,
      currentDay,
      streak,
      setTask,
      setDay,
      resetProgress,
    };
  }, [curriculum, done, error, user, setTask, setDay, resetProgress]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
