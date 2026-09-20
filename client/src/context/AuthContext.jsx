import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from '../api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      return null;
    }
    try {
      const r = await api.me();
      setUser(r.user);
      return r.user;
    } catch {
      setToken(null);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const authenticate = useCallback((res) => {
    if (res.token) setToken(res.token);
    if (res.user) setUser(res.user);
    return res;
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
    return r.user;
  }, []);

  const resendVerification = useCallback(async (email) => {
    return await api.resendVerification({ email: email || user?.email });
  }, [user]);

  const verifyEmail = useCallback(async (token) => {
    const res = await api.verifyEmail({ token });
    authenticate(res);
    return res;
  }, [authenticate]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
      resendVerification,
      verifyEmail,
    }),
    [user, loading, login, register, logout, updateProfile, refreshUser, resendVerification, verifyEmail]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
