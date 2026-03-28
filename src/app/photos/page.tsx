import { getPhotos, getTournaments } from '@/lib/data';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PhotoGallery } from '@/components/photos/PhotoGallery';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photos — FFI',
  description: 'Tournament photos from every edition of the Founding Fathers Invitational.',
};

export const dynamic = 'force-dynamic';

export default async function PhotosPage() {
  const [photos, tournaments] = await Promise.all([
    getPhotos(),
    getTournaments(),
  ]);

  // All edition options (for upload picker)
  const allYearOptions = tournaments.map((t) => ({
    value: t.year,
    label: t.displayYear,
  }));

  // Only editions with photos (for filter tabs)
  const yearsWithPhotos = [...new Set(photos.map((p) => p.year))];
  const yearOptions = allYearOptions.filter((y) => yearsWithPhotos.includes(y.value));

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <SectionHeading
          title="Photos"
          subtitle={`${photos.length} photos across ${yearsWithPhotos.length} editions`}
        />
        <div className="border-b border-gray mt-6" />
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <PhotoGallery
          photos={photos}
          yearOptions={yearOptions}
          allYearOptions={allYearOptions}
        />
      </div>
    </main>
  );
}
