'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function fmt(n: number): string {
  const whole = Math.floor(n);
  return n - whole === 0.5 ? (whole > 0 ? `${whole}½` : '½') : `${n}`;
}

export function LiveScore({ year, className = '' }: { year: string; className?: string }) {
  const [score, setScore] = useState<{ philly: number | null; dc: number | null } | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch(`/api/scoring?year=${year}`, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (cancelled || !d) return;
          setScore(d.score);
          setActive(!!d.active);
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [year]);

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        {active && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            Live
          </span>
        )}
        {!active && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate">Score</span>
        )}
      </div>
      <p className="font-serif text-3xl text-black">
        <span className="text-base text-slate font-sans mr-2">Philly</span>
        {score?.philly != null ? fmt(score.philly) : '0'} &ndash; {score?.dc != null ? fmt(score.dc) : '0'}
        <span className="text-base text-slate font-sans ml-2">DC</span>
      </p>
      <Link
        href={`/events/${year}/scoring`}
        className="inline-flex items-center gap-2 mt-4 bg-blue text-white font-serif text-sm px-6 py-3 hover:opacity-90 transition-opacity"
      >
        Live Scoring &rarr;
      </Link>
    </div>
  );
}
