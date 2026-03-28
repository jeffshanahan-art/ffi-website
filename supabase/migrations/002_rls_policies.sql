-- Enable RLS on all tables
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE roster_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_content ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (the site is public)
CREATE POLICY "Public read access" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON courses FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tournament_courses FOR SELECT USING (true);
CREATE POLICY "Public read access" ON players FOR SELECT USING (true);
CREATE POLICY "Public read access" ON roster_entries FOR SELECT USING (true);
CREATE POLICY "Public read access" ON rounds FOR SELECT USING (true);
CREATE POLICY "Public read access" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read access" ON match_players FOR SELECT USING (true);
CREATE POLICY "Public read access" ON schedule_items FOR SELECT USING (true);
CREATE POLICY "Public read access" ON photos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON program_content FOR SELECT USING (true);

-- Admin write access (authenticated users)
CREATE POLICY "Admin write access" ON tournaments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access" ON courses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access" ON tournament_courses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access" ON players FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access" ON roster_entries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access" ON rounds FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access" ON matches FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access" ON match_players FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access" ON schedule_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access" ON photos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access" ON program_content FOR ALL USING (auth.role() = 'authenticated');
