import { fmtRec, type Rec } from '@/lib/records';

interface TeamPair {
  names: string[];
  record: Rec | null;
}

export function TeamPairs({ teamPairs }: { teamPairs: { philly: TeamPair[]; dc: TeamPair[] } }) {
  const col = (title: string, color: string, pairs: TeamPair[]) => (
    <div className="flex-1 min-w-0">
      <p className={`text-xs uppercase tracking-wide font-semibold mb-2 ${color}`}>{title}</p>
      <ul className="space-y-2">
        {pairs.map((p, i) => (
          <li key={i} className="text-sm text-black">
            {p.names.join(' & ')}
            {p.record && <span className="block text-xs text-slate">All-time pairing record: {fmtRec(p.record)}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="flex gap-6 mb-4 pb-4 border-b border-gray">
      {col('Team Philly partners', 'text-blue', teamPairs.philly)}
      {col('Team DC partners', 'text-red-700', teamPairs.dc)}
    </div>
  );
}
