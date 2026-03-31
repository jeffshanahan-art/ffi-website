export const dynamic = 'force-dynamic';

import { getTournamentByYear, getTournaments, getCourses, getPhotosByYear } from '@/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { EventHeader } from '@/components/events/EventHeader';
import { EventWeather } from '@/components/events/EventWeather';
import { EventRosters } from '@/components/events/EventRosters';
import { EventPairings } from '@/components/events/EventPairings';
import { EventSchedule } from '@/components/events/EventSchedule';
import { EventPhotos } from '@/components/events/EventPhotos';
import { EventNotes } from '@/components/events/EventNotes';
import { toEdition } from '@/lib/utils';

export async function generateStaticParams() {
  const tournaments = await getTournaments();
  return tournaments.map((t) => ({ year: t.year }));
}

export async function generateMetadata(props: { params: Promise<{ year: string }> }): Promise<Metadata> {
  const { year } = await props.params;
  const tournament = await getTournamentByYear(year);
  if (!tournament) return { title: 'Tournament Not Found' };
  return {
    title: `FFI ${toEdition(tournament.edition)} — ${tournament.displayYear}`,
    description: `Details for the FFI ${toEdition(tournament.edition)} (${tournament.displayYear}) hosted in ${tournament.hostCity === 'philly' ? 'Philadelphia' : 'Washington, DC'}.`,
  };
}

export default async function EventPage(props: { params: Promise<{ year: string }> }) {
  const { year } = await props.params;
  const tournament = await getTournamentByYear(year);
  if (!tournament) notFound();

  // Get all tournaments to determine prev/next
  const tournaments = await getTournaments();
  const currentIndex = tournaments.findIndex((t) => t.year === year);
  const prev = currentIndex > 0 ? tournaments[currentIndex - 1] : null;
  const next = currentIndex < tournaments.length - 1 ? tournaments[currentIndex + 1] : null;

  // Pick banner photo for this edition
  const photos = await getPhotosByYear(year);

  // Use admin-configured banner, fall back to legacy hardcoded map, then first photo
  const legacyBannerMap: Record<string, string> = {
    'S2018': 's2018_2', 'F2018': 'f2018_4', '2019': '2019_7', '2020': '2020_2',
    '2021': '2021_12', '2022': '2022_3', '2023': '2023_9', '2024': '2024_3', '2025': '2025_1',
  };
  const preferredId = tournament.bannerPhotoId || legacyBannerMap[year];
  const bannerPhoto = photos.find((p) => p.id === preferredId) || photos[0] || null;

  // Use admin-configured position, fall back to legacy map
  const legacyPositionMap: Record<string, string> = {
    'S2018': 'center 30%', '2019': 'center 25%', '2021': 'center 70%', '2024': 'center 70%',
  };
  const bannerPosition = tournament.bannerPosition || legacyPositionMap[year];

  // Program / welcome letter for this edition
  const programMap: Record<string, { label: string; href: string }[]> = {
    '2025': [{ label: 'Welcome Letter', href: '/programs/welcome-letter-2025.pdf' }],
    '2024': [{ label: 'Tournament Program', href: '/programs/program-2024.pdf' }],
    '2023': [{ label: 'Welcome Letter', href: '/programs/welcome-letter-2023.pdf' }],
    '2022': [{ label: 'Tournament Program', href: '/programs/program-2022.pdf' }],
    '2021': [
      { label: 'Welcome Letter', href: '/programs/welcome-letter-2021.pdf' },
      { label: 'Press Release', href: '/programs/FFI%20Team%20DC%20PR%20(10122021)_vFINAL.pdf' },
    ],
    '2020': [{ label: 'Welcome Letter', href: '/programs/welcome-letter-2020.pdf' }],
    '2019': [{ label: 'Welcome Letter', href: '/programs/welcome-letter-2019.pdf' }],
  };
  const programDocs = programMap[year] || [];

  // Get course details with location info
  const allCourses = await getCourses();
  const courseDetails = tournament.courses.map((name) => {
    const found = allCourses.find((c) => c.name === name);
    return found || { name, location: '', city: tournament.hostCity as 'philly' | 'dc' };
  });

  return (
    <main className="min-h-screen">
      {/* Back link */}
      <div className="px-4 pt-6">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/"
            className="font-serif text-blue hover:opacity-70 text-sm transition-opacity inline-flex items-center gap-1"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>

      <EventHeader tournament={tournament} bannerSrc={bannerPhoto?.src} bannerPosition={bannerPosition} courseDetails={courseDetails} programDocs={programDocs} />

      {/* Edition navigation (top) */}
      <nav className="px-4 py-3 border-b border-gray">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {prev ? (
            <Link
              href={`/events/${prev.year}`}
              className="font-serif text-blue hover:opacity-70 transition-opacity text-sm"
            >
              &larr; {prev.displayYear}
            </Link>
          ) : (
            <span />
          )}
          <Link
            href="/"
            className="font-serif text-blue hover:opacity-70 transition-opacity text-sm"
          >
            All Editions
          </Link>
          {next ? (
            <Link
              href={`/events/${next.year}`}
              className="font-serif text-blue hover:opacity-70 transition-opacity text-sm"
            >
              {next.displayYear} &rarr;
            </Link>
          ) : (
            <span />
          )}
        </div>
      </nav>

      <EventNotes notes={tournament.notes} />

      <EventWeather weather={tournament.weather} />

      <EventRosters teamPhilly={tournament.teamPhilly} teamDC={tournament.teamDC} />

      <EventPairings tournament={tournament} />

      {tournament.dates && tournament.dates.length > 0 && tournament.matches && tournament.matches.length > 0 && (
        <section className="px-4 pb-6">
          <div className="max-w-5xl mx-auto">
            <Link
              href={`/events/${year}/scoring`}
              className="inline-flex items-center gap-2 bg-blue text-white font-serif text-sm px-6 py-3 hover:opacity-90 transition-opacity"
            >
              Live Scoring &rarr;
            </Link>
          </div>
        </section>
      )}

      <EventSchedule schedule={tournament.schedule} />

      <EventPhotos year={year} />

      {/* Edition navigation */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="border-t border-gray" />
      </div>
      <nav className="py-10 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {prev ? (
            <Link
              href={`/events/${prev.year}`}
              className="font-serif text-blue hover:opacity-70 transition-opacity text-sm"
            >
              &larr; {prev.displayYear}
            </Link>
          ) : (
            <span />
          )}
          <Link
            href="/"
            className="font-serif text-blue hover:opacity-70 transition-opacity text-sm"
          >
            All Editions
          </Link>
          {next ? (
            <Link
              href={`/events/${next.year}`}
              className="font-serif text-blue hover:opacity-70 transition-opacity text-sm"
            >
              {next.displayYear} &rarr;
            </Link>
          ) : (
            <span />
          )}
        </div>
      </nav>
    </main>
  );
}
