export interface WinProbabilityData {
  philly: number;
  dc: number;
  live: boolean;
  score: { philly: number; dc: number };
  projected: { philly: number; dc: number };
  hostCity: string;
  hostRecord: { wins: number; editions: number };
}

const condensed = { fontFamily: 'var(--font-condensed), Impact, sans-serif' };

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <div
      className={`shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-2xl ${className}`}
      style={condensed}
    >
      {label}
    </div>
  );
}

export function WinPct({ data, className = '' }: { data: WinProbabilityData; className?: string }) {
  const philly = Math.round(data.philly * 100);
  const dc = 100 - philly;
  const host = data.hostCity === 'dc' ? 'DC' : 'Philly';

  return (
    <div className={`bg-white border border-gray rounded-2xl shadow-sm px-4 sm:px-6 pt-5 pb-4 ${className}`}>
      <div className="flex items-start justify-between uppercase text-black text-lg sm:text-xl tracking-wide font-bold" style={condensed}>
        <span>Team Philly</span>
        <span>Team DC</span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Badge label="PHL" className="bg-blue" />
          <div>
            <p className="text-4xl sm:text-6xl leading-none text-[#262833] font-bold" style={condensed}>
              {data.score.philly.toFixed(1)}
            </p>
            <p className="text-lg sm:text-2xl leading-tight text-red-700 font-semibold" style={condensed} title="Projected final points">
              {data.projected.philly.toFixed(1)}
              <span className="text-[10px] sm:text-xs ml-1 uppercase tracking-wide">proj</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-row-reverse">
          <Badge label="DC" className="bg-red-700" />
          <div className="text-right">
            <p className="text-4xl sm:text-6xl leading-none text-[#262833] font-bold" style={condensed}>
              {data.score.dc.toFixed(1)}
            </p>
            <p className="text-lg sm:text-2xl leading-tight text-red-700 font-semibold" style={condensed} title="Projected final points">
              {data.projected.dc.toFixed(1)}
              <span className="text-[10px] sm:text-xs ml-1 uppercase tracking-wide">proj</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-xl sm:text-2xl text-slate font-bold w-12 text-left" style={condensed}>
          {philly}%
        </span>
        <div className="flex-1 h-3.5 rounded-full bg-[#f3f4f6] border border-gray overflow-hidden">
          <div className="h-full rounded-full bg-blue transition-all duration-700" style={{ width: `${philly}%` }} />
        </div>
        <span className="text-xl sm:text-2xl text-slate font-bold w-12 text-right" style={condensed}>
          {dc}%
        </span>
      </div>

      <p className="mt-2 text-center text-slate text-base sm:text-lg">
        Win% presented by <span className="font-bold text-blue">JustPark</span>
      </p>
      <p className="text-center text-[11px] text-slate/80 mt-1">
        {data.live ? 'Live from match results. ' : 'Pre-event odds. '}
        Based on past results; {host} hosts, and hosts have won {data.hostRecord.wins} of {data.hostRecord.editions} editions.
      </p>
    </div>
  );
}
