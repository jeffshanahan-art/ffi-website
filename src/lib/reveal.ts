export function pairingsLocked(event: { pairingsRevealAt?: string }, now = Date.now()): boolean {
  if (!event.pairingsRevealAt) return false;
  return now < new Date(event.pairingsRevealAt).getTime();
}

// Strip names, scores and featured flags so nothing sensitive reaches the client before the reveal.
export function redactMatches(matches: any[] | undefined): any[] | undefined {
  if (!matches) return matches;
  return matches.map((m) => {
    const size = m.playersPerSide === 1 ? 1 : 2;
    const hidden = Array.from({ length: size }, () => 'Player Name');
    return {
      ...m,
      pairings: (m.pairings || []).map(() => ({ philly: [...hidden], dc: [...hidden] })),
    };
  });
}

export function formatReveal(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  });
}
