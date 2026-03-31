export interface Tournament {
  year: string;           // "S2018", "F2018", "2019", etc.
  edition: number;
  displayYear: string;
  hostCity: 'philly' | 'dc';
  courses: string[];
  dates?: string[];       // ISO dates e.g. ["2026-10-15", "2026-10-16"]
  dateDisplay?: string;   // Human-readable e.g. "October 15–16, 2026"
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

export interface PairingScore {
  front?: number;
  back?: number;
  overall?: number;
  total: number;
}

export interface MatchPairing {
  philly: string[];
  dc: string[];
  teeTime?: string;
  score?: {
    philly: PairingScore;
    dc: PairingScore;
  };
}

export interface PointValues {
  front?: number;    // max pts for front 9 (18-hole only)
  back?: number;     // max pts for back 9 (18-hole only)
  overall?: number;  // max pts for overall (18-hole only)
  total?: number;    // max pts total (9-hole only)
}

export interface Round {
  round?: number;
  name: string;
  type: string;
  holes: number;
  points: string | number;
  course?: string;
  isExhibition?: boolean;
  playersPerSide?: 1 | 2;
  pointValues?: PointValues;
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
  bannerPhotoId?: string;
  bannerPosition?: string;
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
