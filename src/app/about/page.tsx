import type { Metadata } from 'next';
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
      {/* Page Header */}
      <section className="pt-16 pb-10 px-4">
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
            The Founding Fathers Invitational began in the spring of 2018 as a
            friendly rivalry between a group of college friends split between
            Philadelphia and Washington, DC. What started as a casual challenge
            match at Applebrook Golf Club has grown into a full-fledged annual
            tournament — complete with programs, trophies, awards, and traditions
            that would make the Ryder Cup jealous.
          </p>
        </div>
      </section>

      {/* Format */}
      <section className="py-12 px-4 border-b border-gray">
        <div className="max-w-3xl mx-auto">
          <SectionHeading title="Format" />
          <p className="mt-4 text-black font-sans leading-relaxed">
            The FFI is a team match-play event between 8-player squads
            representing Team Philly and Team DC. The format varies each year at
            the Captain&apos;s discretion, and has included fourball, foursomes,
            singles, alternate shot, and even a three-club challenge exhibition.
            The host city alternates annually — Philadelphia hosts odd-numbered
            editions, DC hosts even-numbered.
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
                Each year features a professionally produced tournament program
                packed with matchup writeups, course guides, satirical
                commentary, player profiles, and enough footnotes to rival a
                legal brief.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-black font-normal">
                Apparel Gifts
              </h3>
              <p className="mt-2 text-slate font-sans leading-relaxed">
                Players receive custom apparel each year, from Peter Millar
                vests to team polos.
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
                Awarded to the best player on the winning team.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-black font-normal">
                Pat Shanahan Award
              </h3>
              <p className="mt-2 text-slate font-sans leading-relaxed">
                Named after Pat Shanahan, this award honors the best player on
                the losing team — a recognition that excellence doesn&apos;t
                always result in victory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Rotation */}
      <section className="py-12 px-4 border-b border-gray">
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
