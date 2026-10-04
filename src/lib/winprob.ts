type Team = 'philly' | 'dc';

export interface WinProbability {
  philly: number;
  dc: number;
  preEvent: { philly: number; dc: number };
  live: boolean;
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

function pointUnits(match: any): number[] {
  const pv = match.pointValues || {};
  const units = match.holes === 18 ? [pv.front, pv.back, pv.overall] : [pv.total];
  return units.filter((u: number) => u > 0);
}

// P(Philly finishes ahead) given current points and remaining independent point units each won by Philly with prob q.
function finishProbability(phillyNow: number, dcNow: number, units: number[], q: number): number {
  let dist = new Map<number, number>([[0, 1]]);
  for (const u of units) {
    const next = new Map<number, number>();
    for (const [pts, pr] of dist) {
      next.set(pts + u, (next.get(pts + u) ?? 0) + pr * q);
      next.set(pts, (next.get(pts) ?? 0) + pr * (1 - q));
    }
    dist = next;
  }
  const remaining = units.reduce((a, b) => a + b, 0);
  let win = 0;
  for (const [pts, pr] of dist) {
    const p = phillyNow + pts;
    const d = dcNow + (remaining - pts);
    win += pr * (p > d ? 1 : p === d ? 0.5 : 0);
  }
  return win;
}

// Per-point win chance that reproduces the pre-event team win probability.
function calibrate(units: number[], target: number): number {
  let lo = 0.001;
  let hi = 0.999;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (finishProbability(0, 0, units, mid) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function computeWinProbability(events: any[], event: any): WinProbability {
  const history = events.filter((e) => e.year !== event.year);
  const { teamEdge, homeEdge } = fitHistory(history);
  const hostSign = event.hostCity === 'dc' ? 1 : -1;
  const preDC = sigmoid(teamEdge + homeEdge * hostSign);
  const prePhilly = 1 - preDC;

  const pairings: { match: any; pairing: any }[] = [];
  for (const m of event.matches || []) for (const p of m.pairings || []) pairings.push({ match: m, pairing: p });

  let phillyNow = 0;
  let dcNow = 0;
  let anyScored = false;
  const allUnits: number[] = [];
  const remainingUnits: number[] = [];
  for (const { match, pairing } of pairings) {
    const units = pointUnits(match);
    allUnits.push(...units);
    if (pairing.score) {
      anyScored = true;
      phillyNow += pairing.score.philly?.total ?? 0;
      dcNow += pairing.score.dc?.total ?? 0;
    } else {
      remainingUnits.push(...units);
    }
  }

  let philly = prePhilly;
  if (anyScored && allUnits.length) {
    const q = calibrate(allUnits, prePhilly);
    philly = finishProbability(phillyNow, dcNow, remainingUnits, q);
  }

  const past = completed(history);
  const hostWins = past.filter((e) => (e.hostCity === 'philly' ? e.score.philly > e.score.dc : e.score.dc > e.score.philly)).length;
  const wins = (t: Team) => past.filter((e) => (t === 'philly' ? e.score.philly > e.score.dc : e.score.dc > e.score.philly)).length;

  return {
    philly,
    dc: 1 - philly,
    preEvent: { philly: prePhilly, dc: preDC },
    live: anyScored,
    hostCity: event.hostCity,
    hostRecord: { wins: hostWins, editions: past.length },
    seriesRecord: { philly: wins('philly'), dc: wins('dc') },
  };
}
