import { put, del, list, head } from '@vercel/blob';

export interface StoredPhoto {
  id: string;
  src: string;
  year: string;
  caption?: string;
  uploadedAt?: string;
}

const REGISTRY_KEY = 'photos-registry.json';
const DELETED_IDS_KEY = 'photos-deleted-ids.json';
const IS_VERCEL = !!process.env.BLOB_READ_WRITE_TOKEN;

// ── Filesystem fallback for local dev ──────────────────────────────
import fs from 'fs';
import path from 'path';
const PHOTOS_FILE = path.join(process.cwd(), 'data', 'photos.json');

// Bundled seed data — always available even on Vercel serverless
import seedPhotos from '@/data/seed-photos.json';

function readPhotosLocal(): StoredPhoto[] {
  try {
    const raw = fs.readFileSync(PHOTOS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    // fs may not work on Vercel — use bundled seed
    return seedPhotos as unknown as StoredPhoto[];
  }
}

function writePhotosLocal(photos: StoredPhoto[]): void {
  fs.writeFileSync(PHOTOS_FILE, JSON.stringify(photos, null, 2));
}

// ── Vercel Blob registry ───────────────────────────────────────────
async function readRegistryBlob(): Promise<StoredPhoto[]> {
  try {
    const { blobs } = await list({ prefix: REGISTRY_KEY });
    if (blobs.length === 0) return [];
    const res = await fetch(blobs[0].url);
    return await res.json();
  } catch {
    return [];
  }
}

async function writeRegistryBlob(photos: StoredPhoto[]): Promise<void> {
  // Delete old registry blob(s)
  const { blobs } = await list({ prefix: REGISTRY_KEY });
  for (const blob of blobs) {
    await del(blob.url);
  }
  // Write new
  await put(REGISTRY_KEY, JSON.stringify(photos, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

// ── Deleted IDs tracking (Vercel only) ────────────────────────────
async function readDeletedIds(): Promise<Set<string>> {
  try {
    const { blobs } = await list({ prefix: DELETED_IDS_KEY });
    if (blobs.length === 0) return new Set();
    const res = await fetch(blobs[0].url);
    const ids: string[] = await res.json();
    return new Set(ids);
  } catch {
    return new Set();
  }
}

async function writeDeletedIds(ids: Set<string>): Promise<void> {
  const { blobs } = await list({ prefix: DELETED_IDS_KEY });
  for (const blob of blobs) {
    await del(blob.url);
  }
  await put(DELETED_IDS_KEY, JSON.stringify([...ids]), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

// ── Public API (works both locally and on Vercel) ──────────────────

export async function readPhotos(): Promise<StoredPhoto[]> {
  if (IS_VERCEL) {
    const blobPhotos = await readRegistryBlob();
    if (blobPhotos.length > 0) {
      // Merge any new seed photos that aren't in blob yet (and weren't deleted)
      const deletedIds = await readDeletedIds();
      const blobIds = new Set(blobPhotos.map((p) => p.id));
      const localPhotos = readPhotosLocal();
      const newPhotos = localPhotos.filter(
        (p) => !blobIds.has(p.id) && !deletedIds.has(p.id)
      );
      if (newPhotos.length > 0) {
        const merged = [...blobPhotos, ...newPhotos];
        await writeRegistryBlob(merged);
        return merged;
      }
      return blobPhotos;
    }
    // First run — seed from bundled data, respecting any prior deletions
    const deletedIds = await readDeletedIds();
    const localPhotos = readPhotosLocal().filter((p) => !deletedIds.has(p.id));
    if (localPhotos.length > 0) {
      await writeRegistryBlob(localPhotos);
    }
    return localPhotos;
  }
  return readPhotosLocal();
}

export async function writePhotos(photos: StoredPhoto[]): Promise<void> {
  if (IS_VERCEL) return writeRegistryBlob(photos);
  writePhotosLocal(photos);
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
  // Track deletion so re-seeding from repo won't bring it back
  if (IS_VERCEL) {
    const deletedIds = await readDeletedIds();
    deletedIds.add(id);
    await writeDeletedIds(deletedIds);
  }
  return removed;
}

export async function uploadPhotoFile(
  file: File,
  year: string,
  id: string
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpeg';
  const filename = `${id}.${ext}`;

  if (IS_VERCEL) {
    const blob = await put(`photos/${year}/${filename}`, file, {
      access: 'public',
      contentType: file.type,
    });
    return blob.url;
  }

  // Local: write to public/photos/year/
  const yearDir = path.join(process.cwd(), 'public', 'photos', year);
  if (!fs.existsSync(yearDir)) {
    fs.mkdirSync(yearDir, { recursive: true });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(yearDir, filename), buffer);
  return `/photos/${year}/${filename}`;
}

export async function deletePhotoFile(src: string): Promise<void> {
  if (IS_VERCEL) {
    // Only delete from Blob if it's a blob URL (uploaded photos)
    // Static photos from /public/photos/ can't be deleted at runtime
    if (src.includes('blob.vercel-storage.com')) {
      try {
        await del(src);
      } catch {
        // blob may not exist
      }
    }
    return;
  }

  // Local: delete from filesystem
  try {
    const filePath = path.join(process.cwd(), 'public', src);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // file may not exist
  }
}

export function generateId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
