import Link from 'next/link';
import type { Tournament } from '@/types';
import { toOrdinal } from '@/lib/utils';

function getSeasonYear(t: Tournament): string {
  if (t.displayYear.includes('Spring')) return '2018 Spring';
  if (t.displayYear.includes('Fall')) return '2018 Fall';
  return `${t.displayYear} Fall`;
}

function getHostLabel(city: string): string {
  return city === 'philly' ? 'Philadelphia' : 'Washington, DC';
}

function getHostScore(t: Tournament): { home: number | null; away: number | null } {
  if (t.hostCity === 'philly') {
    return { home: t.scorePhilly, away: t.scoreDC };
  }
  return { home: t.scoreDC, away: t.scorePhilly };
}

export function TournamentTimeline({ tournaments }: { tournaments: Tournament[] }) {
  return (
    <section className="py-12 px-4">
      <div className="max-w-5xl mx-auto overflow-x-auto">
        {/* Column header */}
        <div className="grid grid-cols-[3rem_10rem_8rem_1fr_8rem_8rem] items-center py-3 border-b-2 border-black text-xs text-slate uppercase tracking-wider min-w-[700px]">
          <span />
          <span>Year</span>
          <span>Host</span>
          <span>Location</span>
          <span className="text-right">Score</span>
          <span className="text-right">Champion</span>
        </div>

        {tournaments.map((t) => {
          const score = getHostScore(t);
          return (
            <Link
              key={t.year}
              href={`/events/${t.year}`}
              className="grid grid-cols-[3rem_10rem_8rem_1fr_8rem_8rem] items-center py-4 border-b border-gray hover:bg-gray-light transition-colors min-w-[700px]"
            >
              <span className="font-serif text-blue text-sm">
                {toOrdinal(t.edition)}
              </span>

              <span className="font-serif text-lg text-black">
                {getSeasonYear(t)}
              </span>

              <span className="text-slate text-sm">
                {getHostLabel(t.hostCity)}
              </span>

              <span className="text-slate text-sm truncate pr-4">
                {t.courses.join(', ')}
              </span>

              {score.home !== null && score.away !== null ? (
                <span className="font-serif text-lg text-blue text-right">
                  {score.home} &ndash; {score.away}
                </span>
              ) : (
                <span className="text-slate text-sm italic text-right">
                  TBD
                </span>
              )}

              <span className="text-right">
                {t.champion ? (
                  <span className="font-serif text-sm font-semibold text-black">
                    {t.champion === 'philly' ? 'Team Philly' : 'Team DC'}
                  </span>
                ) : (
                  <span className="text-slate text-sm italic">TBD</span>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
