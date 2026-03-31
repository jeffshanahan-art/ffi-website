'use client';

import { useState, useEffect, useCallback } from 'react';

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

export function MatchScoring({ year }: { year: string }) {
  const [matches, setMatches] = useState<any[]>([]);
  const [eventScore, setEventScore] = useState<{ philly: number | null; dc: number | null }>({
    philly: null,
    dc: null,
  });
  const [active, setActive] = useState(false);
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (!active) {
    const dateStrings = dates.map((d) =>
      new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    );
    return (
      <div className="text-center text-slate py-12">
        <p className="text-lg">Scoring is not active yet.</p>
        <p className="text-sm mt-2">
          Scoring opens on{' '}
          <span className="font-medium text-black">
            {dateStrings.join(' and ')}
          </span>
        </p>
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
      {/* Running total */}
      <div className="flex items-center justify-center gap-8 py-4 bg-gray/20 rounded-lg">
        <div className="text-right">
          <p className="text-slate text-xs uppercase">Philly</p>
          <p className="font-serif text-3xl text-blue">
            {eventScore.philly != null ? fmt(eventScore.philly) : '—'}
          </p>
        </div>
        <div className="text-slate font-serif text-2xl">—</div>
        <div className="text-left">
          <p className="text-slate text-xs uppercase">DC</p>
          <p className="font-serif text-3xl text-blue">
            {eventScore.dc != null ? fmt(eventScore.dc) : '—'}
          </p>
        </div>
      </div>

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
                  <div key={pi} className="border border-gray rounded-lg p-4">
                    {/* Players */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-black">
                        {pairing.philly?.join(' & ')}
                      </span>
                      <span className="text-xs text-slate px-2">vs</span>
                      <span className="text-sm font-medium text-black">
                        {pairing.dc?.join(' & ')}
                      </span>
                    </div>

                    {/* Score entry */}
                    <div className="space-y-2">
                      {is18 ? (
                        <>
                          <ResultRadio
                            label={`Front (${fmt(match.pointValues?.front || 0)} pt)`}
                            value={r.front}
                            onChange={(v) =>
                              setResults((prev) => new Map(prev).set(key, { ...r, front: v }))
                            }
                            disabled={isBusy}
                          />
                          <ResultRadio
                            label={`Back (${fmt(match.pointValues?.back || 0)} pt)`}
                            value={r.back}
                            onChange={(v) =>
                              setResults((prev) => new Map(prev).set(key, { ...r, back: v }))
                            }
                            disabled={isBusy}
                          />
                          <ResultRadio
                            label={`Overall (${fmt(match.pointValues?.overall || 0)} pt)`}
                            value={r.overall}
                            onChange={(v) =>
                              setResults((prev) => new Map(prev).set(key, { ...r, overall: v }))
                            }
                            disabled={isBusy}
                          />
                        </>
                      ) : (
                        <ResultRadio
                          label={`Total (${fmt(match.pointValues?.total || 0)} pt)`}
                          value={r.total}
                          onChange={(v) =>
                            setResults((prev) => new Map(prev).set(key, { ...r, total: v }))
                          }
                          disabled={isBusy}
                        />
                      )}
                    </div>

                    {/* Submit */}
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isBusy}
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
