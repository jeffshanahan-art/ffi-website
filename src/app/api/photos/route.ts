import { NextRequest, NextResponse } from 'next/server';
import {
  readPhotos,
  addPhoto,
  removePhoto,
  uploadPhotoFile,
  deletePhotoFile,
  generateId,
} from '@/lib/photos-store';

const VALID_YEARS = [
  'S2018', 'F2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025',
];

export async function GET() {
  const photos = await readPhotos();
  return NextResponse.json(photos);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const year = formData.get('year') as string | null;
    const caption = formData.get('caption') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!year || !VALID_YEARS.includes(year)) {
      return NextResponse.json({ error: 'Invalid edition year' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File must be JPEG, PNG, or WebP' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 10MB' }, { status: 400 });
    }

    const id = generateId();
    const src = await uploadPhotoFile(file, year, id);

    const photo = {
      id,
      src,
      year,
      caption: caption || undefined,
      uploadedAt: new Date().toISOString(),
      ...(process.env.BLOB_READ_WRITE_TOKEN ? { blobUrl: src } : {}),
    };
    await addPhoto(photo);

    return NextResponse.json(photo, { status: 201 });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

  await deletePhotoFile(removed);

  return NextResponse.json({ success: true, removed });
}
