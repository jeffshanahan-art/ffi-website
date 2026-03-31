import { NextRequest, NextResponse } from 'next/server';
import staticData from '@/data/ffi-data.json';

function isAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get('ffi_admin');
  return cookie?.value === 'authenticated';
}

function getFfiData(): typeof staticData {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    const filePath = path.join(process.cwd(), 'src', 'data', 'ffi-data.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return JSON.parse(JSON.stringify(staticData));
}

async function saveData(data: any): Promise<void> {
  const content = JSON.stringify(data, null, 2);

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    const filePath = path.join(process.cwd(), 'src', 'data', 'ffi-data.json');
    fs.writeFileSync(filePath, content);
    return;
  }

  // Production: commit directly to GitHub → triggers Vercel redeploy
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN environment variable is not set');

  const owner = 'jeffshanahan-art';
  const repo = 'ffi-website';
  const filePath = 'src/data/ffi-data.json';

  const getRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!getRes.ok) throw new Error('Failed to fetch current file from GitHub');
  const fileInfo = await getRes.json();

  const encoded = Buffer.from(content).toString('base64');
  const putRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Admin: update event data via admin panel',
        content: encoded,
        sha: fileInfo.sha,
        branch: 'main',
      }),
    }
  );

  if (!putRes.ok) {
    const err = await putRes.json();
    throw new Error(err.message || 'GitHub commit failed');
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = getFfiData();
  const allPlayers = (data as any).allPlayers?.map((p: any) => ({ name: p.name, team: p.team })) ?? [];
  return NextResponse.json({ events: data.events, allPlayers });
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { event, isNew } = await request.json();
  if (!event?.year) {
    return NextResponse.json({ error: 'Event year is required' }, { status: 400 });
  }

  const data = getFfiData() as any;

  if (isNew) {
    const exists = data.events.some((e: any) => e.year === event.year);
    if (exists) {
      return NextResponse.json({ error: `Event for year "${event.year}" already exists` }, { status: 409 });
    }
    data.events.push(event);
    data.events.sort((a: any, b: any) => (a.edition ?? 0) - (b.edition ?? 0));
  } else {
    const index = data.events.findIndex((e: any) => e.year === event.year);
    if (index === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    // Merge: preserve existing fields not managed by the admin form (matches, schedule, etc.)
    data.events[index] = { ...data.events[index], ...event };
  }

  try {
    await saveData(data);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
