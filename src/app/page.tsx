import { getTournaments, getSeriesRecord } from '@/lib/data';
import { Hero } from '@/components/home/Hero';
import { SeriesRecordDisplay } from '@/components/home/SeriesRecord';
import { TournamentTimeline } from '@/components/home/TournamentTimeline';
import { QuickLinks } from '@/components/home/QuickLinks';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { SectionHeading } from '@/components/ui/SectionHeading';

export default async function Home() {
  const [tournaments, seriesRecord] = await Promise.all([
    getTournaments(),
    getSeriesRecord(),
  ]);

  const current = [...tournaments].reverse().find((t) => !t.champion) ?? null;

  return (
    <>
      <Hero current={current} />

      <div id="series" className="scroll-mt-20">
        <SeriesRecordDisplay record={seriesRecord} />
      </div>

      <GoldDivider />

      <div className="max-w-5xl mx-auto px-4 pt-12">
        <SectionHeading
          title="Tournament History"
          subtitle="Ten Editions and Counting"
        />
      </div>
      <TournamentTimeline tournaments={tournaments} />

      <GoldDivider />

      <div className="max-w-5xl mx-auto px-4 pt-12">
        <SectionHeading title="Explore" subtitle="Dive Deeper" />
      </div>
      <QuickLinks />

    </>
  );
}
