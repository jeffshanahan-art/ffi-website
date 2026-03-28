import type { TournamentDetail } from '@/types';

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

  return (
    <section className="py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-serif text-2xl text-blue font-normal border-b border-gray pb-3 mb-8">Match Pairings</h2>
        {matches.map((match: any, i: number) => (
          <div key={i} className="mb-10">
            <h3 className="font-serif text-lg text-blue font-normal border-b border-gray pb-2 mb-1">
              {match.type || `Round ${match.round || i + 1}`}
            </h3>
            {match.course && <p className="text-slate text-sm mb-4">{match.course}</p>}
            {!match.course && <div className="mb-4" />}
            {match.pairings?.map((pairing: any, j: number) => (
              <div key={j} className="flex items-center py-3 border-b border-gray">
                {pairing.teeTime && (
                  <span className="text-slate text-sm w-20 shrink-0">{pairing.teeTime}</span>
                )}
                <div className="flex-1 text-right">
                  <span className="text-black text-sm">
                    {pairing.philly.join(' & ')}
                  </span>
                </div>
                <span className="text-slate text-xs px-4">vs</span>
                <div className="flex-1 text-left">
                  <span className="text-black text-sm">
                    {pairing.dc.join(' & ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
