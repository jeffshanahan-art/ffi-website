import fs from 'fs';
import path from 'path';

export interface StoredPhoto {
  id: string;
  src: string;
  year: string;
  caption?: string;
  uploadedAt?: string;
  blobUrl?: string;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'photos.json');
const REGISTRY_PATHNAME = 'photos-registry.json';

function useBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function readSeedPhotos(): StoredPhoto[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function readBlobRegistry(): Promise<StoredPhoto[] | null> {
  const { list } = await import('@vercel/blob');
  const { blobs } = await list({ prefix: REGISTRY_PATHNAME });
  if (blobs.length === 0) return null;
  const response = await fetch(blobs[0].url, { cache: 'no-store' });
  return response.json();
}

async function writeBlobRegistry(photos: StoredPhoto[]): Promise<void> {
  const { put } = await import('@vercel/blob');
  await put(REGISTRY_PATHNAME, JSON.stringify(photos), {
    access: 'public',
    addRandomSuffix: false,
  });
}

export async function readPhotos(): Promise<StoredPhoto[]> {
  if (!useBlob()) return readSeedPhotos();
  const registry = await readBlobRegistry();
  if (registry !== null) return registry;
  // First run: initialize registry from seed data
  const seed = readSeedPhotos();
  await writeBlobRegistry(seed);
  return seed;
}

export async function writePhotos(photos: StoredPhoto[]): Promise<void> {
  if (!useBlob()) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(photos, null, 2));
    return;
  }
  await writeBlobRegistry(photos);
}

export async function addPhoto(photo: StoredPhoto): Promise<void> {
  const photos = await readPhotos();
  photos.push(photo);
  await writePhotos(photos);
}

export async function removePhoto(id: string): Promise<StoredPhoto | null> {
  const photos = await readPhotos();
  const index = photos.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const [removed] = photos.splice(index, 1);
  await writePhotos(photos);
  return removed;
}

export async function uploadPhotoFile(
  file: File,
  year: string,
  id: string,
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpeg';

  if (useBlob()) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`photos/${year}/${id}.${ext}`, file, {
      access: 'public',
      addRandomSuffix: false,
    });
    return blob.url;
  }

  // Local dev: write to public/photos/
  const yearDir = path.join(process.cwd(), 'public', 'photos', year);
  if (!fs.existsSync(yearDir)) {
    fs.mkdirSync(yearDir, { recursive: true });
  }
  const filename = `${id}.${ext}`;
  const filePath = path.join(yearDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
  return `/photos/${year}/${filename}`;
}

export async function deletePhotoFile(photo: StoredPhoto): Promise<void> {
  if (useBlob() && photo.blobUrl) {
    try {
      const { del } = await import('@vercel/blob');
      await del(photo.blobUrl);
    } catch {
      // Best effort
    }
    return;
  }

  if (!useBlob()) {
    try {
      const filePath = path.join(process.cwd(), 'public', photo.src);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // File may not exist
    }
  }
}

export function generateId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
