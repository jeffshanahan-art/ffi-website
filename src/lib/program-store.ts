import { del, list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export const PROGRAM_EXTENSIONS = ['pdf', 'doc', 'docx'] as const;
export const IS_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

export interface ProgramInfo {
  year: string;
  ext: string;
  url: string | null; // public blob URL; null when stored on the local filesystem
  uploadedAt: string;
}

const CONTENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export const contentTypeFor = (ext: string) => CONTENT_TYPES[ext] ?? 'application/octet-stream';

const localDir = () => path.join(process.cwd(), 'data', 'programs');

function extOf(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

export async function getProgram(year: string): Promise<ProgramInfo | null> {
  if (!/^\d{4}$/.test(year)) return null;

  if (IS_BLOB) {
    try {
      const { blobs } = await list({ prefix: `programs/${year}/` });
      if (!blobs.length) return null;
      const latest = [...blobs].sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))[0];
      return { year, ext: extOf(latest.pathname), url: latest.url, uploadedAt: new Date(latest.uploadedAt).toISOString() };
    } catch {
      return null;
    }
  }

  try {
    const file = fs.readdirSync(localDir()).find((f) => f.startsWith(`program-${year}.`));
    if (!file) return null;
    const stat = fs.statSync(path.join(localDir(), file));
    return { year, ext: extOf(file), url: null, uploadedAt: stat.mtime.toISOString() };
  } catch {
    return null;
  }
}

export function readLocalProgram(year: string, ext: string): Buffer | null {
  try {
    return fs.readFileSync(path.join(localDir(), `program-${year}.${ext}`));
  } catch {
    return null;
  }
}

export async function saveLocalProgram(year: string, ext: string, data: Buffer): Promise<void> {
  fs.mkdirSync(localDir(), { recursive: true });
  await deleteProgram(year);
  fs.writeFileSync(path.join(localDir(), `program-${year}.${ext}`), data);
}

export async function deleteProgram(year: string): Promise<void> {
  if (IS_BLOB) {
    const { blobs } = await list({ prefix: `programs/${year}/` });
    if (blobs.length) await del(blobs.map((b) => b.url));
    return;
  }
  try {
    for (const f of fs.readdirSync(localDir())) {
      if (f.startsWith(`program-${year}.`)) fs.unlinkSync(path.join(localDir(), f));
    }
  } catch {
    // nothing stored
  }
}
