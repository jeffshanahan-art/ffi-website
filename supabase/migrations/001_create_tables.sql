-- FFI Database Schema
-- Founding Fathers Invitational

-- Tournaments
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL UNIQUE,
  edition INTEGER NOT NULL,
  display_year TEXT NOT NULL,
  host_city TEXT NOT NULL CHECK (host_city IN ('philly', 'dc')),
  date_start DATE,
  date_end DATE,
  score_philly DECIMAL,
  score_dc DECIMAL,
  champion TEXT CHECK (champion IN ('philly', 'dc')),
  mvp_name TEXT,
  mvp_team TEXT CHECK (mvp_team IN ('philly', 'dc')),
  pat_shanahan_award_name TEXT,
  pat_shanahan_award_team TEXT CHECK (pat_shanahan_award_team IN ('philly', 'dc')),
  format_description TEXT,
  entry_fee INTEGER,
  prize_pool INTEGER,
  handicap_rule TEXT,
  notes TEXT,
  weather TEXT,
  program_pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  city TEXT NOT NULL CHECK (city IN ('philly', 'dc')),
  description TEXT
);

-- Junction: tournaments <-> courses
CREATE TABLE tournament_courses (
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  round_name TEXT,
  PRIMARY KEY (tournament_id, course_id, round_name)
);

-- Players
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team TEXT NOT NULL CHECK (team IN ('philly', 'dc')),
  nickname TEXT,
  home_clubs TEXT[],
  bio TEXT,
  headshot_url TEXT
);

-- Roster entries (player in a specific tournament)
CREATE TABLE roster_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  team TEXT NOT NULL CHECK (team IN ('philly', 'dc')),
  handicap DECIMAL,
  low_index DECIMAL,
  role TEXT,
  roster_security TEXT,
  UNIQUE (tournament_id, player_id)
);

-- Rounds within a tournament
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  format TEXT NOT NULL,
  holes INTEGER NOT NULL DEFAULT 18,
  points_available TEXT,
  course_id UUID REFERENCES courses(id),
  is_exhibition BOOLEAN DEFAULT FALSE
);

-- Matches within a round
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  group_number INTEGER,
  tee_time TEXT,
  result_philly DECIMAL,
  result_dc DECIMAL,
  result_text TEXT,
  notes TEXT
);

-- Players in a match
CREATE TABLE match_players (
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  team TEXT NOT NULL CHECK (team IN ('philly', 'dc')),
  PRIMARY KEY (match_id, player_id)
);

-- Schedule items
CREATE TABLE schedule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  date DATE,
  time TEXT,
  event TEXT NOT NULL,
  location TEXT,
  notes TEXT
);

-- Photos
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  url TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  sort_order INTEGER
);

-- Program content (writeups, notable moments, etc.)
CREATE TABLE program_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('matchup_writeup', 'logistics', 'rules', 'course_guide', 'notable_moment')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Indexes for common queries
CREATE INDEX idx_roster_entries_tournament ON roster_entries(tournament_id);
CREATE INDEX idx_roster_entries_player ON roster_entries(player_id);
CREATE INDEX idx_rounds_tournament ON rounds(tournament_id);
CREATE INDEX idx_matches_round ON matches(round_id);
CREATE INDEX idx_photos_tournament ON photos(tournament_id);
CREATE INDEX idx_schedule_items_tournament ON schedule_items(tournament_id);
CREATE INDEX idx_program_content_tournament ON program_content(tournament_id);
