'use client';

import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { useAdmin } from './AdminContext';
import type { Photo } from '@/types';

function Lightbox({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
  onDelete,
  isAdmin,
}: {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDelete?: (id: string) => void;
  isAdmin: boolean;
}) {
  const photo = photos[index];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl z-10 leading-none"
        aria-label="Close"
      >
        &times;
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 text-white/50 text-sm font-mono">
        {index + 1} / {photos.length}
      </div>

      {/* Admin delete */}
      {isAdmin && photo.id && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Delete this photo?')) {
              onDelete(photo.id!);
              onClose();
            }
          }}
          className="absolute top-4 right-16 text-red-400 hover:text-red-300 text-sm z-10 border border-red-400/50 px-2 py-0.5 rounded"
        >
          Delete
        </button>
      )}

      {/* Prev */}
      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-4xl z-10"
          aria-label="Previous"
        >
          &#8249;
        </button>
      )}

      {/* Next */}
      {index < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-4xl z-10"
          aria-label="Next"
        >
          &#8250;
        </button>
      )}

      {/* Image */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photo.src}
          alt={photo.caption || `Photo ${index + 1}`}
          fill
          className="object-contain"
          sizes="90vw"
          priority
        />
      </div>

      {/* Caption */}
      {photo.caption && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm text-center max-w-lg px-4">
          {photo.caption}
        </div>
      )}
    </div>
  );
}

export function PhotoGrid({
  photos,
  onDelete,
}: {
  photos: Photo[];
  onDelete?: (id: string) => void;
}) {
  const { isAdmin } = useAdmin();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevPhoto = useCallback(
    () => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i)),
    []
  );
  const nextPhoto = useCallback(
    () =>
      setLightboxIndex((i) =>
        i !== null && i < photos.length - 1 ? i + 1 : i
      ),
    [photos.length]
  );

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {photos.map((photo, i) => (
          <div key={photo.src} className="relative group">
            <button
              onClick={() => setLightboxIndex(i)}
              className="relative aspect-square overflow-hidden bg-gray-light w-full cursor-pointer"
            >
              <Image
                src={photo.src}
                alt={photo.caption || `Photo ${i + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
            </button>
            {/* Admin delete overlay */}
            {isAdmin && photo.id && onDelete && (
              <button
                onClick={() => {
                  if (confirm('Delete this photo?')) onDelete(photo.id!);
                }}
                className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white text-xs px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete photo"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
          onDelete={onDelete}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
}
