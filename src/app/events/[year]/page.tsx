export const dynamic = 'force-dynamic';

import fs from 'fs';
import path from 'path';
import { getTournamentByYear, getTournaments, getCourses } from '@/lib/data';
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
  let photos: { id: string; src: string; year: string }[] = [];
  try {
    const photosFile = path.join(process.cwd(), 'data', 'photos.json');
    const raw = fs.readFileSync(photosFile, 'utf-8');
    const allPhotos = JSON.parse(raw);
    photos = allPhotos.filter((p: any) => p.year === year);
  } catch {
    // photos.json may not exist yet
  }
  // Preferred banners per edition (hand-picked)
  const bannerMap: Record<string, string> = {
    'S2018': 's2018_2',
    'F2018': 'f2018_4',
    '2020': '2020_2',
    '2022': '2022_3',
    '2023': '2023_10',
    '2024': '2024_1',
    '2025': '2025_1',
  };
  const preferredId = bannerMap[year];
  const bannerPhoto = photos.find((p) => p.id === preferredId) || photos[0] || null;

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

      <EventHeader tournament={tournament} bannerSrc={bannerPhoto?.src} courseDetails={courseDetails} />

      <EventNotes notes={tournament.notes} />

      <EventWeather weather={tournament.weather} />

      <EventRosters teamPhilly={tournament.teamPhilly} teamDC={tournament.teamDC} />

      <EventPairings tournament={tournament} />

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
