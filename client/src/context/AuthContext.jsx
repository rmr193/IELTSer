import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from '../api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api.me()
      .then((r) => setUser(r.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = useCallback((res) => {
    setToken(res.token);
    setUser(res.user);
  }, []);

  const login = useCallback(async (body) => authenticate(await api.login(body)), [authenticate]);
  const register = useCallback(async (body) => authenticate(await api.register(body)), [authenticate]);
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);
  const updateProfile = useCallback(async (body) => {
    const r = await api.updateMe(body);
    setUser(r.user);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile }),
    [user, loading, login, register, logout, updateProfile]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
