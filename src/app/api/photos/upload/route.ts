import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];

export async function GET() {
  return NextResponse.json({ mode: process.env.BLOB_READ_WRITE_TOKEN ? 'blob' : 'local' });
}

// Issues short-lived tokens so videos (too big for a normal request) upload straight to Blob storage.
export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!/^photos\/[A-Za-z0-9]+\/video-[\w-]+\.(mp4|mov|m4v|webm)$/i.test(pathname)) throw new Error('Invalid video path');
        return {
          allowedContentTypes: VIDEO_TYPES,
          maximumSizeInBytes: 500 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
