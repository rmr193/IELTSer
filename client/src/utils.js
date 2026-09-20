export const TOTAL_DAYS = 90;

export const SKILLS = {
  listening: { label: 'Listening', color: '#2F6FED' },
  reading: { label: 'Reading', color: '#0E9F6E' },
  writing: { label: 'Writing', color: '#8B5CF6' },
  speaking: { label: 'Speaking', color: '#E8780F' },
  language: { label: 'Vocabulary & grammar', color: '#64748B' },
};

export const pad = (n) => String(n).padStart(2, '0');

/** Local calendar date as YYYY-MM-DD */
export function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Whole days between a YYYY-MM-DD start date and today (negative if start is in the future) */
export function daysSince(startKey) {
  const start = parseKey(startKey);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - start) / 86400000);
}

export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export function formatMinutes(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function formatDate(key) {
  return parseKey(key).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
