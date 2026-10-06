import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import staticData from '@/data/ffi-data.json';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  if (!/^\d{4}$/.test(year)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const event = (staticData.events as { year: string }[]).find((e) => e.year === year);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const file = fs.readFileSync(path.join(process.cwd(), 'private', 'programs', `program-${year}.pdf`));
    return new NextResponse(new Uint8Array(file), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="FFI-${year}-Program.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
