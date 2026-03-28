'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AdminContextValue {
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checking: boolean;
}

const AdminContext = createContext<AdminContextValue>({
  isAdmin: false,
  login: async () => false,
  logout: async () => {},
  checking: true,
});

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/auth')
      .then((r) => r.json())
      .then((data) => setIsAdmin(data.isAdmin))
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (password: string) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.success) {
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setIsAdmin(false);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, checking }}>
      {children}
    </AdminContext.Provider>
  );
}
