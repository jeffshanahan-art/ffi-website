export interface Tournament {
  year: string;           // "S2018", "F2018", "2019", etc.
  edition: number;
  displayYear: string;
  hostCity: 'philly' | 'dc';
  courses: string[];
  dateStart?: string;
  dateEnd?: string;
  scorePhilly: number | null;
  scoreDC: number | null;
  champion: 'philly' | 'dc' | null;
  mvpName: string | null;
  mvpTeam: string | null;
  patShanahanAwardName: string | null;
  patShanahanAwardTeam: string | null;
  formatDescription?: string;
  entryFee?: number;
  prizePool?: number | null;
  handicapRule?: string;
  notes?: string;
  weather?: string;
}

export interface Course {
  name: string;
  location: string;
  city: 'philly' | 'dc';
}

export interface Player {
  name: string;
  team: 'philly' | 'dc';
  nickname?: string;
  homeClub?: string;
  headshot?: string;
  bio?: string;
  yearsPlayed: string[];
  roles: string[];
}

export interface RosterEntry {
  name: string;
  role?: string;
  handicap?: number;
  lowIndex?: number;
}

export interface MatchPairing {
  philly: string[];
  dc: string[];
  teeTime?: string;
}

export interface Round {
  round?: number;
  name: string;
  type: string;
  holes: number;
  points: string | number;
  course?: string;
  isExhibition?: boolean;
  pairings?: MatchPairing[];
}

export interface ScheduleItem {
  date: string;
  time: string;
  event: string;
  location: string;
  notes?: string;
}

export interface TournamentDetail extends Tournament {
  teamPhilly: RosterEntry[];
  teamDC: RosterEntry[];
  rounds?: Round[];
  schedule?: ScheduleItem[];
  matches?: any[];  // Raw match data from JSON
  partialResults?: boolean;
}

export interface SeriesRecord {
  phillyWins: number;
  dcWins: number;
  pending: string[];
}

export interface Photo {
  id?: string;
  src: string;
  year: string;
  caption?: string;
}

export interface SiteConfig {
  tournamentName: string;
  abbreviation: string;
  established: number;
  tagline: string;
  trophy: string;
}
