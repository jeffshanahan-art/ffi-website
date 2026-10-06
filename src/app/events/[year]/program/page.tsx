import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getTournamentByYear } from '@/lib/data';
import { toEdition } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ProgramPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const tournament = await getTournamentByYear(year);
  if (!tournament || year !== '2026') notFound();

  if (tournament.programReleased) redirect(`/api/programs/${year}`);

  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-widest text-slate">
        {toEdition(tournament.edition)} &middot; {tournament.displayYear}
      </p>
      <h1 className="font-serif text-4xl md:text-5xl text-blue font-normal mt-4">Tournament Program</h1>
      <p className="font-serif text-2xl text-slate mt-6">Coming Soon&hellip;</p>
      <p className="text-slate mt-4">The program for this year&apos;s edition will be posted here shortly. Check back soon.</p>
      <Link
        href={`/events/${year}`}
        className="inline-block mt-10 bg-blue text-white font-serif text-sm px-6 py-3 hover:opacity-90 transition-opacity"
      >
        &larr; Back to the {toEdition(tournament.edition)}
      </Link>
    </div>
  );
}
