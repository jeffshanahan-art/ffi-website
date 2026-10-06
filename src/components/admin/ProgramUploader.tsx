'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';

interface Current {
  ext: string;
  uploadedAt: string;
}

export function ProgramUploader({ years }: { years: { value: string; label: string }[] }) {
  const [year, setYear] = useState(years.find((y) => y.value === '2026')?.value ?? years[years.length - 1]?.value ?? '');
  const [mode, setMode] = useState<'blob' | 'local'>('blob');
  const [current, setCurrent] = useState<Current | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    if (!year) return;
    const res = await fetch(`/api/admin/program?year=${year}`);
    if (!res.ok) return;
    const d = await res.json();
    setMode(d.mode);
    setCurrent(d.current);
  }, [year]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const send = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setMessage({ ok: false, text: 'Please choose a PDF or Word document.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      if (mode === 'blob') {
        await upload(`programs/${year}/program-${Date.now()}.${ext}`, file, {
          access: 'public',
          handleUploadUrl: '/api/admin/program/upload',
        });
      } else {
        const form = new FormData();
        form.append('file', file);
        form.append('year', year);
        const res = await fetch('/api/admin/program', { method: 'POST', body: form });
        if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
      }
      await refresh();
      setMessage({ ok: true, text: 'Program uploaded. The Coming Soon page is replaced and the program link is live.' });
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message || 'Upload failed' });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async () => {
    if (!confirm('Remove the program and go back to the Coming Soon page?')) return;
    setBusy(true);
    await fetch(`/api/admin/program?year=${year}`, { method: 'DELETE' });
    await refresh();
    setMessage({ ok: true, text: 'Program removed. The link now shows Coming Soon.' });
    setBusy(false);
  };

  return (
    <div className="mt-8 border border-gray bg-gray-light p-4">
      <h2 className="font-serif text-lg text-blue">Tournament Program</h2>
      <p className="text-xs text-slate mt-1">
        Upload the final program as a PDF (recommended) or a Word document. Uploading replaces the Coming Soon page and
        turns the link on right away. A Word file is offered as a download instead of opening in the browser.
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-slate mb-1">Edition</label>
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setMessage(null);
            }}
            className="border border-gray bg-white px-2 py-1.5 text-sm"
          >
            {[...years].reverse().map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>
        </div>
        <label className="px-4 py-1.5 text-sm bg-blue text-white hover:bg-blue-dark transition-colors cursor-pointer">
          {busy ? 'Working…' : current ? 'Replace program' : 'Upload program'}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf"
            className="hidden"
            disabled={busy}
            onChange={(e) => e.target.files?.[0] && send(e.target.files[0])}
          />
        </label>
        {current && (
          <button onClick={remove} disabled={busy} className="text-sm text-slate underline hover:text-black">
            Remove
          </button>
        )}
      </div>

      <p className="mt-3 text-sm text-slate">
        {current ? (
          <>
            <span className="text-green-700 font-medium">Live</span> &middot; {current.ext.toUpperCase()} uploaded{' '}
            {new Date(current.uploadedAt).toLocaleString()} &middot;{' '}
            <a href={`/events/${year}/program`} target="_blank" className="text-blue underline">
              Open program link
            </a>
          </>
        ) : (
          <>
            <span className="font-medium">Not uploaded</span> &middot; visitors see the Coming Soon page at{' '}
            <a href={`/events/${year}/program`} target="_blank" className="text-blue underline">
              /events/{year}/program
            </a>
          </>
        )}
      </p>
      {message && <p className={`mt-2 text-sm ${message.ok ? 'text-green-700' : 'text-red-600'}`}>{message.text}</p>}
    </div>
  );
}
