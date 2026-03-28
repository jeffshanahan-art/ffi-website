import type { RosterEntry } from '@/types';

export function EventRosters({ teamPhilly, teamDC }: { teamPhilly: RosterEntry[]; teamDC: RosterEntry[] }) {
  if (teamPhilly.length === 0 && teamDC.length === 0) {
    return (
      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-2xl text-blue font-normal border-b border-gray pb-3 mb-6">Rosters</h2>
          <p className="text-slate italic">Roster data not available for this edition.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-serif text-2xl text-blue font-normal border-b border-gray pb-3 mb-8">Rosters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <RosterColumn title="Team Philly" players={teamPhilly} />
          <RosterColumn title="Team DC" players={teamDC} />
        </div>
      </div>
    </section>
  );
}

function RosterColumn({ title, players }: { title: string; players: RosterEntry[] }) {
  return (
    <div>
      <h3 className="font-serif text-lg text-blue font-normal mb-4">{title}</h3>
      {players.map((p) => (
        <div key={p.name} className="flex items-center justify-between py-2.5 border-b border-gray">
          <div>
            <span className="text-black text-sm">{p.name}</span>
            {p.role && (
              <span className="ml-2 text-blue text-xs">({p.role})</span>
            )}
          </div>
          {p.handicap !== undefined && (
            <span className="text-slate text-sm">
              {p.handicap > 0 ? p.handicap.toFixed(1) : `+${Math.abs(p.handicap).toFixed(1)}`}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
