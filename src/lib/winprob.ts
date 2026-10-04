type Team = 'philly' | 'dc';

export interface WinProbability {
  philly: number;
  dc: number;
  preEvent: { philly: number; dc: number };
  live: boolean;
  score: { philly: number; dc: number };
  projected: { philly: number; dc: number };
  hostCity: string;
  hostRecord: { wins: number; editions: number };
  seriesRecord: { philly: number; dc: number };
}

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

function completed(events: any[]) {
  return events.filter(
    (e) => e.champion && e.score && e.score.philly != null && e.score.dc != null && (e.hostCity === 'philly' || e.hostCity === 'dc')
  );
}

// Logistic model: P(DC wins) = sigmoid(teamEdge + homeEdge * (+1 if DC hosts, -1 if Philly hosts)).
// Fit on past editions with recency weighting; target blends win/loss with share of points.
function fitHistory(events: any[]): { teamEdge: number; homeEdge: number } {
  const past = completed(events);
  const n = past.length;
  const rows = past.map((e, i) => {
    const total = e.score.philly + e.score.dc;
    const win = e.score.dc > e.score.philly ? 1 : e.score.dc === e.score.philly ? 0.5 : 0;
    return {
      w: Math.pow(0.9, n - 1 - i),
      s: e.hostCity === 'dc' ? 1 : -1,
      y: 0.5 * win + 0.5 * (total ? e.score.dc / total : 0.5),
    };
  });
  let teamEdge = 0;
  let homeEdge = 0;
  const lambda = 1;
  for (let iter = 0; iter < 4000; iter++) {
    let g1 = lambda * teamEdge;
    let g2 = lambda * homeEdge;
    for (const r of rows) {
      const err = sigmoid(teamEdge + homeEdge * r.s) - r.y;
      g1 += r.w * err;
      g2 += r.w * err * r.s;
    }
    teamEdge -= 0.05 * g1;
    homeEdge -= 0.05 * g2;
  }
  return { teamEdge, homeEdge };
}

interface Unit {
  pts: number;
  p: number; // chance Philly wins this point
}

function unitValues(match: any): number[] {
  const pv = match.pointValues || {};
  const units = match.holes === 18 ? [pv.front, pv.back, pv.overall] : [pv.total];
  return units.filter((u: number) => u > 0);
}

// P(Philly finishes ahead) given current points and remaining independent point units.
function finishProbability(phillyNow: number, dcNow: number, units: Unit[]): number {
  let dist = new Map<number, number>([[0, 1]]);
  for (const u of units) {
    const next = new Map<number, number>();
    for (const [pts, pr] of dist) {
      next.set(pts + u.pts, (next.get(pts + u.pts) ?? 0) + pr * u.p);
      next.set(pts, (next.get(pts) ?? 0) + pr * (1 - u.p));
    }
    dist = next;
  }
  const remaining = units.reduce((a, u) => a + u.pts, 0);
  let win = 0;
  for (const [pts, pr] of dist) {
    const p = phillyNow + pts;
    const d = dcNow + (remaining - pts);
    win += pr * (p > d ? 1 : p === d ? 0.5 : 0);
  }
  return win;
}

const logit = (p: number) => Math.log(p / (1 - p));

// Player strength from past pairings: shrunk log-odds of points won, blended toward
// their record in the same home/away setting as the upcoming edition.
function playerRatings(events: any[], hostCity: string): Map<string, number> {
  const past = events.filter((e) => e.matches?.length && completed([e]).length);
  const n = past.length;
  const tally = new Map<string, { w: number; l: number }>();
  past.forEach((e, i) => {
    const wt = Math.pow(0.9, n - 1 - i);
    for (const m of e.matches) {
      for (const pr of m.pairings || []) {
        if (!pr.score) continue;
        const ph = pr.score.philly?.total ?? 0;
        const dc = pr.score.dc?.total ?? 0;
        for (const team of ['philly', 'dc'] as Team[]) {
          const won = team === 'philly' ? ph : dc;
          const lost = team === 'philly' ? dc : ph;
          for (const name of pr[team] || []) {
            const t = tally.get(name) ?? { w: 0, l: 0 };
            t.w += wt * won;
            t.l += wt * lost;
            tally.set(name, t);
          }
        }
      }
    }
  });
  // second pass for venue-specific record: same role (home/away) as in the upcoming edition
  const venue = new Map<string, { w: number; l: number }>();
  past.forEach((e, i) => {
    const wt = Math.pow(0.9, n - 1 - i);
    for (const m of e.matches) {
      for (const pr of m.pairings || []) {
        if (!pr.score) continue;
        const ph = pr.score.philly?.total ?? 0;
        const dc = pr.score.dc?.total ?? 0;
        for (const team of ['philly', 'dc'] as Team[]) {
          const upcomingHome = team === hostCity;
          const wasHome = team === e.hostCity;
          if (upcomingHome !== wasHome) continue;
          const won = team === 'philly' ? ph : dc;
          const lost = team === 'philly' ? dc : ph;
          for (const name of pr[team] || []) {
            const v = venue.get(name) ?? { w: 0, l: 0 };
            v.w += wt * won;
            v.l += wt * lost;
            venue.set(name, v);
          }
        }
      }
    }
  });

  const K = 4; // pseudo-points pulling overall record toward even
  const KV = 6; // pseudo-points pulling venue record toward overall record
  const ratings = new Map<string, number>();
  for (const [name, t] of tally) {
    const overall = (t.w + K / 2) / (t.w + t.l + K);
    const v = venue.get(name) ?? { w: 0, l: 0 };
    const venueShare = (v.w + KV * overall) / (v.w + v.l + KV);
    ratings.set(name, logit(Math.min(0.95, Math.max(0.05, venueShare))));
  }
  return ratings;
}

const PLAYER_WEIGHT = 0.8;

function sideRating(names: string[], ratings: Map<string, number>): number {
  if (!names.length) return 0;
  return names.reduce((a, n) => a + (ratings.get(n) ?? 0), 0) / names.length;
}

export interface PairingWin {
  philly: number;
  dc: number;
}

export interface WinResult extends WinProbability {
  pairings: PairingWin[][];
}

export function computeWinProbability(events: any[], event: any): WinResult {
  const history = events.filter((e) => e.year !== event.year);
  const { teamEdge, homeEdge } = fitHistory(history);
  const hostSign = event.hostCity === 'dc' ? 1 : -1;
  const preDC = sigmoid(teamEdge + homeEdge * hostSign);
  const prePhilly = 1 - preDC;

  const ratings = playerRatings(history, event.hostCity);

  // Lineup edge per pairing (positive favors Philly).
  const rounds: { match: any; pairing: any; units: number[]; delta: number }[][] = (event.matches || []).map((m: any) =>
    (m.pairings || []).map((pairing: any) => ({
      match: m,
      pairing,
      units: unitValues(m),
      delta: PLAYER_WEIGHT * (sideRating(pairing.philly || [], ratings) - sideRating(pairing.dc || [], ratings)),
    }))
  );
  const flat = rounds.flat();

  const build = (q: number) =>
    flat.flatMap((r) => r.units.map((pts) => ({ pts, p: sigmoid(logit(q) + r.delta) })));

  // Shift all pairings equally so the whole-event odds match the team-level prior.
  let q = 0.5;
  if (flat.length) {
    let lo = 0.001;
    let hi = 0.999;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (finishProbability(0, 0, build(mid)) < prePhilly) lo = mid;
      else hi = mid;
    }
    q = (lo + hi) / 2;
  }

  let phillyNow = 0;
  let dcNow = 0;
  let anyScored = false;
  const remaining: Unit[] = [];
  const pairingWins: PairingWin[][] = rounds.map((round) =>
    round.map((r) => {
      const p = sigmoid(logit(q) + r.delta);
      const units = r.units.map((pts) => ({ pts, p }));
      if (r.pairing.score) {
        anyScored = true;
        const ph = r.pairing.score.philly?.total ?? 0;
        const dc = r.pairing.score.dc?.total ?? 0;
        phillyNow += ph;
        dcNow += dc;
        const res = ph > dc ? 1 : ph === dc ? 0.5 : 0;
        return { philly: res, dc: 1 - res };
      }
      remaining.push(...units);
      const w = finishProbability(0, 0, units);
      return { philly: w, dc: 1 - w };
    })
  );

  const philly = anyScored ? finishProbability(phillyNow, dcNow, remaining) : prePhilly;
  const remainingPts = remaining.reduce((a, u) => a + u.pts, 0);
  const expectedRemainingPhilly = remaining.reduce((a, u) => a + u.pts * u.p, 0);

  const past = completed(history);
  const hostWins = past.filter((e) => (e.hostCity === 'philly' ? e.score.philly > e.score.dc : e.score.dc > e.score.philly)).length;
  const wins = (t: Team) => past.filter((e) => (t === 'philly' ? e.score.philly > e.score.dc : e.score.dc > e.score.philly)).length;

  return {
    philly,
    dc: 1 - philly,
    preEvent: { philly: prePhilly, dc: preDC },
    live: anyScored,
    score: { philly: phillyNow, dc: dcNow },
    projected: { philly: phillyNow + expectedRemainingPhilly, dc: dcNow + (remainingPts - expectedRemainingPhilly) },
    hostCity: event.hostCity,
    hostRecord: { wins: hostWins, editions: past.length },
    seriesRecord: { philly: wins('philly'), dc: wins('dc') },
    pairings: pairingWins,
  };
}

export function withPairingWinPct(matches: any[] | undefined, pairings: PairingWin[][]): any[] | undefined {
  if (!matches) return matches;
  return matches.map((m, i) => ({
    ...m,
    pairings: (m.pairings || []).map((p: any, j: number) => ({ ...p, winPct: pairings[i]?.[j] })),
  }));
}
