export function PairingWinPct({
  winPct,
  scored,
  placeholder = false,
}: {
  winPct?: { philly: number; dc: number };
  scored: boolean;
  placeholder?: boolean;
}) {
  if (scored || (!winPct && !placeholder)) return null;
  const philly = winPct ? Math.round(winPct.philly * 100) : 50;
  const dc = 100 - philly;
  return (
    <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-slate">
      <span className="font-semibold text-blue">{philly}%</span>
      <div className="flex h-1.5 w-24 overflow-hidden rounded-full bg-gray">
        <div className="bg-blue" style={{ width: `${philly}%` }} />
        <div className="bg-red-700" style={{ width: `${dc}%` }} />
      </div>
      <span className="font-semibold text-red-700">{dc}%</span>
      <span className="uppercase tracking-wide text-[10px]">Win%</span>
    </div>
  );
}
