import type { SeriesRecord } from '@/types';

export function SeriesRecordDisplay({ record }: { record: SeriesRecord }) {
  return (
    <section className="pt-2 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-blue font-normal pb-3 border-b border-[#e0e0e0]">
          The Series
        </h2>

        <div className="mt-10 flex items-center justify-center gap-8 md:gap-16">
          <div className="text-right">
            <p className="text-slate text-sm mb-2">Team Philly</p>
            <p className="font-serif text-4xl md:text-5xl text-blue">{record.phillyWins}</p>
          </div>

          <div className="text-slate font-serif text-3xl md:text-4xl">&mdash;</div>

          <div className="text-left">
            <p className="text-slate text-sm mb-2">Team DC</p>
            <p className="font-serif text-4xl md:text-5xl text-blue">{record.dcWins}</p>
          </div>
        </div>

        {record.pending.length > 0 && (
          <p className="mt-6 text-center text-slate text-sm italic">
            {record.pending.join(' & ')} Results Pending
          </p>
        )}
      </div>
    </section>
  );
}
