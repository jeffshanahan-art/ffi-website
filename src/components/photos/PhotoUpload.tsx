'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAdmin } from './AdminContext';

interface Edition {
  value: string;
  label: string;
  start: string | null;
  end: string | null;
}

interface Item {
  id: string;
  file: File;
  preview: string;
  takenOn: string | null; // YYYY-MM-DD from the photo's EXIF data
  auto: string | null; // edition matched by date
  override: string; // edition chosen by the user ('' = none)
}

const MAX_DIMENSION = 2400;
const MAX_BYTES = 4 * 1024 * 1024; // Vercel request body limit is ~4.5MB

function matchEdition(takenOn: string | null, editions: Edition[]): string | null {
  if (!takenOn) return null;
  const hit = editions.find((e) => e.start && e.end && takenOn >= e.start && takenOn <= e.end);
  return hit?.value ?? null;
}

async function readTakenDate(file: File): Promise<string | null> {
  try {
    const exifr = (await import('exifr')).default;
    const tags = await exifr.parse(file, ['DateTimeOriginal', 'CreateDate']);
    const d: Date | undefined = tags?.DateTimeOriginal ?? tags?.CreateDate;
    if (!d || isNaN(d.getTime())) return null;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  } catch {
    return null;
  }
}

// Shrink big phone photos so they fit within the upload size limit.
async function prepareForUpload(file: File): Promise<File> {
  if (file.size <= MAX_BYTES / 2 && file.type !== 'image/heic' && file.type !== 'image/heif') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (blob) {
      return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpeg', { type: 'image/jpeg' });
    }
  } catch {
    // fall through to the original file
  }
  return file;
}

export function PhotoUpload({ onUploaded }: { onUploaded: () => void }) {
  const { isAdmin, checking } = useAdmin();
  const [editions, setEditions] = useState<Edition[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [reading, setReading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/photos/editions')
      .then((r) => r.json())
      .then(setEditions)
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => items.forEach((i) => URL.revokeObjectURL(i.preview));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = async (list: File[]) => {
    const images = list.filter((f) => f.type.startsWith('image/'));
    if (!images.length) return;
    setReading(true);
    setStatus(null);
    const added: Item[] = [];
    for (const file of images) {
      const takenOn = await readTakenDate(file);
      added.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        preview: URL.createObjectURL(file),
        takenOn,
        auto: matchEdition(takenOn, editions),
        override: '',
      });
    }
    setItems((prev) => [...prev, ...added]);
    setReading(false);
  };

  const editionOf = (i: Item) => i.override || i.auto || '';
  const unassigned = useMemo(() => items.filter((i) => !editionOf(i)), [items]);
  const assigned = useMemo(() => items.filter((i) => editionOf(i)), [items]);
  const groups = useMemo(() => {
    const g = new Map<string, Item[]>();
    for (const i of assigned) g.set(editionOf(i), [...(g.get(editionOf(i)) ?? []), i]);
    return [...g.entries()];
  }, [assigned]);

  const labelOf = (value: string) => editions.find((e) => e.value === value)?.label ?? value;

  const setOverride = (ids: string[], value: string) =>
    setItems((prev) => prev.map((i) => (ids.includes(i.id) ? { ...i, override: value } : i)));

  const remove = (id: string) =>
    setItems((prev) => {
      const gone = prev.find((i) => i.id === id);
      if (gone) URL.revokeObjectURL(gone.preview);
      return prev.filter((i) => i.id !== id);
    });

  const upload = async () => {
    if (!assigned.length || unassigned.length) return;
    setStatus(null);
    setProgress({ done: 0, total: assigned.length });
    let success = 0;
    const failedItems: Item[] = [];
    for (const item of assigned) {
      try {
        const file = await prepareForUpload(item.file);
        const form = new FormData();
        form.append('file', file);
        form.append('year', editionOf(item));
        if (item.takenOn) form.append('takenAt', item.takenOn);
        const res = await fetch('/api/photos', { method: 'POST', body: form });
        if (res.ok) success++;
        else failedItems.push(item);
      } catch {
        failedItems.push(item);
      }
      setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
    }
    items.filter((i) => !failedItems.includes(i)).forEach((i) => URL.revokeObjectURL(i.preview));
    setItems(failedItems);
    setProgress(null);
    setStatus(
      failedItems.length
        ? `Uploaded ${success}, ${failedItems.length} failed (still listed below so you can retry)`
        : `${success} photo${success !== 1 ? 's' : ''} uploaded`
    );
    if (success) onUploaded();
  };

  if (checking) return null;
  if (!isAdmin) {
    return (
      <p className="mb-6 text-sm text-slate">Log in as admin to upload photos.</p>
    );
  }

  const uploading = progress !== null;

  return (
    <div className="mb-8 border border-gray bg-gray-light p-4">
      <h3 className="font-serif text-lg text-blue mb-1">Bulk Upload Photos</h3>
      <p className="text-xs text-slate mb-3">
        Photos are sorted into editions by the date they were taken. Anything we can&apos;t place, you choose.
      </p>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(Array.from(e.dataTransfer.files));
        }}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray hover:border-blue transition-colors px-3 py-6 text-sm text-slate cursor-pointer bg-white text-center"
      >
        {reading ? 'Reading photo dates…' : 'Drop photos here or click to browse (select as many as you like)'}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(Array.from(e.target.files));
          e.target.value = '';
        }}
      />

      {unassigned.length > 0 && (
        <div className="mt-5 border border-red-300 bg-white p-3">
          <p className="text-sm font-medium text-black">
            {unassigned.length} photo{unassigned.length !== 1 ? 's' : ''} need an edition
          </p>
          <p className="text-xs text-slate mb-2">
            The photo date doesn&apos;t fall within an edition (or the photo has no date). Pick an edition:
          </p>
          <div className="flex items-center gap-2 mb-3">
            <select
              defaultValue=""
              onChange={(e) => e.target.value && setOverride(unassigned.map((i) => i.id), e.target.value)}
              className="border border-gray bg-white px-2 py-1.5 text-sm"
            >
              <option value="">Apply one edition to all of these…</option>
              {editions.map((ed) => (
                <option key={ed.value} value={ed.value}>
                  {ed.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {unassigned.map((i) => (
              <div key={i.id} className="text-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.preview} alt="" className="w-full h-24 object-cover bg-gray" />
                <p className="mt-1 text-slate truncate">{i.takenOn ?? 'No date found'}</p>
                <select
                  value={i.override}
                  onChange={(e) => setOverride([i.id], e.target.value)}
                  className="mt-1 w-full border border-gray bg-white px-1 py-1"
                >
                  <option value="">Select edition…</option>
                  {editions.map((ed) => (
                    <option key={ed.value} value={ed.value}>
                      {ed.label}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => remove(i.id)} className="mt-1 text-slate underline">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {groups.map(([value, list]) => (
        <div key={value} className="mt-4">
          <div className="flex items-baseline justify-between border-b border-gray pb-1 mb-2">
            <p className="text-sm font-medium text-black">
              {labelOf(value)} <span className="text-slate font-normal">({list.length})</span>
            </p>
            <select
              value={value}
              onChange={(e) => setOverride(list.map((i) => i.id), e.target.value)}
              className="border border-gray bg-white px-1 py-1 text-xs"
              aria-label="Change edition for this group"
            >
              {editions.map((ed) => (
                <option key={ed.value} value={ed.value}>
                  {ed.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {list.map((i) => (
              <div key={i.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.preview} alt="" className="w-16 h-16 object-cover bg-gray" title={i.takenOn ?? ''} />
                <button
                  type="button"
                  onClick={() => remove(i.id)}
                  aria-label="Remove photo"
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/70 text-white text-[10px] leading-4"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {items.length > 0 && (
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={upload}
            disabled={uploading || reading || unassigned.length > 0}
            className="px-4 py-1.5 text-sm bg-blue text-white hover:bg-blue-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? `Uploading ${progress!.done} of ${progress!.total}…` : `Upload ${items.length} photo${items.length !== 1 ? 's' : ''}`}
          </button>
          {unassigned.length > 0 && <span className="text-xs text-slate">Choose an edition for the highlighted photos first.</span>}
        </div>
      )}

      {status && <p className="mt-3 text-sm text-blue">{status}</p>}
    </div>
  );
}
