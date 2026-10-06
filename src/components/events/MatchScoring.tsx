'use client';

import { useState, useEffect, useCallback } from 'react';
import { PairingWinPct } from './PairingWinPct';
import { WinPct, type WinProbabilityData } from './WinPct';

type Result = 'philly' | 'dc' | 'halved' | '';

interface PairingResults {
  front: Result;
  back: Result;
  overall: Result;
  total: Result;
}

function fmt(n: number): string {
  if (n === 0) return '0';
  const whole = Math.floor(n);
  const frac = n - whole;
  if (frac === 0) return `${whole}`;
  if (frac === 0.5) return whole > 0 ? `${whole}½` : '½';
  return n.toString();
}

function reverseFromScore(
  score: any,
  pointValues: any,
  is18: boolean
): PairingResults {
  if (!score) return { front: '', back: '', overall: '', total: '' };

  if (!is18) {
    const pTotal = pointValues?.total || 0;
    if (!pTotal) return { front: '', back: '', overall: '', total: '' };
    const phillyTotal = score.philly?.total ?? 0;
    if (phillyTotal === pTotal) return { front: '', back: '', overall: '', total: 'philly' };
    if (phillyTotal === 0) return { front: '', back: '', overall: '', total: 'dc' };
    return { front: '', back: '', overall: '', total: 'halved' };
  }

  function detect(phillyVal: number, maxVal: number): Result {
    if (!maxVal) return '';
    if (phillyVal === maxVal) return 'philly';
    if (phillyVal === 0) return 'dc';
    return 'halved';
  }

  return {
    front: detect(score.philly?.front ?? 0, pointValues?.front || 0),
    back: detect(score.philly?.back ?? 0, pointValues?.back || 0),
    overall: detect(score.philly?.overall ?? 0, pointValues?.overall || 0),
    total: '',
  };
}

function ResultRadio({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: Result;
  onChange: (v: Result) => void;
  disabled: boolean;
}) {
  const options: { val: Result; display: string }[] = [
    { val: 'philly', display: 'Philly' },
    { val: 'halved', display: 'Halved' },
    { val: 'dc', display: 'DC' },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate uppercase w-16 shrink-0">{label}</span>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.val}
            type="button"
            disabled={disabled}
            onClick={() => onChange(value === opt.val ? '' : opt.val)}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              value === opt.val
                ? opt.val === 'philly'
                  ? 'bg-blue text-white border-blue'
                  : opt.val === 'dc'
                    ? 'bg-red-700 text-white border-red-700'
                    : 'bg-slate text-white border-slate'
                : 'border-gray text-slate hover:border-blue disabled:hover:border-gray disabled:opacity-50'
            }`}
          >
            {opt.display}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReadOnlyResult({ pairing, is18 }: { pairing: any; is18: boolean }) {
  const score = pairing.score;
  if (!score) {
    return <p className="text-center text-xs text-slate italic">Not started</p>;
  }
  const label = (phillyVal: number | undefined, dcVal: number | undefined) => {
    const p = phillyVal ?? 0;
    const d = dcVal ?? 0;
    if (p === d) return p === 0 ? '—' : 'Halved';
    return p > d ? 'Philly' : 'DC';
  };
  return (
    <div className="text-center">
      <p className="text-sm font-semibold text-black">
        {fmt(score.philly?.total ?? 0)} – {fmt(score.dc?.total ?? 0)}
      </p>
      {is18 && score.philly?.front != null && (
        <p className="text-xs text-slate mt-1">
          Front: {label(score.philly.front, score.dc?.front)} · Back: {label(score.philly.back, score.dc?.back)} · Overall:{' '}
          {label(score.philly.overall, score.dc?.overall)}
        </p>
      )}
    </div>
  );
}

export function MatchScoring({ year }: { year: string }) {
  const [matches, setMatches] = useState<any[]>([]);
  const [eventScore, setEventScore] = useState<{ philly: number | null; dc: number | null }>({
    philly: null,
    dc: null,
  });
  const [active, setActive] = useState(false);
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [win, setWin] = useState<WinProbabilityData | null>(null);
  const [locked, setLocked] = useState(false);
  const [revealAt, setRevealAt] = useState<string | null>(null);
  const [results, setResults] = useState<Map<string, PairingResults>>(new Map());
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [messages, setMessages] = useState<Map<string, { ok: boolean; text: string }>>(new Map());

  const load = useCallback(async () => {
    const res = await fetch(`/api/scoring?year=${year}`);
    if (!res.ok) return;
    const data = await res.json();
    setMatches(data.matches || []);
    setEventScore(data.score || { philly: null, dc: null });
    setActive(data.active);
    setDates(data.dates || []);
    setWin(data.winProbability ?? null);
    setLocked(!!data.pairingsLocked);
    setRevealAt(data.pairingsRevealAt ?? null);

    // Initialize results from existing scores
    const initial = new Map<string, PairingResults>();
    (data.matches || []).forEach((m: any, ri: number) => {
      const is18 = m.holes === 18;
      (m.pairings || []).forEach((p: any, pi: number) => {
        const key = `${ri}-${pi}`;
        initial.set(key, reverseFromScore(p.score, m.pointValues, is18));
      });
    });
    setResults(initial);
    setLoading(false);
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetch('/api/auth')
      .then((r) => r.json())
      .then((d) => setIsAdmin(!!d.isAdmin))
      .catch(() => {});
  }, []);

  // Viewers get fresh scores without refreshing; admins are mid-entry, so don't clobber their selections.
  useEffect(() => {
    if (isAdmin) return;
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [isAdmin, load]);

  const submit = async (roundIndex: number, pairingIndex: number) => {
    const key = `${roundIndex}-${pairingIndex}`;
    const r = results.get(key);
    if (!r) return;

    setSubmitting(key);
    setMessages((prev) => { const n = new Map(prev); n.delete(key); return n; });

    const res = await fetch('/api/scoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year,
        roundIndex,
        pairingIndex,
        results: {
          ...(r.front ? { front: r.front } : {}),
          ...(r.back ? { back: r.back } : {}),
          ...(r.overall ? { overall: r.overall } : {}),
          ...(r.total ? { total: r.total } : {}),
        },
      }),
    });

    const data = await res.json();
    setSubmitting(null);

    if (res.ok) {
      setEventScore(data.eventScore);
      // Update the local match data with the new score
      setMatches((prev) =>
        prev.map((m, ri) =>
          ri === roundIndex
            ? {
                ...m,
                pairings: m.pairings.map((p: any, pi: number) =>
                  pi === pairingIndex ? { ...p, score: data.pairingScore } : p
                ),
              }
            : m
        )
      );
      setMessages((prev) => new Map(prev).set(key, { ok: true, text: 'Saved!' }));
    } else {
      setMessages((prev) => new Map(prev).set(key, { ok: false, text: data.error || 'Failed to save' }));
    }
  };

  if (loading) {
    return <div className="text-center text-slate py-12">Loading scoring…</div>;
  }

  if (!dates.length) {
    return (
      <div className="text-center text-slate py-12">
        <p>Event dates have not been set.</p>
        <p className="text-sm mt-2">An admin needs to configure the event dates first.</p>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="text-center text-slate py-12">
        No matches have been configured for this event.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!active && (
        <div className="text-center text-slate border border-gray rounded-lg py-4 px-4">
          <p className="font-medium text-black">Scoring is not active yet</p>
          <p className="text-sm mt-1">
            Live scoring opens on{' '}
            <span className="font-medium text-black">
              {dates
                .map((d) =>
                  new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })
                )
                .join(' and ')}
            </span>
            . Here are the matchups.
          </p>
        </div>
      )}

      {/* Running total */}
      <div className="flex items-center justify-center gap-8 py-4 bg-gray/20 rounded-lg">
        <div className="text-right">
          <p className="text-slate text-xs uppercase">Philly</p>
          <p className="font-serif text-3xl text-blue">
            {eventScore.philly != null ? fmt(eventScore.philly) : '0'}
          </p>
        </div>
        <div className="text-slate font-serif text-2xl">—</div>
        <div className="text-left">
          <p className="text-slate text-xs uppercase">DC</p>
          <p className="font-serif text-3xl text-blue">
            {eventScore.dc != null ? fmt(eventScore.dc) : '0'}
          </p>
        </div>
      </div>

      {win && <WinPct data={win} className="mx-auto" />}

      {locked && revealAt && (
        <div className="text-center border border-gray rounded-lg py-3 px-4">
          <p className="text-sm font-medium text-black">Matchups revealed at 9pm on Wednesday</p>
        </div>
      )}

      {/* Match rounds */}
      {matches.map((match: any, ri: number) => {
        const is18 = match.holes === 18;
        return (
          <div key={ri}>
            <div className="border-b border-gray pb-2 mb-4">
              <h3 className="font-serif text-lg text-blue">
                {match.name || match.type || `Round ${match.round || ri + 1}`}
              </h3>
              {match.course && <p className="text-slate text-sm">{match.course}</p>}
            </div>

            <div className="space-y-4">
              {match.pairings?.map((pairing: any, pi: number) => {
                const key = `${ri}-${pi}`;
                const r = results.get(key) || { front: '', back: '', overall: '', total: '' };
                const msg = messages.get(key);
                const isBusy = submitting === key;

                return (
                  <div key={pi} className={`border border-gray rounded-lg p-4 ${locked ? 'blur-sm select-none pointer-events-none' : ''}`} aria-hidden={locked}>
                    {/* Players */}
                    {pairing.featured && (
                      <p className="text-center text-[10px] uppercase tracking-wide text-blue font-semibold mb-2">
                        Featured Pairing
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-black">
                        {pairing.philly?.join(' & ')}
                      </span>
                      <span className="text-xs text-slate px-2">vs</span>
                      <span className="text-sm font-medium text-black text-right">
                        {pairing.dc?.join(' & ')}
                      </span>
                    </div>

                    <div className="-mt-2 mb-4">
                      <PairingWinPct winPct={pairing.winPct} scored={!!pairing.score} />
                    </div>

                    {!isAdmin && (
                      <ReadOnlyResult pairing={pairing} is18={is18} />
                    )}

                    {/* Score entry (admin only) */}
                    {isAdmin && (
                    <div className="space-y-2">
                      {is18 ? (
                        <>
                          <ResultRadio
                            label={`Front (${fmt(match.pointValues?.front || 0)} pt)`}
                            value={r.front}
                            onChange={(v) =>
                              setResults((prev) => new Map(prev).set(key, { ...r, front: v }))
                            }
                            disabled={isBusy || !active}
                          />
                          <ResultRadio
                            label={`Back (${fmt(match.pointValues?.back || 0)} pt)`}
                            value={r.back}
                            onChange={(v) =>
                              setResults((prev) => new Map(prev).set(key, { ...r, back: v }))
                            }
                            disabled={isBusy || !active}
                          />
                          <ResultRadio
                            label={`Overall (${fmt(match.pointValues?.overall || 0)} pt)`}
                            value={r.overall}
                            onChange={(v) =>
                              setResults((prev) => new Map(prev).set(key, { ...r, overall: v }))
                            }
                            disabled={isBusy || !active}
                          />
                        </>
                      ) : (
                        <ResultRadio
                          label={`Total (${fmt(match.pointValues?.total || 0)} pt)`}
                          value={r.total}
                          onChange={(v) =>
                            setResults((prev) => new Map(prev).set(key, { ...r, total: v }))
                          }
                          disabled={isBusy || !active}
                        />
                      )}
                    </div>
                    )}

                    {/* Submit */}
                    {isAdmin && (
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isBusy || !active}
                        onClick={() => submit(ri, pi)}
                        className="bg-blue text-white px-4 py-1.5 text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {isBusy ? 'Saving…' : 'Submit Score'}
                      </button>
                      {msg && (
                        <span className={`text-xs ${msg.ok ? 'text-green-700' : 'text-red-600'}`}>
                          {msg.text}
                        </span>
                      )}
                    </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
