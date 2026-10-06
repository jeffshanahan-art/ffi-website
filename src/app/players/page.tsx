import Image from 'next/image';
import { getPlayers } from '@/lib/data';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Player } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Players — FFI',
  description: 'The complete FFI player directory — every golfer who has competed in the Founding Fathers Invitational.',
};

function formatYear(year: string): string {
  if (year.startsWith('S')) {
    return `Spring '${year.slice(-2)}`;
  }
  if (year.startsWith('F')) {
    return `Fall '${year.slice(-2)}`;
  }
  return `'${year.slice(-2)}`;
}

function formatHandicap(v: number): string {
  return v < 0 ? `+${Math.abs(v).toFixed(1)}` : v.toFixed(1);
}

function HandicapTrend({ handicaps }: { handicaps: { year: string; value: number }[] }) {
  const first = handicaps[0];
  const last = handicaps[handicaps.length - 1];
  const change = Math.round((last.value - first.value) * 10) / 10;
  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-xs uppercase tracking-wide text-slate">Handicap</span>
        {handicaps.length > 1 && (
          <span className={`text-xs font-medium ${change < 0 ? 'text-green-700' : change > 0 ? 'text-red-700' : 'text-slate'}`}>
            {change === 0 ? 'No change' : `${change < 0 ? '\u2193' : '\u2191'} ${Math.abs(change).toFixed(1)} since ${formatYear(first.year)}`}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
        {handicaps.map((h) => (
          <span key={h.year} className="text-sm text-slate">
            <span className="text-xs text-slate/70">{formatYear(h.year)}</span>{' '}
            <span className="font-medium text-black">{formatHandicap(h.value)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function PlayerCard({ player }: { player: Player }) {
  const appearances = player.yearsPlayed.length;

  return (
    <div className="py-8 border-b border-gray">
      <div className="flex gap-5">
        {/* Headshot */}
        {player.headshot ? (
          <div className="shrink-0 w-20 h-24 relative overflow-hidden bg-gray-light">
            <Image
              src={player.headshot}
              alt={player.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        ) : (
          <div className="shrink-0 w-20 h-24 bg-gray-light flex items-center justify-center">
            <span className="font-serif text-2xl text-slate/40">
              {player.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        )}

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-xl text-black">
            {player.name}
          </h3>

          {player.nickname && (
            <p className="text-blue text-sm mt-0.5 italic">
              &ldquo;{player.nickname}&rdquo;
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-slate">
            <span>{appearances} {appearances === 1 ? 'appearance' : 'appearances'}</span>
            {player.roles.length > 0 && (
              <>
                <span className="text-gray">&middot;</span>
                <span className="text-blue">{player.roles.join(', ')}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {player.bio && (
        <p className="text-slate text-sm leading-relaxed mt-4">
          {player.bio}
        </p>
      )}

      {player.record && (
        <div className="mt-3">
          <p className="text-sm text-slate">
            <span className="text-xs uppercase tracking-wide">All time record:</span>{' '}
            <span className="font-medium text-black">{player.record.w}-{player.record.l}-{player.record.h}*</span>
          </p>
          {player.missingYears && player.missingYears.length > 0 && (
            <p className="text-[11px] text-slate/80">
              * Missing years: {player.missingYears.map(formatYear).join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Handicap trend */}
      {player.handicaps && player.handicaps.length > 0 && <HandicapTrend handicaps={player.handicaps} />}

      {/* Year badges */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {player.yearsPlayed.map((year) => (
          <span
            key={year}
            className="text-xs text-slate bg-gray-light px-2 py-0.5 border border-gray"
          >
            {formatYear(year)}
          </span>
        ))}
      </div>
    </div>
  );
}

function TeamColumn({
  title,
  players,
}: {
  title: string;
  players: Player[];
}) {
  const sorted = [...players].sort(
    (a, b) => b.yearsPlayed.length - a.yearsPlayed.length
  );

  return (
    <div>
      <SectionHeading
        title={title}
        subtitle={`${sorted.length} all-time players`}
      />
      <div className="mt-6">
        {sorted.map((player) => (
          <PlayerCard key={player.name} player={player} />
        ))}
      </div>
    </div>
  );
}

export default async function PlayersPage() {
  const players = await getPlayers();

  const phillyPlayers = players.filter((p) => p.team === 'philly');
  const dcPlayers = players.filter((p) => p.team === 'dc');

  return (
    <main className="min-h-screen">
      {/* Page header */}
      <div className="max-w-5xl mx-auto px-4 pt-12 pb-8">
        <h1 className="font-serif text-4xl md:text-5xl text-blue font-normal">
          Players
        </h1>
        <p className="mt-2 text-slate text-sm">
          Every golfer who has competed in the Founding Fathers Invitational
        </p>
        <div className="border-b border-gray mt-6" />
      </div>

      {/* Two-column team directory */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          <TeamColumn title="Team Philly" players={phillyPlayers} />
          <TeamColumn title="Team DC" players={dcPlayers} />
        </div>
      </div>
    </main>
  );
}
