import { NextResponse } from 'next/server';
import staticData from '@/data/ffi-data.json';
import { getEditionWindows } from '@/lib/edition-windows';

export async function GET() {
  return NextResponse.json(getEditionWindows(staticData.events));
}
