import Link from 'next/link';
import { getTournaments, getCourses, getSeriesRecord } from '@/lib/data';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { toOrdinal } from '@/lib/utils';
import type { Tournament, Course } from '@/types';

function getHostLabel(city: string): string {
  return city === 'philly' ? 'Philadelphia' : 'Washington, DC';
}

function getTeamLabel(team: string): string {
  return team === 'philly' ? 'Team Philly' : 'Team DC';
}

function getScore(t: Tournament): string {
  if (t.scorePhilly === null || t.scoreDC === null) return 'TBD';
  if (t.hostCity === 'philly') {
    return `${t.scorePhilly} \u2013 ${t.scoreDC}`;
  }
  return `${t.scoreDC} \u2013 ${t.scorePhilly}`;
}

function computeHomeAwayRecords(tournaments: Tournament[]) {
  let phillyHome = { wins: 0, losses: 0 };
  let phillyAway = { wins: 0, losses: 0 };
  let dcHome = { wins: 0, losses: 0 };
  let dcAway = { wins: 0, losses: 0 };

  for (const t of tournaments) {
    if (!t.champion) continue;
    if (t.hostCity === 'philly') {
      if (t.champion === 'philly') {
        phillyHome.wins++;
        dcAway.losses++;
      } else {
        phillyHome.losses++;
        dcAway.wins++;
      }
    } else {
      if (t.champion === 'dc') {
        dcHome.wins++;
        phillyAway.losses++;
      } else {
        dcHome.losses++;
        phillyAway.wins++;
      }
    }
  }

  return { phillyHome, phillyAway, dcHome, dcAway };
}

function buildCourseUsage(tournaments: Tournament[], courses: Course[]) {
  const usageMap = new Map<string, { course: Course; count: number }>();

  for (const c of courses) {
    usageMap.set(c.name, { course: c, count: 0 });
  }

  for (const t of tournaments) {
    for (const courseName of t.courses) {
      const existing = usageMap.get(courseName);
      if (existing) {
        existing.count++;
      } else {
        usageMap.set(courseName, {
          course: { name: courseName, location: '', city: t.hostCity },
          count: 1,
        });
      }
    }
  }

  return Array.from(usageMap.values())
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count || a.course.name.localeCompare(b.course.name));
}

export default async function HistoryPage() {
  const [tournaments, courses, seriesRecord] = await Promise.all([
    getTournaments(),
    getCourses(),
    getSeriesRecord(),
  ]);

  const homeAway = computeHomeAwayRecords(tournaments);
  const courseUsage = buildCourseUsage(tournaments, courses);
  const seriesLeader =
    seriesRecord.phillyWins > seriesRecord.dcWins
      ? 'Team Philly'
      : seriesRecord.dcWins > seriesRecord.phillyWins
        ? 'Team DC'
        : 'Tied';

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Page Header */}
      <h1 className="font-serif text-4xl md:text-5xl text-blue font-normal pb-4 border-b border-gray">
        History &amp; Records
      </h1>

      {/* Series Timeline */}
      <section className="mt-12">
        <SectionHeading
          title="Series Timeline"
          subtitle="Every Edition of the FFI"
        />

        {/* Mobile layout */}
        <div className="mt-6 sm:hidden border-t-2 border-black">
          <div className="grid grid-cols-[1fr_5rem_6rem] py-3 border-b border-black text-xs text-slate uppercase tracking-wider">
            <span>Year</span>
            <span className="text-right">Score</span>
            <span className="text-right">Champion</span>
          </div>

          {tournaments.map((t) => (
            <Link
              key={t.year}
              href={`/events/${t.year}`}
              className="grid grid-cols-[1fr_5rem_6rem] items-start py-4 border-b border-gray hover:bg-gray-light transition-colors"
            >
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-blue text-xs">{toOrdinal(t.edition)}</span>
                  <span className="font-serif text-base text-black">{t.displayYear}</span>
                </div>
                <p className="text-slate text-xs mt-0.5">{getHostLabel(t.hostCity)}</p>
              </div>
              <span className="text-right font-serif text-blue self-center">
                {t.scorePhilly !== null && t.scoreDC !== null
                  ? getScore(t)
                  : <span className="text-slate text-xs italic font-sans">TBD</span>}
              </span>
              <span className="text-right text-xs font-medium text-black self-center">
                {t.champion
                  ? getTeamLabel(t.champion)
                  : <span className="text-slate italic font-normal">TBD</span>}
              </span>
            </Link>
          ))}
        </div>

        {/* Desktop layout */}
        <div className="mt-6 hidden sm:block overflow-x-auto">
          <div className="grid grid-cols-[3rem_8rem_8rem_1fr_6rem_7rem_9rem] items-center py-3 border-b-2 border-black text-xs text-slate uppercase tracking-wider min-w-[750px]">
            <span />
            <span>Year</span>
            <span>Host City</span>
            <span>Courses</span>
            <span className="text-right">Score</span>
            <span className="text-right">Champion</span>
            <span className="text-right">MVP</span>
          </div>

          {tournaments.map((t) => (
            <Link
              key={t.year}
              href={`/events/${t.year}`}
              className="grid grid-cols-[3rem_8rem_8rem_1fr_6rem_7rem_9rem] items-center py-4 border-b border-gray hover:bg-gray-light transition-colors min-w-[750px]"
            >
              <span className="font-serif text-blue text-sm">
                {toOrdinal(t.edition)}
              </span>
              <span className="font-serif text-lg text-black">
                {t.displayYear}
              </span>
              <span className="text-slate text-sm">
                {getHostLabel(t.hostCity)}
              </span>
              <span className="text-slate text-sm truncate pr-4">
                {t.courses.join(', ')}
              </span>
              <span className="text-right font-serif text-blue">
                {t.scorePhilly !== null && t.scoreDC !== null
                  ? getScore(t)
                  : <span className="text-slate text-sm italic font-sans">TBD</span>}
              </span>
              <span className="text-right font-serif text-sm font-semibold text-black">
                {t.champion
                  ? getTeamLabel(t.champion)
                  : <span className="text-slate italic font-normal font-sans">TBD</span>}
              </span>
              <span className="text-right text-sm text-black">
                {t.mvpName || <span className="text-slate italic">--</span>}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* All-Time Team Record */}
      <section className="mt-16">
        <SectionHeading
          title="All-Time Team Record"
          subtitle="Head-to-Head Series Standings"
        />

        <div className="mt-6 border-t border-b border-gray divide-y divide-gray">
          <div className="grid grid-cols-3 py-4 text-center">
            <div>
              <p className="font-serif text-3xl text-blue">{seriesRecord.phillyWins}</p>
              <p className="text-sm text-slate mt-1">Team Philly Wins</p>
            </div>
            <div>
              <p className="font-serif text-lg text-slate mt-2">{seriesLeader} leads</p>
            </div>
            <div>
              <p className="font-serif text-3xl text-blue">{seriesRecord.dcWins}</p>
              <p className="text-sm text-slate mt-1">Team DC Wins</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 py-6">
            <div>
              <h3 className="font-serif text-lg text-black mb-3">Team Philly</h3>
              <div className="space-y-1 text-sm">
                <p className="text-slate">
                  Home record:{' '}
                  <span className="text-black font-medium">
                    {homeAway.phillyHome.wins}W &ndash; {homeAway.phillyHome.losses}L
                  </span>
                </p>
                <p className="text-slate">
                  Away record:{' '}
                  <span className="text-black font-medium">
                    {homeAway.phillyAway.wins}W &ndash; {homeAway.phillyAway.losses}L
                  </span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-serif text-lg text-black mb-3">Team DC</h3>
              <div className="space-y-1 text-sm">
                <p className="text-slate">
                  Home record:{' '}
                  <span className="text-black font-medium">
                    {homeAway.dcHome.wins}W &ndash; {homeAway.dcHome.losses}L
                  </span>
                </p>
                <p className="text-slate">
                  Away record:{' '}
                  <span className="text-black font-medium">
                    {homeAway.dcAway.wins}W &ndash; {homeAway.dcAway.losses}L
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards History */}
      <section className="mt-16">
        <SectionHeading
          title="Awards History"
          subtitle="MVP and Pat Shanahan Award Winners"
        />

        {/* Mobile layout */}
        <div className="mt-6 sm:hidden border-t-2 border-black divide-y divide-gray">
          {tournaments.map((t) => (
            <div key={t.year} className="py-4">
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="font-serif text-blue text-xs">{toOrdinal(t.edition)}</span>
                <span className="font-serif text-black">{t.displayYear}</span>
              </div>
              <div className="space-y-1 pl-1">
                <p className="text-xs text-slate uppercase tracking-wider">MVP</p>
                <p className="text-sm text-black">
                  {t.mvpName ? (
                    <>
                      {t.mvpName}
                      {t.mvpTeam && (
                        <span className="text-slate ml-1">({getTeamLabel(t.mvpTeam)})</span>
                      )}
                    </>
                  ) : (
                    <span className="text-slate italic">--</span>
                  )}
                </p>
                <p className="text-xs text-slate uppercase tracking-wider mt-2">Pat Shanahan Award</p>
                <p className="text-sm text-black">
                  {t.patShanahanAwardName ? (
                    <>
                      {t.patShanahanAwardName}
                      {t.patShanahanAwardTeam && (
                        <span className="text-slate ml-1">({getTeamLabel(t.patShanahanAwardTeam)})</span>
                      )}
                    </>
                  ) : (
                    <span className="text-slate italic">--</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop layout */}
        <div className="mt-6 hidden sm:block overflow-x-auto">
          <div className="grid grid-cols-[3rem_8rem_1fr_1fr] items-center py-3 border-b-2 border-black text-xs text-slate uppercase tracking-wider min-w-[500px]">
            <span />
            <span>Year</span>
            <span>MVP</span>
            <span>Pat Shanahan Award</span>
          </div>

          {tournaments.map((t) => (
            <div
              key={t.year}
              className="grid grid-cols-[3rem_8rem_1fr_1fr] items-center py-3 border-b border-gray min-w-[500px]"
            >
              <span className="font-serif text-blue text-sm">
                {toOrdinal(t.edition)}
              </span>
              <span className="font-serif text-black">
                {t.displayYear}
              </span>
              <span className="text-sm text-black">
                {t.mvpName ? (
                  <>
                    {t.mvpName}
                    {t.mvpTeam && (
                      <span className="text-slate ml-1">({getTeamLabel(t.mvpTeam)})</span>
                    )}
                  </>
                ) : (
                  <span className="text-slate italic">--</span>
                )}
              </span>
              <span className="text-sm text-black">
                {t.patShanahanAwardName ? (
                  <>
                    {t.patShanahanAwardName}
                    {t.patShanahanAwardTeam && (
                      <span className="text-slate ml-1">({getTeamLabel(t.patShanahanAwardTeam)})</span>
                    )}
                  </>
                ) : (
                  <span className="text-slate italic">--</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Course Rotation Summary */}
      <section className="mt-16 pb-12">
        <SectionHeading
          title="Course Rotation"
          subtitle="All Courses in FFI History"
        />

        {/* Mobile layout */}
        <div className="mt-6 sm:hidden border-t-2 border-black divide-y divide-gray">
          {courseUsage.map(({ course, count }) => (
            <div key={course.name} className="flex items-start justify-between py-4 gap-4">
              <div>
                <p className="text-sm text-black font-medium">{course.name}</p>
                {course.location && (
                  <p className="text-xs text-slate mt-0.5">
                    {course.location} &middot; {getHostLabel(course.city)}
                  </p>
                )}
              </div>
              <span className="font-serif text-blue shrink-0">{count}×</span>
            </div>
          ))}
        </div>

        {/* Desktop layout */}
        <div className="mt-6 hidden sm:block overflow-x-auto">
          <div className="grid grid-cols-[1fr_10rem_6rem_5rem] items-center py-3 border-b-2 border-black text-xs text-slate uppercase tracking-wider min-w-[450px]">
            <span>Course</span>
            <span>Location</span>
            <span>City</span>
            <span className="text-right">Times Used</span>
          </div>

          {courseUsage.map(({ course, count }) => (
            <div
              key={course.name}
              className="grid grid-cols-[1fr_10rem_6rem_5rem] items-center py-3 border-b border-gray min-w-[450px]"
            >
              <span className="text-sm text-black font-medium">
                {course.name}
              </span>
              <span className="text-sm text-slate">
                {course.location}
              </span>
              <span className="text-sm text-slate">
                {getHostLabel(course.city)}
              </span>
              <span className="text-right font-serif text-blue">
                {count}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
