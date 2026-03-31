import { getTournamentByYear } from '@/lib/data';
import { MatchScoring } from '@/components/events/MatchScoring';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ScoringPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const tournament = await getTournamentByYear(year);

  if (!tournament) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <p className="text-slate">Event not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href={`/events/${year}`}
          className="text-sm text-blue hover:underline"
        >
          &larr; Back to {tournament.displayYear}
        </Link>
        <h1 className="font-serif text-3xl text-blue mt-4">
          Live Scoring — {tournament.displayYear}
        </h1>
        <p className="text-slate text-sm mt-1">
          {tournament.edition ? `${tournament.edition}${ordinal(tournament.edition)} Edition` : tournament.year}
        </p>
      </div>

      <MatchScoring year={year} />
    </div>
  );
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0];
}
