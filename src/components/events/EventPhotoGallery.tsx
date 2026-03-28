'use client';

import { useState, useCallback } from 'react';
import { PhotoGrid } from '@/components/photos/PhotoGrid';
import { PhotoUpload } from '@/components/photos/PhotoUpload';
import { AdminProvider } from '@/components/photos/AdminContext';
import { AdminBar } from '@/components/photos/AdminBar';
import type { Photo } from '@/types';

function Inner({
  initialPhotos,
  year,
  displayYear,
}: {
  initialPhotos: Photo[];
  year: string;
  displayYear: string;
}) {
  const [photos, setPhotos] = useState(initialPhotos);

  const refreshPhotos = useCallback(async () => {
    const res = await fetch('/api/photos');
    if (res.ok) {
      const all: Photo[] = await res.json();
      setPhotos(all.filter((p) => p.year === year));
    }
  }, [year]);

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

  const yearOptions = [{ value: year, label: displayYear }];

  return (
    <>
      <AdminBar />
      <PhotoUpload yearOptions={yearOptions} onUploaded={refreshPhotos} />
      {photos.length === 0 ? (
        <p className="text-slate text-sm">No photos yet for this edition.</p>
      ) : (
        <PhotoGrid photos={photos} onDelete={deletePhoto} />
      )}
    </>
  );
}

export function EventPhotoGallery({
  initialPhotos,
  year,
  displayYear,
}: {
  initialPhotos: Photo[];
  year: string;
  displayYear: string;
}) {
  return (
    <AdminProvider>
      <Inner initialPhotos={initialPhotos} year={year} displayYear={displayYear} />
    </AdminProvider>
  );
}
