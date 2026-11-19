import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('fpc_token');
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('fpc_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  useEffect(() => {
    const h = () => setUser(null);
    window.addEventListener('fpc:logout', h);
    return () => window.removeEventListener('fpc:logout', h);
  }, []);

  const handleAuth = (data) => {
    localStorage.setItem('fpc_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => handleAuth((await api.post('/auth/login', { email, password })).data);
  const register = async (payload) => handleAuth((await api.post('/auth/register', payload)).data);
  const updateProfile = async (payload) => {
    const { data } = await api.put('/auth/me', payload);
    setUser(data.user);
    return data.user;
  };

  const value = useMemo(
    () => ({ user, loading, isAdmin: user?.role === 'admin', login, register, logout, updateProfile }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
