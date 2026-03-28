'use client';

import { useState } from 'react';
import { useAdmin } from './AdminContext';

export function AdminBar() {
  const { isAdmin, login, logout, checking } = useAdmin();
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (checking) return null;

  if (isAdmin) {
    return (
      <div className="flex items-center gap-3 mb-6 px-3 py-2 bg-blue/5 border border-blue/20 text-sm">
        <span className="text-blue font-medium">Admin Mode</span>
        <span className="text-slate">You can delete photos</span>
        <button
          onClick={logout}
          className="ml-auto text-slate hover:text-blue transition-colors underline"
        >
          Log out
        </button>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="mb-6 px-3 py-3 bg-gray-light border border-gray">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            const ok = await login(password);
            if (ok) {
              setShowLogin(false);
              setPassword('');
            } else {
              setError('Incorrect password');
            }
          }}
          className="flex items-center gap-3"
        >
          <label className="text-sm text-slate">Admin password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray px-2 py-1 text-sm w-40 focus:outline-none focus:border-blue"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-blue text-white hover:bg-blue-dark transition-colors"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => { setShowLogin(false); setError(''); }}
            className="text-sm text-slate hover:text-blue transition-colors"
          >
            Cancel
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </form>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => setShowLogin(true)}
        className="text-sm text-slate hover:text-blue transition-colors underline"
      >
        Admin login
      </button>
    </div>
  );
}
