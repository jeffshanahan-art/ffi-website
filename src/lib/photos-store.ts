import fs from 'fs';
import path from 'path';

export interface StoredPhoto {
  id: string;
  src: string;
  year: string;
  caption?: string;
  uploadedAt?: string;
}

const PHOTOS_FILE = path.join(process.cwd(), 'data', 'photos.json');

export function readPhotos(): StoredPhoto[] {
  try {
    const raw = fs.readFileSync(PHOTOS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function writePhotos(photos: StoredPhoto[]): void {
  fs.writeFileSync(PHOTOS_FILE, JSON.stringify(photos, null, 2));
}

export function addPhoto(photo: StoredPhoto): void {
  const photos = readPhotos();
  photos.push(photo);
  writePhotos(photos);
}

export function removePhoto(id: string): StoredPhoto | null {
  const photos = readPhotos();
  const index = photos.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const [removed] = photos.splice(index, 1);
  writePhotos(photos);
  return removed;
}

export function generateId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
