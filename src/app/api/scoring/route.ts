import { NextRequest, NextResponse } from 'next/server';
import staticData from '@/data/ffi-data.json';

function isAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get('ffi_user');
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
        message: 'Scoring: update match results',
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

function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

type Result = 'philly' | 'dc' | 'halved';

function computeScore(
  result: Result,
  maxPoints: number
): { philly: number; dc: number } {
  if (result === 'philly') return { philly: maxPoints, dc: 0 };
  if (result === 'dc') return { philly: 0, dc: maxPoints };
  return { philly: maxPoints / 2, dc: maxPoints / 2 };
}

// GET: return match data and whether scoring is active
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const year = request.nextUrl.searchParams.get('year');
  if (!year) {
    return NextResponse.json({ error: 'year param required' }, { status: 400 });
  }

  const data = getFfiData();
  const event = (data.events as any[]).find((e) => e.year === year);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const today = getTodayISO();
  const dates: string[] = event.dates || [];
  const active = dates.includes(today);

  return NextResponse.json({
    active,
    dates,
    matches: event.matches || [],
    score: event.score || { philly: null, dc: null },
  });
}

// POST: submit a score for a specific pairing
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { year, roundIndex, pairingIndex, results } = body;

  if (!year || roundIndex == null || pairingIndex == null || !results) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const data = getFfiData() as any;
  const event = data.events.find((e: any) => e.year === year);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Time gate: only allow scoring on event dates
  const today = getTodayISO();
  const eventDates: string[] = event.dates || [];
  if (!eventDates.includes(today)) {
    return NextResponse.json(
      { error: `Scoring is only available on event days (${eventDates.join(', ') || 'not set'})` },
      { status: 403 }
    );
  }

  const match = event.matches?.[roundIndex];
  if (!match) {
    return NextResponse.json({ error: 'Match round not found' }, { status: 404 });
  }

  const pairing = match.pairings?.[pairingIndex];
  if (!pairing) {
    return NextResponse.json({ error: 'Pairing not found' }, { status: 404 });
  }

  const pv = match.pointValues;
  if (!pv) {
    return NextResponse.json({ error: 'Point values not configured for this round' }, { status: 400 });
  }

  // Calculate scores based on results
  const is18 = match.holes === 18;

  if (is18) {
    const front = results.front ? computeScore(results.front, pv.front || 0) : { philly: 0, dc: 0 };
    const back = results.back ? computeScore(results.back, pv.back || 0) : { philly: 0, dc: 0 };
    const overall = results.overall ? computeScore(results.overall, pv.overall || 0) : { philly: 0, dc: 0 };

    pairing.score = {
      philly: {
        front: front.philly,
        back: back.philly,
        overall: overall.philly,
        total: front.philly + back.philly + overall.philly,
      },
      dc: {
        front: front.dc,
        back: back.dc,
        overall: overall.dc,
        total: front.dc + back.dc + overall.dc,
      },
    };
  } else {
    const total = results.total ? computeScore(results.total, pv.total || 0) : { philly: 0, dc: 0 };
    pairing.score = {
      philly: { total: total.philly },
      dc: { total: total.dc },
    };
  }

  // Recalculate event-level totals from all match pairings
  let totalPhilly = 0;
  let totalDC = 0;
  for (const m of event.matches) {
    for (const p of m.pairings || []) {
      totalPhilly += p.score?.philly?.total ?? 0;
      totalDC += p.score?.dc?.total ?? 0;
    }
  }
  event.score = { philly: totalPhilly, dc: totalDC };

  try {
    await saveData(data);
    return NextResponse.json({
      success: true,
      pairingScore: pairing.score,
      eventScore: event.score,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
