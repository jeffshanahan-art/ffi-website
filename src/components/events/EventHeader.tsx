import type { TournamentDetail } from '@/types';
import { toEdition } from '@/lib/utils';

export function EventHeader({ tournament }: { tournament: TournamentDetail }) {
  const t = tournament;
  const cityLabel = t.hostCity === 'philly' ? 'Philadelphia' : t.hostCity === 'dc' ? 'Washington, DC' : t.hostCity;

  const details: { label: string; value: string }[] = [];
  if (t.dateStart) details.push({ label: 'Date', value: t.dateStart });
  if (t.mvpName) details.push({ label: 'MVP', value: t.mvpName });
  if (t.patShanahanAwardName) details.push({ label: 'Pat Shanahan Award', value: t.patShanahanAwardName });
  if (t.entryFee) details.push({ label: 'Entry Fee', value: `$${t.entryFee}` });
  if (t.prizePool) details.push({ label: 'Prize Pool', value: `$${t.prizePool.toLocaleString()}` });

  return (
    <section className="pt-10 pb-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl text-blue font-normal">
          {toEdition(t.edition)} &mdash; {t.displayYear}
        </h1>
        <p className="text-slate mt-2 text-lg">{cityLabel}</p>

        {t.scorePhilly !== null && t.scoreDC !== null ? (
          <div className="mt-8">
            <p className="font-serif text-2xl text-black">
              {t.hostCity === 'philly' ? t.scorePhilly : t.scoreDC} &mdash; {t.hostCity === 'philly' ? t.scoreDC : t.scorePhilly}
            </p>
            <p className="text-slate text-xs mt-1">
              {t.hostCity === 'philly' ? 'Philly' : 'DC'} (home) &ndash; {t.hostCity === 'philly' ? 'DC' : 'Philly'} (away)
            </p>
            {t.champion && (
              <p className="text-slate mt-1">
                Champion: {t.champion === 'philly' ? 'Team Philly' : 'Team DC'}
              </p>
            )}
          </div>
        ) : (
          <p className="text-slate italic mt-8">Results TBD</p>
        )}

        {details.length > 0 && (
          <div className="mt-8">
            {details.map((d) => (
              <div
                key={d.label}
                className="flex items-center justify-between py-3 border-b border-gray"
              >
                <span className="text-slate text-sm">{d.label}</span>
                <span className="text-black text-sm">{d.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
