export function pairingsLocked(event: { pairingsRevealAt?: string }, now = Date.now()): boolean {
  if (!event.pairingsRevealAt) return false;
  return now < new Date(event.pairingsRevealAt).getTime();
}

// Strip names, scores and featured flags so nothing sensitive reaches the client before the reveal.
// With showTeamPairs, each team's partner pairs are included, sorted independently per team
// so the order can't reveal who plays whom.
export function redactMatches(matches: any[] | undefined, opts: { showTeamPairs?: boolean } = {}): any[] | undefined {
  if (!matches) return matches;
  const sorted = (pairs: string[][]) => pairs.map((p) => [...p]).sort((a, b) => a.join(' ').localeCompare(b.join(' ')));
  return matches.map((m) => {
    const size = m.playersPerSide === 1 ? 1 : 2;
    const hidden = Array.from({ length: size }, () => 'Player Name');
    const out: any = {
      ...m,
      pairings: (m.pairings || []).map(() => ({ philly: [...hidden], dc: [...hidden] })),
    };
    if (opts.showTeamPairs) {
      out.teamPairs = {
        philly: sorted((m.pairings || []).map((p: any) => p.philly)),
        dc: sorted((m.pairings || []).map((p: any) => p.dc)),
      };
    }
    return out;
  });
}

