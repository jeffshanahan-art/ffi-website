export interface Rec {
  w: number;
  l: number;
  h: number;
}

type Side = 'philly' | 'dc';

// Result for one side of a scored pairing, judged on total points won.
function resultFor(pairing: any, side: Side): 'w' | 'l' | 'h' | null {
  const ph = pairing.score?.philly?.total;
  const dc = pairing.score?.dc?.total;
  if (typeof ph !== 'number' || typeof dc !== 'number') return null;
  if (ph === dc) return 'h';
  return (side === 'philly') === ph > dc ? 'w' : 'l';
}

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

// Years a player was on a roster for a completed edition but has no (or only some) recorded match results.
export function missingYears(events: any[]): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const e of events) {
    if (!e.champion) continue;
    const stats = new Map<string, { scored: number; unscored: number }>();
    for (const m of e.matches || []) {
      for (const p of m.pairings || []) {
        for (const side of ['philly', 'dc'] as Side[]) {
          for (const name of p[side] || []) {
            const s = stats.get(name) ?? { scored: 0, unscored: 0 };
            if (p.score) s.scored++;
            else s.unscored++;
            stats.set(name, s);
          }
        }
      }
    }
    for (const entry of [...(e.teamPhilly || []), ...(e.teamDC || [])]) {
      const name = typeof entry === 'string' ? entry : entry.name;
      const s = stats.get(name);
      if (!s || s.scored === 0 || s.unscored > 0) out.set(name, [...(out.get(name) ?? []), e.year]);
    }
  }
  return out;
}
