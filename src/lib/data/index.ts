import ffiData from '@/data/ffi-data.json';
import type {
  Tournament,
  TournamentDetail,
  Player,
  Course,
  Photo,
  SeriesRecord,
  SiteConfig,
} from '@/types';

export async function getSiteConfig(): Promise<SiteConfig> {
  return {
    tournamentName: ffiData.tournament.name,
    abbreviation: ffiData.tournament.abbreviation,
    established: ffiData.tournament.established,
    tagline: 'Where Friendships Are Forged and Rivalries Are Born',
    trophy: ffiData.tournament.trophy,
  };
}

function mapEventToTournament(event: (typeof ffiData.events)[number]): Tournament {
  const format = 'format' in event ? (event as any).format : undefined;
  const rounds = format?.rounds;
  const formatDescription = rounds
    ? rounds.map((r: any) => `${r.name}: ${r.type} (${r.holes} holes)`).join(', ')
    : undefined;

  return {
    year: event.year,
    edition: event.edition,
    displayYear: event.displayYear,
    hostCity: event.hostCity as 'philly' | 'dc',
    courses: event.courses,
    dateStart: 'date' in event ? (event as any).date : undefined,
    dateEnd: undefined,
    scorePhilly: event.score.philly,
    scoreDC: event.score.dc,
    champion: event.champion as 'philly' | 'dc' | null,
    mvpName: event.mvp ? (event.mvp as any).name : null,
    mvpTeam: event.mvp ? (event.mvp as any).team : null,
    patShanahanAwardName: event.patShanahanAward
      ? (event.patShanahanAward as any).name
      : null,
    patShanahanAwardTeam: event.patShanahanAward
      ? (event.patShanahanAward as any).team
      : null,
    formatDescription,
    entryFee: format?.entryFee,
    prizePool: format?.prizePool ?? undefined,
    handicapRule: format?.handicapRule,
    notes: event.notes,
    weather: 'weather' in event ? (event as any).weather : undefined,
  };
}

export async function getTournaments(): Promise<Tournament[]> {
  return ffiData.events.map(mapEventToTournament);
}

export async function getTournamentByYear(
  year: string
): Promise<TournamentDetail | null> {
  const event = ffiData.events.find((e) => e.year === year);
  if (!event) return null;

  const base = mapEventToTournament(event);
  const format = 'format' in event ? (event as any).format : undefined;

  // Map roster entries - handle both string[] and object[] formats
  const teamPhilly = event.teamPhilly.map((entry: any) =>
    typeof entry === 'string'
      ? { name: entry }
      : {
          name: entry.name,
          role: entry.role,
          handicap: entry.handicap,
          lowIndex: entry.lowIndex,
        }
  );

  const teamDC = event.teamDC.map((entry: any) =>
    typeof entry === 'string'
      ? { name: entry }
      : {
          name: entry.name,
          role: entry.role,
          handicap: entry.handicap,
          lowIndex: entry.lowIndex,
        }
  );

  // Map rounds from format if available
  const rounds = format?.rounds?.map((r: any, i: number) => ({
    round: i + 1,
    name: r.name,
    type: r.type,
    holes: r.holes,
    points: r.points,
    course: r.course,
  }));

  return {
    ...base,
    teamPhilly,
    teamDC,
    rounds,
    schedule: 'schedule' in event ? (event as any).schedule : undefined,
    matches: 'matches' in event ? (event as any).matches : undefined,
  };
}

export async function getSeriesRecord(): Promise<SeriesRecord> {
  return {
    phillyWins: ffiData.seriesRecord.confirmed.philly,
    dcWins: ffiData.seriesRecord.confirmed.dc,
    pending: ffiData.seriesRecord.pending,
  };
}

export async function getPlayers(): Promise<Player[]> {
  return ffiData.allPlayers.map((p: any) => ({
    name: p.name,
    team: p.team as 'philly' | 'dc',
    nickname: p.nickname ?? undefined,
    homeClub: p.homeClub ?? undefined,
    headshot: p.headshot ?? undefined,
    bio: p.bio ?? undefined,
    yearsPlayed: p.yearsPlayed,
    roles: p.roles,
  }));
}

export async function getPlayersByTeam(
  team: 'philly' | 'dc'
): Promise<Player[]> {
  const all = await getPlayers();
  return all.filter((p) => p.team === team);
}

export async function getCourses(): Promise<Course[]> {
  return ffiData.courses.map((c) => ({
    name: c.name,
    location: c.location,
    city: c.city as 'philly' | 'dc',
  }));
}

export async function getPhotos(): Promise<(Photo & { id?: string })[]> {
  // Dynamic import to avoid bundling fs in client
  const { readPhotos } = await import('@/lib/photos-store');
  const photos = await readPhotos();
  return photos.map((p) => ({
    id: p.id,
    src: p.src,
    year: p.year,
    caption: p.caption,
  }));
}

export async function getPhotosByYear(year: string): Promise<(Photo & { id?: string })[]> {
  const all = await getPhotos();
  return all.filter((p) => p.year === year);
}
