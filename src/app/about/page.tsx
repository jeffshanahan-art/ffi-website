import type { Metadata } from 'next';
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getCourses } from '@/lib/data';

export const metadata: Metadata = {
  title: 'About the FFI | Founding Fathers Invitational',
  description:
    'The history, traditions, and format of the Founding Fathers Invitational golf tournament. Team Philly vs Team DC since 2018.',
};

export default async function AboutPage() {
  const courses = await getCourses();

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      <div className="max-w-5xl mx-auto pt-8 px-4">
        <div className="w-full overflow-hidden rounded-lg">
          <Image
            src="/images/hero-2019.jpeg"
            alt="Captains holding the Founding Fathers Invitational trophy — 2019"
            width={768}
            height={560}
            className="w-full h-auto object-cover"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* Page Header */}
      <section className="pt-10 pb-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-blue font-normal">
            About the FFI
          </h1>
        </div>
      </section>

      {/* Origin Story */}
      <section className="pb-12 px-4 border-b border-gray">
        <div className="max-w-3xl mx-auto">
          <SectionHeading title="Origin Story" />
          <p className="mt-4 text-black font-sans leading-relaxed">
            The Founding Fathers Invitational began in the spring of 2018 when
            Matt Hopkins and Jeff Shanahan — childhood friends since the 4th
            grade — and their respective groups of college and local friends,
            half rooted in the Philadelphia suburbs, half entrenched in
            Washington, DC, decided their annual golf outings needed stakes,
            structure, and eventually, a trophy. What followed was an arms race
            of escalating formality that no one asked for and no one has been
            able to stop. The inaugural edition — a two-course affair across
            Applebrook Golf Club and Aronimink Golf Club — ended in a 12–6 Team
            Philly victory. Team DC demanded a rematch within six months. They
            got one. Nine editions later, the FFI features professionally bound
            tournament programs complete with footnotes, corporate press releases
            announcing roster transactions, a pewter trophy whose authenticity
            has been tested by at least one MVP, a Director of Player Personnel
            who doubles as Co-Director of Apparel, and an expense collection
            process that has been described as both ruthless and inevitable.
          </p>
        </div>
      </section>

      {/* Format */}
      <section className="py-12 px-4 border-b border-gray">
        <div className="max-w-3xl mx-auto">
          <SectionHeading title="Format" />
          <p className="mt-4 text-black font-sans leading-relaxed">
            The FFI is a team match-play event between 8-player squads
            representing Team Philly and Team DC. The competition is played over
            36 holes, typically in a single day, with the format varying each
            year at the Host Captain&apos;s discretion. Past editions have
            featured fourball, foursomes, singles, and alternate shot. The host
            city typically arranges a practice round the day before, which has
            occasionally doubled as a one-day member-guest tournament.
          </p>
        </div>
      </section>

      {/* Traditions */}
      <section className="py-12 px-4 border-b border-gray">
        <div className="max-w-3xl mx-auto">
          <SectionHeading title="Traditions" />
          <div className="mt-6 space-y-8">
            <div>
              <h3 className="font-serif text-xl text-black font-normal">
                The Founding Fathers Cup
              </h3>
              <p className="mt-2 text-slate font-sans leading-relaxed">
                Officially known as the Founding Fathers Cup — also called
                &lsquo;The Goblet of Immortality&rsquo; and &lsquo;The Founders
                Cup of Pewter and Glory&rsquo; — the trophy is awarded to the
                winning team. In the event of a tie, the defending champion
                (Team DC per 2022 rules) retains the Cup.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-black font-normal">
                The Captain&apos;s Dinner
              </h3>
              <p className="mt-2 text-slate font-sans leading-relaxed">
                The night before competition, both teams gather for dinner,
                drinks, and the unveiling of pairings. Past venues have included
                Dutton&apos;s Barn, Casa De Hopkins, and the Everly&apos;s Barn.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-black font-normal">
                The Tournament Program
              </h3>
              <p className="mt-2 text-slate font-sans leading-relaxed">
                First produced for the 3rd Edition in 2019, the tournament
                program has become an annual institution. Each edition is packed
                with matchup writeups, course guides, player profiles,
                hole-by-hole scouting reports, and commentary that ranges from
                insightful to cruel. Both teams have taken turns producing the
                program, and authorship is taken seriously.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-black font-normal">
                Host Gift
              </h3>
              <p className="mt-2 text-slate font-sans leading-relaxed">
                Players receive custom gifts each year that are selected by the
                host team. Selections have included team polos, quarter-zips
                (since retired by popular demand), water color course paintings
                and — as of the 9th Edition — Peter Millar vests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-12 px-4 border-b border-gray">
        <div className="max-w-3xl mx-auto">
          <SectionHeading title="Awards" />
          <div className="mt-6 space-y-8">
            <div>
              <h3 className="font-serif text-xl text-black font-normal">
                MVP Award
              </h3>
              <p className="mt-2 text-slate font-sans leading-relaxed">
                Awarded to the outstanding player on the winning team.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-black font-normal">
                Pat Shanahan Award
              </h3>
              <p className="mt-2 text-slate font-sans leading-relaxed">
                Named after Pat Shanahan — Team Philly&apos;s Vice Captain, 1st
                Edition MVP, and the man who once emergency-purchased BioFreeze
                at Wegmans after tweaking his neck on a morning run — this award
                honors the best player on the losing team. A recognition that
                excellence doesn&apos;t always result in victory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Rotation */}
      <section id="course-rotation" className="py-12 px-4 border-b border-gray scroll-mt-[69px]">
        <div className="max-w-3xl mx-auto">
          <SectionHeading title="Course Rotation" />
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="border-b border-gray">
                  <th className="pb-3 pr-6 text-sm font-medium text-slate uppercase tracking-wide">
                    Course Name
                  </th>
                  <th className="pb-3 pr-6 text-sm font-medium text-slate uppercase tracking-wide">
                    Location
                  </th>
                  <th className="pb-3 text-sm font-medium text-slate uppercase tracking-wide">
                    City
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.name} className="border-b border-gray">
                    <td className="py-3 pr-6 text-black">{course.name}</td>
                    <td className="py-3 pr-6 text-slate">{course.location}</td>
                    <td className="py-3 text-slate">
                      {course.city === 'philly' ? 'Philadelphia' : 'DC'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Closing Tagline */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-serif text-xl md:text-2xl text-black italic">
            &ldquo;Play well gentlemen. Don&apos;t forget to enjoy the
            walk.&rdquo;
          </p>
        </div>
      </section>
    </div>
  );
}
