'use client';

import { useState, useMemo, useCallback } from 'react';
import { PhotoGrid } from './PhotoGrid';
import { PhotoUpload } from './PhotoUpload';
import { AdminProvider } from './AdminContext';
import { AdminBar } from './AdminBar';
import type { Photo } from '@/types';

interface YearOption {
  value: string;
  label: string;
}

function GalleryInner({
  initialPhotos,
  yearOptions,
  allYearOptions,
}: {
  initialPhotos: Photo[];
  yearOptions: YearOption[];
  allYearOptions: YearOption[];
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const filtered = useMemo(
    () => (selectedYear ? photos.filter((p) => p.year === selectedYear) : photos),
    [photos, selectedYear]
  );

  // Compute which years have photos for the filter tabs
  const activeYears = useMemo(
    () => new Set(photos.map((p) => p.year)),
    [photos]
  );
  const visibleYearOptions = yearOptions.filter((y) => activeYears.has(y.value));

  const refreshPhotos = useCallback(async () => {
    const res = await fetch('/api/photos');
    if (res.ok) {
      const data = await res.json();
      setPhotos(data);
    }
  }, []);

  const deletePhoto = useCallback(async (id: string) => {
    const res = await fetch('/api/photos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    }
  }, []);

  return (
    <>
      <AdminBar />

      <PhotoUpload yearOptions={allYearOptions} onUploaded={refreshPhotos} />

      {/* Year filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedYear(null)}
          className={`px-3 py-1.5 text-sm border transition-colors ${
            selectedYear === null
              ? 'bg-blue text-white border-blue'
              : 'bg-white text-slate border-gray hover:border-blue'
          }`}
        >
          All Editions
        </button>
        {visibleYearOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelectedYear(opt.value)}
            className={`px-3 py-1.5 text-sm border transition-colors ${
              selectedYear === opt.value
                ? 'bg-blue text-white border-blue'
                : 'bg-white text-slate border-gray hover:border-blue'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-slate text-sm">No photos for this edition yet.</p>
      ) : (
        <PhotoGrid photos={filtered} onDelete={deletePhoto} />
      )}
    </>
  );
}

export function PhotoGallery({
  photos,
  yearOptions,
  allYearOptions,
}: {
  photos: Photo[];
  yearOptions: YearOption[];
  allYearOptions?: YearOption[];
}) {
  return (
    <AdminProvider>
      <GalleryInner
        initialPhotos={photos}
        yearOptions={yearOptions}
        allYearOptions={allYearOptions || yearOptions}
      />
    </AdminProvider>
  );
}
