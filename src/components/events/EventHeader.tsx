import Image from 'next/image';
import type { TournamentDetail, Course } from '@/types';
import { toEdition } from '@/lib/utils';

const courseLogoMap: Record<string, string> = {
  'Applebrook Golf Club': '/images/courses/applebrook.png',
  'Aronimink Golf Club': '/images/courses/aronimink.svg',
  'Columbia Country Club': '/images/courses/columbia.jpg',
  'Chevy Chase Club': '/images/courses/chevychase.png',
  'Farmington Country Club': '/images/courses/farmington.jpg',
  'Gulph Mills Golf Club': '/images/courses/gulphmills.jpg',
};

export function EventHeader({
  tournament,
  bannerSrc,
  bannerPosition,
  courseDetails,
  programDocs = [],
}: {
  tournament: TournamentDetail;
  bannerSrc?: string;
  bannerPosition?: string;
  courseDetails: Course[];
  programDocs?: { label: string; href: string }[];
}) {
  const t = tournament;
  const cityLabel =
    t.hostCity === 'philly'
      ? 'Philadelphia'
      : t.hostCity === 'dc'
        ? 'Washington, DC'
        : t.hostCity;

  const details: { label: string; value: string }[] = [];
  if (t.dateDisplay) details.push({ label: 'Date', value: t.dateDisplay });
  if (t.mvpName) details.push({ label: 'MVP', value: t.mvpName });
  if (t.patShanahanAwardName)
    details.push({ label: 'Pat Shanahan Award', value: t.patShanahanAwardName });
  if (t.entryFee) details.push({ label: 'Entry Fee', value: `$${t.entryFee}` });
  if (t.prizePool)
    details.push({ label: 'Prize Pool', value: `$${t.prizePool.toLocaleString()}` });

  return (
    <section>
      {/* Banner image */}
      {bannerSrc && (
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <Image
            src={bannerSrc}
            alt={`FFI ${toEdition(t.edition)} — ${t.displayYear}`}
            fill
            className="object-cover"
            style={bannerPosition ? { objectPosition: bannerPosition } : undefined}
            sizes="100vw"
            priority
          />
          {/* Dark gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {/* Edition title over the banner */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-6">
            <div className="max-w-5xl mx-auto">
              <h1 className="font-serif text-3xl md:text-5xl text-white font-normal drop-shadow-lg">
                {toEdition(t.edition)} &mdash; {t.displayYear}
              </h1>
              <p className="text-white/80 mt-1 text-lg drop-shadow">{cityLabel}</p>
            </div>
          </div>
        </div>
      )}

      <div className="pt-6 pb-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:gap-12">
          {/* Left column — scores, courses, details */}
          <div className="flex-1 min-w-0">
            {/* Fallback title when no banner */}
            {!bannerSrc && (
              <>
                <h1 className="font-serif text-4xl md:text-5xl text-blue font-normal">
                  {toEdition(t.edition)} &mdash; {t.displayYear}
                </h1>
                <p className="text-slate mt-2 text-lg">{cityLabel}</p>
              </>
            )}

            {t.scorePhilly !== null && t.scoreDC !== null ? (
              <div className={bannerSrc ? '' : 'mt-8'}>
                <p className="font-serif text-2xl text-black">
                  {t.hostCity === 'philly' ? t.scorePhilly : t.scoreDC} &mdash;{' '}
                  {t.hostCity === 'philly' ? t.scoreDC : t.scorePhilly}
                </p>
                <p className="text-slate text-xs mt-1">
                  {t.hostCity === 'philly' ? 'Philly' : 'DC'} (home) &ndash;{' '}
                  {t.hostCity === 'philly' ? 'DC' : 'Philly'} (away)
                </p>
                {t.champion && (
                  <p className="text-slate mt-1">
                    Champion: {t.champion === 'philly' ? 'Team Philly' : 'Team DC'}
                  </p>
                )}
              </div>
            ) : (
              <p className={`text-slate italic ${bannerSrc ? '' : 'mt-8'}`}>Results TBD</p>
            )}

            {/* Courses */}
            {courseDetails.length > 0 && (
              <div className="mt-8">
                <h2 className="font-serif text-lg text-blue font-normal mb-4">
                  {courseDetails.length === 1 ? 'Course' : 'Courses'}
                </h2>
                <div className="space-y-3">
                  {courseDetails.map((course) => {
                    const logoSrc = courseLogoMap[course.name];
                    return (
                      <div
                        key={course.name}
                        className="flex items-center gap-4 py-3 border-b border-gray"
                      >
                        {logoSrc && (
                          <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                            <Image
                              src={logoSrc}
                              alt={`${course.name} logo`}
                              fill
                              className="object-contain p-0.5"
                              sizes="40px"
                              unoptimized
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-black text-sm font-medium">{course.name}</p>
                          <p className="text-slate text-xs">{course.location}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {details.length > 0 && (
              <div className="mt-8">
                {details.map((d) => (
                  <div
                    key={d.label}
                    className="flex items-center justify-between py-3 border-b border-gray"
                  >
                    <span className="text-slate text-sm">{d.label}</span>
                    <span className="text-black text-sm">{d.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column — program / welcome letter */}
          {programDocs.length > 0 && (
            <div className="mt-8 md:mt-0 md:w-64 shrink-0">
              <h2 className="font-serif text-lg text-blue font-normal mb-4">Documents</h2>
              <div className="space-y-3">
                {programDocs.map((doc) => (
                  <a
                    key={doc.href}
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray hover:border-blue/30 hover:bg-blue/5 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-blue shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                    <span className="text-sm text-blue">{doc.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
