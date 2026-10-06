import { NextRequest, NextResponse } from 'next/server';
import { contentTypeFor, getProgram, readLocalProgram } from '@/lib/program-store';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const program = await getProgram(year);
  if (!program) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (program.url) return NextResponse.redirect(program.url, 302);

  const file = readLocalProgram(year, program.ext);
  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return new NextResponse(new Uint8Array(file), {
    headers: {
      'Content-Type': contentTypeFor(program.ext),
      'Content-Disposition': `${program.ext === 'pdf' ? 'inline' : 'attachment'}; filename="FFI-${year}-Program.${program.ext}"`,
    },
  });
}
