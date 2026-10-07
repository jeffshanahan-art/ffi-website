import { NextRequest, NextResponse } from 'next/server';
import {
  readPhotos,
  addPhoto,
  removePhoto,
  deletePhotoFile,
  uploadPhotoFile,
  generateId,
} from '@/lib/photos-store';

import staticData from '@/data/ffi-data.json';

const VALID_YEARS = (staticData.events as { year: string }[]).map((e) => e.year);

export async function GET() {
  const photos = await readPhotos();
  return NextResponse.json(photos);
}

const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];

export async function POST(request: NextRequest) {
  // Videos uploaded directly to Blob storage are registered with a small JSON request.
  if (request.headers.get('content-type')?.includes('application/json')) {
    try {
      const body = await request.json();
      const { src, year, takenAt } = body ?? {};
      if (!year || !VALID_YEARS.includes(year)) {
        return NextResponse.json({ error: 'Invalid edition year' }, { status: 400 });
      }
      if (typeof src !== 'string' || !/^https:\/\/[\w-]+\.public\.blob\.vercel-storage\.com\/photos\//.test(src)) {
        return NextResponse.json({ error: 'Invalid video location' }, { status: 400 });
      }
      const photo = {
        id: generateId(),
        src,
        year,
        type: 'video' as const,
        takenAt: typeof takenAt === 'string' ? takenAt : undefined,
        uploadedAt: new Date().toISOString(),
      };
      await addPhoto(photo);
      return NextResponse.json(photo, { status: 201 });
    } catch (err) {
      console.error('Video register error:', err);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const year = formData.get('year') as string | null;
    const caption = formData.get('caption') as string | null;
    const takenAt = formData.get('takenAt') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!year || !VALID_YEARS.includes(year)) {
      return NextResponse.json({ error: 'Invalid edition year' }, { status: 400 });
    }

    // Validate file type
    const isVideo = VIDEO_TYPES.includes(file.type);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!isVideo && !allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File must be a JPEG, PNG, WebP, or MP4/MOV/WebM video' }, { status: 400 });
    }

    // Validate file size (10MB for photos, 500MB for videos)
    if (file.size > (isVideo ? 500 : 10) * 1024 * 1024) {
      return NextResponse.json({ error: `File must be under ${isVideo ? 500 : 10}MB` }, { status: 400 });
    }

    const id = generateId();
    const src = await uploadPhotoFile(file, year, id);

    const photo = {
      id,
      src,
      year,
      caption: caption || undefined,
      type: isVideo ? ('video' as const) : undefined,
      takenAt: takenAt || undefined,
      uploadedAt: new Date().toISOString(),
    };
    await addPhoto(photo);

    return NextResponse.json(photo, { status: 201 });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Check admin cookie
  const cookie = request.cookies.get('ffi_admin');
  if (cookie?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Photo ID required' }, { status: 400 });
  }

  const removed = await removePhoto(id);
  if (!removed) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
  }

  await deletePhotoFile(removed.src);

  return NextResponse.json({ success: true, removed });
}
