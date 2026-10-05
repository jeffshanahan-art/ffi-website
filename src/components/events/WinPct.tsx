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
      className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg ${className}`}
      style={condensed}
    >
      {label}
    </div>
  );
}

export function WinPct({ data, className = '' }: { data: WinProbabilityData; className?: string }) {
  const philly = Math.round(data.philly * 100);
  const dc = 100 - philly;

  return (
    <div className={`bg-white border border-gray rounded-xl shadow-sm px-4 pt-3 pb-3 w-full sm:max-w-md ${className}`}>
      <div className="flex items-start justify-between uppercase text-black text-base tracking-wide font-bold" style={condensed}>
        <span>Team Philly</span>
        <span>Team DC</span>
      </div>

      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Badge label="PHL" className="bg-blue" />
          <div>
            <p className="text-3xl sm:text-4xl leading-none text-[#262833] font-bold" style={condensed}>
              {data.score.philly.toFixed(1)}
            </p>
            <p className="text-base sm:text-lg leading-tight text-red-700 font-semibold" style={condensed} title="Projected final points">
              {data.projected.philly.toFixed(1)}
              <span className="text-[10px] ml-1 uppercase tracking-wide">proj</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-row-reverse">
          <Badge label="DC" className="bg-red-700" />
          <div className="text-right">
            <p className="text-3xl sm:text-4xl leading-none text-[#262833] font-bold" style={condensed}>
              {data.score.dc.toFixed(1)}
            </p>
            <p className="text-base sm:text-lg leading-tight text-red-700 font-semibold" style={condensed} title="Projected final points">
              {data.projected.dc.toFixed(1)}
              <span className="text-[10px] ml-1 uppercase tracking-wide">proj</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <span className="text-lg text-slate font-bold w-10 text-left" style={condensed}>
          {philly}%
        </span>
        <div className="flex-1 h-2.5 rounded-full bg-[#f3f4f6] border border-gray overflow-hidden">
          <div className="h-full rounded-full bg-blue transition-all duration-700" style={{ width: `${philly}%` }} />
        </div>
        <span className="text-lg text-slate font-bold w-10 text-right" style={condensed}>
          {dc}%
        </span>
      </div>

      <div className="mt-2 flex items-center justify-center gap-2 text-slate text-sm">
        <span>Win% presented by</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/justpark-logo.png" alt="JustPark" className="h-4 w-auto" />
      </div>
    </div>
  );
}
