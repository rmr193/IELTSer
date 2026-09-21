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

  const loginWithGoogle = useCallback(
    async (credential) => authenticate(await api.googleLogin(credential)),
    [authenticate]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (body) => {
    const r = await api.updateMe(body);
    setUser(r.user);
    return r.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      loginWithGoogle,
      logout,
      updateProfile,
      refreshUser,
    }),
    [user, loading, loginWithGoogle, logout, updateProfile, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
