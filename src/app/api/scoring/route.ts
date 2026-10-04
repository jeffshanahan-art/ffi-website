import { NextRequest, NextResponse } from 'next/server';
import staticData from '@/data/ffi-data.json';
import { computeWinProbability } from '@/lib/winprob';
import { pairingsLocked, redactMatches } from '@/lib/reveal';

function isAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get('ffi_admin');
  return cookie?.value === 'authenticated';
}

const GH_OWNER = 'jeffshanahan-art';
const GH_REPO = 'ffi-website';
const GH_PATH = 'src/data/ffi-data.json';
const GH_URL = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_PATH}`;

function devFilePath(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path');
  return path.join(process.cwd(), 'src', 'data', 'ffi-data.json');
}

// In production, read the live file from GitHub so scores show up immediately
// (the bundled copy only updates after Vercel finishes redeploying).
async function loadData(): Promise<{ data: any; sha?: string }> {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    return { data: JSON.parse(fs.readFileSync(devFilePath(), 'utf-8')) };
  }

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    try {
      const res = await fetch(`${GH_URL}?ref=main`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
        cache: 'no-store',
      });
      if (res.ok) {
        const info = await res.json();
        if (info.content) {
          const text = Buffer.from(info.content, 'base64').toString('utf-8');
          return { data: JSON.parse(text), sha: info.sha };
        }
      }
    } catch {
      // fall through to bundled data
    }
  }
  return { data: JSON.parse(JSON.stringify(staticData)) };
}

class ConflictError extends Error {}

async function saveData(data: any, sha: string | undefined, message: string): Promise<void> {
  const content = JSON.stringify(data, null, 2) + '\n';

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    fs.writeFileSync(devFilePath(), content);
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN environment variable is not set');
  if (!sha) throw new Error('Could not read the current scores from GitHub');

  const putRes = await fetch(GH_URL, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      sha,
      branch: 'main',
    }),
  });

  if (putRes.status === 409 || putRes.status === 422) throw new ConflictError('Score conflict');
  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}));
    throw new Error(err.message || 'GitHub commit failed');
  }
}

// Event days are evaluated in Eastern time, not UTC.
function getTodayISO(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
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
  const year = request.nextUrl.searchParams.get('year');
  if (!year) {
    return NextResponse.json({ error: 'year param required' }, { status: 400 });
  }

  const { data } = await loadData();
  const event = (data.events as any[]).find((e) => e.year === year);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const today = getTodayISO();
  const dates: string[] = event.dates || [];
  const active = dates.includes(today);

  const locked = pairingsLocked(event) && !isAuthenticated(request);

  return NextResponse.json({
    active,
    dates,
    matches: (locked ? redactMatches(event.matches) : event.matches) || [],
    pairingsLocked: locked,
    pairingsRevealAt: event.pairingsRevealAt ?? null,
    score: event.score || { philly: null, dc: null },
    winProbability: computeWinProbability(data.events as any[], event),
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

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, sha } = await loadData();
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

    if (match.holes === 18) {
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
      await saveData(data, sha, `Scoring: ${year} round ${roundIndex + 1}, pairing ${pairingIndex + 1}`);
      return NextResponse.json({
        success: true,
        pairingScore: pairing.score,
        eventScore: event.score,
      });
    } catch (err: any) {
      if (err instanceof ConflictError && attempt < 2) continue;
      return NextResponse.json({ error: err.message }, { status: err instanceof ConflictError ? 409 : 500 });
    }
  }  return NextResponse.json({ error: 'Score conflict, please retry' }, { status: 409 });
}
