import type { TournamentDetail } from '@/types';

function fmt(n: number): string {
  if (n === 0) return '0';
  const whole = Math.floor(n);
  const frac = n - whole;
  if (frac === 0) return `${whole}`;
  if (frac === 0.5) return whole > 0 ? `${whole}½` : '½';
  if (Math.abs(frac - 0.75) < 0.01) return whole > 0 ? `${whole}¾` : '¾';
  return n.toString();
}

export function EventPairings({ tournament }: { tournament: TournamentDetail }) {
  const matches = tournament.matches;
  if (!matches || matches.length === 0) {
    return (
      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-2xl text-blue font-normal border-b border-gray pb-3 mb-6">Match Pairings</h2>
          <p className="text-slate italic">Pairing data not available for this edition.</p>
        </div>
      </section>
    );
  }

  const hasScores = matches.some((m: any) => m.pairings?.some((p: any) => p.score));
  const partialResults = (tournament as any).partialResults;

  return (
    <section className="py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between border-b border-gray pb-3 mb-8">
          <h2 className="font-serif text-2xl text-blue font-normal">Match Pairings</h2>
          {hasScores && !partialResults && (() => {
            const totalPhilly = matches.reduce((sum: number, m: any) =>
              sum + (m.pairings?.reduce((s: number, p: any) => s + (p.score?.philly?.total ?? 0), 0) ?? 0), 0);
            const totalDC = matches.reduce((sum: number, m: any) =>
              sum + (m.pairings?.reduce((s: number, p: any) => s + (p.score?.dc?.total ?? 0), 0) ?? 0), 0);
            return totalPhilly + totalDC > 0 ? (
              <span className="text-sm font-semibold text-black">
                Philly {fmt(totalPhilly)} – {fmt(totalDC)} DC
              </span>
            ) : null;
          })()}
        </div>
        {matches.map((match: any, i: number) => {
          const roundPhilly = match.pairings?.reduce((sum: number, p: any) => sum + (p.score?.philly?.total ?? 0), 0) ?? 0;
          const roundDC = match.pairings?.reduce((sum: number, p: any) => sum + (p.score?.dc?.total ?? 0), 0) ?? 0;
          const showRoundScore = hasScores && roundPhilly + roundDC > 0;

          const roundHasFBO = match.pairings?.some((p: any) =>
            p.score && p.score.philly?.front != null
          );

          return (
            <div key={i} className="mb-10">
              <div className="flex items-baseline justify-between border-b border-gray pb-2 mb-1">
                <h3 className="font-serif text-lg text-blue font-normal">
                  {match.type || `Round ${match.round || i + 1}`}
                </h3>
                {showRoundScore && (
                  <span className="text-sm font-medium text-black">
                    Philly {fmt(roundPhilly)} – {fmt(roundDC)} DC
                  </span>
                )}
              </div>
              {match.course && <p className="text-slate text-sm mb-4">{match.course}</p>}
              {!match.course && <div className="mb-4" />}

              {hasScores && (
                <div className="hidden sm:grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 pb-2 mb-1 text-xs text-slate uppercase tracking-wide">
                  <div className="text-right">Team Philly</div>
                  <div className="w-[100px] text-center">{roundHasFBO ? 'F / B / O' : 'Score'}</div>
                  <div>Team DC</div>
                </div>
              )}

              {match.pairings?.map((pairing: any, j: number) => {
                const score = pairing.score;
                return (
                  <div key={j} className="py-3 border-b border-gray">
                    <div className="flex items-center">
                      <div className="flex-1 text-right">
                        <span className="text-black text-sm">
                          {pairing.philly.join(' & ')}
                        </span>
                      </div>
                      {score ? (
                        <div className="w-[100px] text-center shrink-0 mx-3">
                          <span className="text-sm font-semibold text-black">
                            {fmt(score.philly.total)} – {fmt(score.dc.total)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate text-xs px-4">vs</span>
                      )}
                      <div className="flex-1 text-left">
                        <span className="text-black text-sm">
                          {pairing.dc.join(' & ')}
                        </span>
                      </div>
                    </div>
                    {score && roundHasFBO && (
                      <div className="hidden sm:flex justify-center mt-1 text-xs text-slate">
                        <span>
                          {fmt(score.philly.front)}/{fmt(score.philly.back)}/{fmt(score.philly.overall)}
                          {' · '}
                          {fmt(score.dc.front)}/{fmt(score.dc.back)}/{fmt(score.dc.overall)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}
