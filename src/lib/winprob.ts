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

function unitSegments(match: any): { seg: string; pts: number }[] {
  const pv = match.pointValues || {};
  const segs =
    match.holes === 18
      ? [['front', pv.front], ['back', pv.back], ['overall', pv.overall]]
      : [['total', pv.total]];
  return segs.filter(([, pts]) => pts > 0).map(([seg, pts]) => ({ seg: seg as string, pts: pts as number }));
}

function unitValues(match: any): number[] {
  return unitSegments(match).map((u) => u.pts);
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

interface PlayerInfo {
  name: string;
  homeClub?: string | null;
}

// Handicap, form, home-course and partner-history adjustments per pairing (positive favors Philly).
const HANDICAP_WEIGHT = 0.05; // per stroke of average handicap advantage
const HANDICAP_CAP = 0.5;
const FORM_WEIGHT = 0.04; // per stroke an index sits above the player's low index
const FORM_CAP = 0.25;
const HOME_COURSE_WEIGHT = 0.2; // share of the side who are members of the course being played
const EVENT_FORM_WEIGHT = 0.6; // today's results: points won minus lost, per player
const PAIR_WEIGHT = 0.5;
const PAIR_CAP = 0.4;

const clamp = (v: number, cap: number) => Math.max(-cap, Math.min(cap, v));
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

// Wins/losses/halves for a two-player team across earlier editions, as a smoothed log-odds score.
function pairHistoryScore(history: any[], names: string[]): number {
  if (names.length !== 2) return 0;
  const key = [...names].sort().join('|');
  let wins = 0;
  let n = 0;
  for (const e of history) {
    for (const m of e.matches || []) {
      for (const p of m.pairings || []) {
        if (!p.score) continue;
        for (const side of ['philly', 'dc'] as Team[]) {
          if (p[side]?.length !== 2 || [...p[side]].sort().join('|') !== key) continue;
          const mine = p.score[side]?.total ?? 0;
          const theirs = p.score[side === 'philly' ? 'dc' : 'philly']?.total ?? 0;
          n++;
          wins += mine > theirs ? 1 : mine === theirs ? 0.5 : 0;
        }
      }
    }
  }
  return n === 0 ? 0 : logit((wins + 2) / (n + 4));
}

export function computeWinProbability(
  events: any[],
  event: any,
  players: PlayerInfo[] = [],
  opts: { hideMatchups?: boolean } = {}
): WinResult {
  const history = events.filter((e) => e.year !== event.year);
  const { teamEdge, homeEdge } = fitHistory(history);
  const hostSign = event.hostCity === 'dc' ? 1 : -1;
  const preDC = sigmoid(teamEdge + homeEdge * hostSign);
  const prePhilly = 1 - preDC;

  const ratings = playerRatings(history, event.hostCity);
  const roster = new Map<string, { handicap?: number; lowIndex?: number }>();
  for (const r of [...(event.teamPhilly || []), ...(event.teamDC || [])]) {
    if (typeof r !== 'string') roster.set(r.name, { handicap: r.handicap, lowIndex: r.lowIndex });
  }
  const homeClub = new Map(players.map((p) => [p.name, (p.homeClub ?? '').toLowerCase()]));

  const avgHandicap = (names: string[]) => mean(names.map((n) => roster.get(n)?.handicap).filter((h): h is number => typeof h === 'number'));
  const avgSlump = (names: string[]) =>
    mean(
      names
        .map((n) => roster.get(n))
        .filter((r): r is { handicap: number; lowIndex: number } => typeof r?.handicap === 'number' && typeof r?.lowIndex === 'number')
        .map((r) => r.handicap - r.lowIndex)
    );
  const homeShare = (names: string[], course: string) => {
    const c = (course ?? '').toLowerCase();
    if (!names.length || !c) return 0;
    return names.filter((n) => {
      const club = homeClub.get(n);
      return !!club && (c.includes(club) || club.includes(c));
    }).length / names.length;
  };

  // In-event form: each player's points won vs lost in matches already finished this edition.
  const eventPts = new Map<string, { w: number; l: number }>();
  for (const m of event.matches || []) {
    for (const pr of m.pairings || []) {
      if (!pr.score) continue;
      for (const side of ['philly', 'dc'] as Team[]) {
        const won = pr.score[side]?.total ?? 0;
        const lost = pr.score[side === 'philly' ? 'dc' : 'philly']?.total ?? 0;
        for (const name of pr[side] || []) {
          const t = eventPts.get(name) ?? { w: 0, l: 0 };
          t.w += won;
          t.l += lost;
          eventPts.set(name, t);
        }
      }
    }
  }
  const eventForm = (names: string[]) =>
    mean(names.map((n) => { const t = eventPts.get(n); return t ? (t.w - t.l) / (t.w + t.l + 3) : 0; })) ?? 0;

  const raw = (event.matches || []).map((m: any) =>
    (m.pairings || []).map((pairing: any) => sideRating(pairing.philly || [], ratings) - sideRating(pairing.dc || [], ratings))
  );
  const rawMean = mean(raw.flat()) ?? 0;

  // With hidden matchups, each round's adjustment compares the average of each team's own pairs, so the
  // result is the same whichever pair faces whichever and nothing about the draw leaks.
  const roundExtra: number[] = (event.matches || []).map((m: any) => {
    const pairs = m.pairings || [];
    const side = (team: Team) => pairs.map((p: any) => (p[team] || []) as string[]);
    const avg = (xs: (number | null)[]) => mean(xs.filter((x): x is number => x != null));
    const [pP, pD] = [side('philly'), side('dc')];
    const diff = (f: (n: string[]) => number | null) => {
      const a = avg(pP.map(f));
      const b = avg(pD.map(f));
      return a != null && b != null ? b - a : 0;
    };
    const hc = clamp(HANDICAP_WEIGHT * diff(avgHandicap), HANDICAP_CAP);
    const form = clamp(FORM_WEIGHT * diff(avgSlump), FORM_CAP);
    const home = HOME_COURSE_WEIGHT * -diff((n) => homeShare(n, m.course));
    const pair = clamp(PAIR_WEIGHT * -diff((n) => pairHistoryScore(history, n)), PAIR_CAP);
    return hc + form + home + pair;
  });

  const rounds: { match: any; pairing: any; units: number[]; segs: string[]; base: number; extra: number }[][] = (event.matches || []).map((m: any, ri: number) =>
    (m.pairings || []).map((pairing: any, pi: number) => {
      const ph: string[] = pairing.philly || [];
      const dc: string[] = pairing.dc || [];
      const hP = avgHandicap(ph);
      const hD = avgHandicap(dc);
      const sP = avgSlump(ph);
      const sD = avgSlump(dc);
      const hc = hP != null && hD != null ? clamp(HANDICAP_WEIGHT * (hD - hP), HANDICAP_CAP) : 0;
      const form = sP != null && sD != null ? clamp(FORM_WEIGHT * (sD - sP), FORM_CAP) : 0;
      const home = HOME_COURSE_WEIGHT * (homeShare(ph, m.course) - homeShare(dc, m.course));
      const pair = clamp(PAIR_WEIGHT * (pairHistoryScore(history, ph) - pairHistoryScore(history, dc)), PAIR_CAP);
      const today = pairing.score ? 0 : EVENT_FORM_WEIGHT * (eventForm(ph) - eventForm(dc));
      return {
        match: m,
        pairing,
        units: unitValues(m),
        segs: unitSegments(m).map((u) => u.seg),
        base: opts.hideMatchups ? 0 : PLAYER_WEIGHT * (raw[ri][pi] - rawMean),
        extra: opts.hideMatchups ? roundExtra[ri] : hc + form + home + pair + today,
      };
    })
  );
  const flat = rounds.flat();

  const build = (q: number, withExtras: boolean) =>
    flat.flatMap((r) => r.units.map((pts) => ({ pts, p: sigmoid(logit(q) + r.base + (withExtras ? r.extra : 0)) })));

  // Anchor the intercept so records-only odds match the team-level prior; handicap, home course and
  // partner history then move the odds from there.
  let q = 0.5;
  if (flat.length) {
    let lo = 0.001;
    let hi = 0.999;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (finishProbability(0, 0, build(mid, false)) < prePhilly) lo = mid;
      else hi = mid;
    }
    q = (lo + hi) / 2;
  }
  const lineupPhilly = flat.length ? finishProbability(0, 0, build(q, true)) : prePhilly;

  let phillyNow = 0;
  let dcNow = 0;
  let anyScored = false;
  const remaining: Unit[] = [];
  const pairingWins: PairingWin[][] = rounds.map((round) =>
    round.map((r) => {
      const p = sigmoid(logit(q) + r.base + r.extra);
      const units = r.units.map((pts) => ({ pts, p }));
      if (r.pairing.score?.partial) {
        // Some nines decided: bank those points and keep pricing the nines still to play.
        anyScored = true;
        const ph = r.pairing.score.philly?.total ?? 0;
        const dc = r.pairing.score.dc?.total ?? 0;
        phillyNow += ph;
        dcNow += dc;
        const open = units.filter((_, i) => r.pairing.score.philly?.[r.segs[i]] === undefined);
        remaining.push(...open);
        const w = finishProbability(ph, dc, open);
        return { philly: w, dc: 1 - w };
      }
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

  const philly = anyScored ? finishProbability(phillyNow, dcNow, remaining) : lineupPhilly;
  const remainingPts = remaining.reduce((a, u) => a + u.pts, 0);
  const expectedRemainingPhilly = remaining.reduce((a, u) => a + u.pts * u.p, 0);

  const past = completed(history);
  const hostWins = past.filter((e) => (e.hostCity === 'philly' ? e.score.philly > e.score.dc : e.score.dc > e.score.philly)).length;
  const wins = (t: Team) => past.filter((e) => (t === 'philly' ? e.score.philly > e.score.dc : e.score.dc > e.score.philly)).length;

  return {
    philly,
    dc: 1 - philly,
    preEvent: { philly: lineupPhilly, dc: 1 - lineupPhilly },
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
