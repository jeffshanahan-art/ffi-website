'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="w-full px-4 py-3 border border-gray rounded-md text-sm font-sans text-black placeholder:text-slate/50 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
          required
        />
      </div>
      {error && (
        <p className="text-red-600 text-sm text-center">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue text-white font-serif text-sm rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Enter'}
      </button>
    </form>
  );
}
