export function TeamPairs({ teamPairs }: { teamPairs: { philly: string[][]; dc: string[][] } }) {
  const col = (title: string, color: string, pairs: string[][]) => (
    <div className="flex-1 min-w-0">
      <p className={`text-xs uppercase tracking-wide font-semibold mb-2 ${color}`}>{title}</p>
      <ul className="space-y-1">
        {pairs.map((p, i) => (
          <li key={i} className="text-sm text-black">
            {p.join(' & ')}
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
