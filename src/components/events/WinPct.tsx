export interface WinProbabilityData {
  philly: number;
  dc: number;
  live: boolean;
  hostCity: string;
  hostRecord: { wins: number; editions: number };
}

export function WinPct({ data, className = '' }: { data: WinProbabilityData; className?: string }) {
  const philly = Math.round(data.philly * 100);
  const dc = 100 - philly;
  const host = data.hostCity === 'dc' ? 'DC' : 'Philly';

  return (
    <div className={`border border-gray rounded-lg p-4 ${className}`}>
      <div className="flex items-baseline justify-between mb-3">
        <p className="font-serif text-lg text-blue">Win%</p>
        <p className="text-[10px] uppercase tracking-wide text-slate">presented by JustPark</p>
      </div>
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="font-serif text-3xl text-blue leading-none">{philly}%</p>
          <p className="text-xs text-slate mt-1">Team Philly</p>
        </div>
        <div className="text-right">
          <p className="font-serif text-3xl text-red-700 leading-none">{dc}%</p>
          <p className="text-xs text-slate mt-1">Team DC</p>
        </div>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray">
        <div className="bg-blue transition-all duration-700" style={{ width: `${philly}%` }} />
        <div className="bg-red-700 transition-all duration-700" style={{ width: `${dc}%` }} />
      </div>
      <p className="text-[11px] text-slate mt-3">
        {data.live ? 'Updated live from match results. ' : 'Pre-event odds. '}
        Built from past results; {host} hosts, and hosts have won {data.hostRecord.wins} of {data.hostRecord.editions} editions.
      </p>
    </div>
  );
}
