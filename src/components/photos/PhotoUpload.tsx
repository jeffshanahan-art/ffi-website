'use client';

import { useState, useRef } from 'react';

interface YearOption {
  value: string;
  label: string;
}

export function PhotoUpload({
  yearOptions,
  onUploaded,
}: {
  yearOptions: YearOption[];
  onUploaded: () => void;
}) {
  const [selectedYear, setSelectedYear] = useState(yearOptions[yearOptions.length - 1]?.value || '');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setStatus(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    );
    if (dropped.length > 0) {
      setFiles(dropped);
      setStatus(null);
    }
  };

  const upload = async () => {
    if (files.length === 0 || !selectedYear) return;
    setUploading(true);
    setStatus(null);

    let success = 0;
    let failed = 0;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('year', selectedYear);

      try {
        const res = await fetch('/api/photos', { method: 'POST', body: formData });
        if (res.ok) {
          success++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    setFiles([]);
    if (inputRef.current) inputRef.current.value = '';
    setUploading(false);
    setStatus(
      failed > 0
        ? `Uploaded ${success}, failed ${failed}`
        : `${success} photo${success !== 1 ? 's' : ''} uploaded`
    );
    onUploaded();
  };

  return (
    <div className="mb-8 border border-gray bg-gray-light p-4">
      <h3 className="font-serif text-lg text-blue mb-3">Upload Photos</h3>

      <div className="flex flex-wrap items-end gap-4">
        {/* Edition picker */}
        <div>
          <label className="block text-xs text-slate mb-1">Edition</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray bg-white px-2 py-1.5 text-sm focus:outline-none focus:border-blue"
          >
            {yearOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Drop zone / file input */}
        <div
          className="flex-1 min-w-[200px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <label className="block text-xs text-slate mb-1">
            Photos (drag & drop or click)
          </label>
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray hover:border-blue transition-colors px-3 py-2 text-sm text-slate cursor-pointer bg-white text-center"
          >
            {files.length > 0
              ? `${files.length} file${files.length !== 1 ? 's' : ''} selected`
              : 'Drop images here or click to browse'}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="hidden"
          />
        </div>

        {/* Upload button */}
        <button
          onClick={upload}
          disabled={files.length === 0 || uploading}
          className="px-4 py-1.5 text-sm bg-blue text-white hover:bg-blue-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {status && (
        <p className="mt-2 text-sm text-blue">{status}</p>
      )}
    </div>
  );
}
