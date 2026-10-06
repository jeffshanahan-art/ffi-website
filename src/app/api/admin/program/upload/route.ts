import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { isAdminRequest } from '@/lib/admin-auth';
import { contentTypeFor } from '@/lib/program-store';

// Issues short-lived tokens so the browser can upload large program files directly to Blob storage.
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!/^programs\/\d{4}\/program-\d+\.(pdf|docx?)$/i.test(pathname)) throw new Error('Invalid program path');
        return {
          allowedContentTypes: ['pdf', 'doc', 'docx'].map(contentTypeFor),
          maximumSizeInBytes: 100 * 1024 * 1024,
          addRandomSuffix: false,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
