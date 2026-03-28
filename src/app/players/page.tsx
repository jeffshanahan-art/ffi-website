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
            {player.homeClub && (
              <>
                <span className="text-gray">&middot;</span>
                <span>{player.homeClub}</span>
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
