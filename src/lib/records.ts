export interface Rec {
  w: number;
  l: number;
  h: number;
}

export const fmtRec = (r: Rec) => `${r.w}-${r.l}-${r.h}`;

type Side = 'philly' | 'dc';

// Result for one side of a scored pairing, judged on total points won.
function resultFor(pairing: any, side: Side): 'w' | 'l' | 'h' | null {
  const ph = pairing.score?.philly?.total;
  const dc = pairing.score?.dc?.total;
  if (typeof ph !== 'number' || typeof dc !== 'number') return null;
  if (ph === dc) return 'h';
  return (side === 'philly') === ph > dc ? 'w' : 'l';
}

const keyOf = (names: string[]) => [...names].sort().join('|');

function eachScoredPairing(events: any[], fn: (pairing: any, side: Side) => void) {
  for (const e of events) {
    for (const m of e.matches || []) {
      for (const p of m.pairings || []) {
        if (!p.score) continue;
        fn(p, 'philly');
        fn(p, 'dc');
      }
    }
  }
}

function tally(rec: Rec | undefined, r: 'w' | 'l' | 'h'): Rec {
  const out = rec ?? { w: 0, l: 0, h: 0 };
  out[r]++;
  return out;
}

// Every scored match a player has played (doubles and singles), all editions.
export function playerRecords(events: any[]): Map<string, Rec> {
  const out = new Map<string, Rec>();
  eachScoredPairing(events, (p, side) => {
    const r = resultFor(p, side);
    if (!r) return;
    for (const name of p[side] || []) out.set(name, tally(out.get(name), r));
  });
  return out;
}

// Record of a two-player team across editions before the given one; null if they haven't played together.
export function pairRecordBefore(events: any[], year: string, names: string[]): Rec | null {
  if (names.length !== 2) return null;
  const idx = events.findIndex((e) => e.year === year);
  const prior = idx === -1 ? events : events.slice(0, idx);
  const key = keyOf(names);
  let rec: Rec | undefined;
  eachScoredPairing(prior, (p, side) => {
    if (p[side]?.length !== 2 || keyOf(p[side]) !== key) return;
    const r = resultFor(p, side);
    if (r) rec = tally(rec, r);
  });
  return rec ?? null;
}

export function withPairRecords(events: any[], year: string, matches: any[] | undefined): any[] | undefined {
  if (!matches) return matches;
  return matches.map((m) => ({
    ...m,
    pairings: (m.pairings || []).map((p: any) => ({
      ...p,
      pairRecords: {
        philly: pairRecordBefore(events, year, p.philly || []),
        dc: pairRecordBefore(events, year, p.dc || []),
      },
    })),
  }));
}
