import { getPhotosByYear, getTournamentByYear } from '@/lib/data';
import { EventPhotoGallery } from './EventPhotoGallery';

export async function EventPhotos({ year }: { year: string }) {
  const [photos, tournament] = await Promise.all([
    getPhotosByYear(year),
    getTournamentByYear(year),
  ]);

  const displayYear = tournament?.displayYear || year;

  return (
    <section className="py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-serif text-2xl text-blue font-normal border-b border-gray pb-3 mb-6">
          Photos
        </h2>
        <EventPhotoGallery
          initialPhotos={photos}
          year={year}
          displayYear={displayYear}
        />
      </div>
    </section>
  );
}
