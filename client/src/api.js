const BASE = import.meta.env.VITE_API_URL || '/api';
let token = localStorage.getItem('ielts_token');

export const getToken = () => token;
export function setToken(t) {
  token = t;
  if (t) localStorage.setItem('ielts_token', t);
  else localStorage.removeItem('ielts_token');
}

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong. Please try again.');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me'),
  updateMe: (body) => request('/auth/me', { method: 'PUT', body }),
  curriculum: () => request('/curriculum'),
  progress: () => request('/progress'),
  setTask: (n, done) => request(`/progress/task/${n}`, { method: 'PUT', body: { done } }),
  setDay: (d, done) => request(`/progress/day/${d}`, { method: 'PUT', body: { done } }),
  resetProgress: () => request('/progress', { method: 'DELETE' }),
  scores: () => request('/scores'),
  addScore: (body) => request('/scores', { method: 'POST', body }),
  deleteScore: (id) => request(`/scores/${id}`, { method: 'DELETE' }),
};
