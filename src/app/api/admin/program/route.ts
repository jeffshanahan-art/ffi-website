import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { IS_BLOB, PROGRAM_EXTENSIONS, deleteProgram, getProgram, saveLocalProgram } from '@/lib/program-store';

const MAX_LOCAL_BYTES = 50 * 1024 * 1024;

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const year = request.nextUrl.searchParams.get('year') ?? '';
  return NextResponse.json({ mode: IS_BLOB ? 'blob' : 'local', current: await getProgram(year) });
}

// Local development only: production uploads go straight to Blob storage from the browser.
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  if (IS_BLOB) return NextResponse.json({ error: 'Use direct upload' }, { status: 400 });

  const form = await request.formData();
  const file = form.get('file') as File | null;
  const year = String(form.get('year') ?? '');
  const ext = file?.name.split('.').pop()?.toLowerCase() ?? '';
  if (!file || !/^\d{4}$/.test(year)) return NextResponse.json({ error: 'File and year required' }, { status: 400 });
  if (!(PROGRAM_EXTENSIONS as readonly string[]).includes(ext)) {
    return NextResponse.json({ error: 'Upload a PDF or Word document' }, { status: 400 });
  }
  if (file.size > MAX_LOCAL_BYTES) return NextResponse.json({ error: 'File too large' }, { status: 400 });
  await saveLocalProgram(year, ext, Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ success: true, current: await getProgram(year) });
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const year = request.nextUrl.searchParams.get('year') ?? '';
  if (!/^\d{4}$/.test(year)) return NextResponse.json({ error: 'Year required' }, { status: 400 });
  await deleteProgram(year);
  return NextResponse.json({ success: true });
}
