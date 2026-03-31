'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlayerRow {
  name: string;
  role: string;
  handicap: string;
}

interface PairingForm {
  philly: string[];
  dc: string[];
}

interface MatchRoundForm {
  name: string;
  type: string;
  holes: '9' | '18';
  playersPerSide: '1' | '2';
  course: string;
  pointFront: string;
  pointBack: string;
  pointOverall: string;
  pointTotal: string;
  pairings: PairingForm[];
  collapsed: boolean;
}

interface AllPlayer {
  name: string;
  team: 'philly' | 'dc';
}

interface PhotoOption {
  id: string;
  src: string;
}

interface EventFormState {
  year: string;
  edition: string;
  displayYear: string;
  dates: string[];
  hostCity: 'philly' | 'dc';
  courses: string[];
  bannerPhotoId: string;
  bannerPosition: string;
  scorePhilly: string;
  scoreDC: string;
  champion: 'philly' | 'dc' | '';
  mvpName: string;
  mvpTeam: 'philly' | 'dc' | '';
  patName: string;
  patTeam: 'philly' | 'dc' | '';
  notes: string;
  weather: string;
  entryFee: string;
  prizePool: string;
  handicapRule: string;
  teamPhilly: PlayerRow[];
  teamDC: PlayerRow[];
  matches: MatchRoundForm[];
}

const emptyForm: EventFormState = {
  year: '',
  edition: '',
  displayYear: '',
  dates: [''],
  hostCity: 'philly',
  courses: [''],
  bannerPhotoId: '',
  bannerPosition: '',
  scorePhilly: '',
  scoreDC: '',
  champion: '',
  mvpName: '',
  mvpTeam: '',
  patName: '',
  patTeam: '',
  notes: '',
  weather: '',
  entryFee: '',
  prizePool: '',
  handicapRule: '',
  teamPhilly: [{ name: '', role: 'Captain', handicap: '' }],
  teamDC: [{ name: '', role: 'Captain', handicap: '' }],
  matches: [],
};

// ── Converters ────────────────────────────────────────────────────────────────

function matchesToForm(matches: any[]): MatchRoundForm[] {
  if (!matches?.length) return [];
  return matches.map((m: any) => {
    const pv = m.pointValues;
    const holes = m.holes === 9 ? '9' : '18' as const;
    const playersPerSide = m.playersPerSide === 1 ? '1' : '2' as const;
    return {
      name: m.name || m.type || '',
      type: m.type || '',
      holes,
      playersPerSide,
      course: m.course || '',
      pointFront: pv?.front != null ? String(pv.front) : '',
      pointBack: pv?.back != null ? String(pv.back) : '',
      pointOverall: pv?.overall != null ? String(pv.overall) : '',
      pointTotal: pv?.total != null ? String(pv.total) : '',
      pairings: m.pairings?.map((p: any) => ({
        philly: p.philly || [],
        dc: p.dc || [],
      })) || [],
      collapsed: true,
    };
  });
}

function eventToForm(e: any): EventFormState {
  return {
    year: e.year ?? '',
    edition: e.edition != null ? String(e.edition) : '',
    displayYear: e.displayYear ?? '',
    dates: e.dates?.length ? e.dates : [''],
    hostCity: e.hostCity ?? 'philly',
    courses: e.courses?.length ? e.courses : [''],
    bannerPhotoId: e.bannerPhotoId ?? '',
    bannerPosition: e.bannerPosition ?? '',
    scorePhilly: e.score?.philly != null ? String(e.score.philly) : '',
    scoreDC: e.score?.dc != null ? String(e.score.dc) : '',
    champion: e.champion ?? '',
    mvpName: e.mvp?.name ?? '',
    mvpTeam: e.mvp?.team ?? '',
    patName: e.patShanahanAward?.name ?? '',
    patTeam: e.patShanahanAward?.team ?? '',
    notes: e.notes ?? '',
    weather: e.weather ?? '',
    entryFee: e.format?.entryFee != null ? String(e.format.entryFee) : '',
    prizePool: e.format?.prizePool != null ? String(e.format.prizePool) : '',
    handicapRule: e.format?.handicapRule ?? '',
    teamPhilly: e.teamPhilly?.length
      ? e.teamPhilly.map((p: any) => ({
          name: p.name ?? '',
          role: p.role ?? '',
          handicap: p.handicap != null ? String(p.handicap) : '',
        }))
      : [{ name: '', role: 'Captain', handicap: '' }],
    teamDC: e.teamDC?.length
      ? e.teamDC.map((p: any) => ({
          name: p.name ?? '',
          role: p.role ?? '',
          handicap: p.handicap != null ? String(p.handicap) : '',
        }))
      : [{ name: '', role: 'Captain', handicap: '' }],
    matches: matchesToForm(e.matches),
  };
}

function formToEvent(f: EventFormState, existing?: any): any {
  const event: any = {
    year: f.year.trim(),
    edition: parseInt(f.edition) || 0,
    displayYear: f.displayYear.trim(),
    hostCity: f.hostCity,
    courses: f.courses.map((c) => c.trim()).filter(Boolean),
    score: {
      philly: f.scorePhilly !== '' ? parseFloat(f.scorePhilly) : null,
      dc: f.scoreDC !== '' ? parseFloat(f.scoreDC) : null,
    },
    champion: f.champion || null,
    notes: f.notes,
    weather: f.weather,
    teamPhilly: f.teamPhilly
      .filter((p) => p.name.trim())
      .map((p) => ({
        name: p.name.trim(),
        ...(p.role.trim() ? { role: p.role.trim() } : {}),
        ...(p.handicap !== '' ? { handicap: parseFloat(p.handicap) } : {}),
      })),
    teamDC: f.teamDC
      .filter((p) => p.name.trim())
      .map((p) => ({
        name: p.name.trim(),
        ...(p.role.trim() ? { role: p.role.trim() } : {}),
        ...(p.handicap !== '' ? { handicap: parseFloat(p.handicap) } : {}),
      })),
  };

  // Store dates as ISO array + generate human-readable display string
  const isoDates = f.dates.map((d) => d.trim()).filter(Boolean);
  if (isoDates.length > 0) {
    event.dates = isoDates.sort();
    // Generate human-readable date string
    const formatted = isoDates.map((d) => {
      const dt = new Date(d + 'T12:00:00');
      return { month: dt.toLocaleDateString('en-US', { month: 'long' }), day: dt.getDate(), year: dt.getFullYear() };
    });
    if (formatted.length === 1) {
      event.date = `${formatted[0].month} ${formatted[0].day}, ${formatted[0].year}`;
    } else if (formatted[0].month === formatted[1].month && formatted[0].year === formatted[1].year) {
      event.date = `${formatted[0].month} ${formatted[0].day}–${formatted[1].day}, ${formatted[0].year}`;
    } else {
      event.date = `${formatted[0].month} ${formatted[0].day} – ${formatted[1].month} ${formatted[1].day}, ${formatted[1].year}`;
    }
  }

  if (f.bannerPhotoId.trim()) event.bannerPhotoId = f.bannerPhotoId.trim();
  if (f.bannerPosition.trim()) event.bannerPosition = f.bannerPosition.trim();

  // Serialize matches
  if (f.matches.length > 0) {
    event.matches = f.matches.map((m, i) => {
      const is18 = m.holes === '18';
      const pointValues = is18
        ? {
            front: parseFloat(m.pointFront) || 0,
            back: parseFloat(m.pointBack) || 0,
            overall: parseFloat(m.pointOverall) || 0,
          }
        : { total: parseFloat(m.pointTotal) || 0 };

      // Preserve existing scores from the original event data
      const existingMatch = existing?.matches?.[i];

      return {
        round: i + 1,
        name: m.name.trim() || m.type.trim(),
        type: m.type.trim(),
        course: m.course.trim() || undefined,
        holes: parseInt(m.holes),
        playersPerSide: parseInt(m.playersPerSide),
        pointValues,
        pairings: m.pairings
          .filter((p) => p.philly.some(Boolean) || p.dc.some(Boolean))
          .map((p, j) => ({
            philly: p.philly.filter(Boolean),
            dc: p.dc.filter(Boolean),
            // Preserve existing score if present
            ...(existingMatch?.pairings?.[j]?.score
              ? { score: existingMatch.pairings[j].score }
              : {}),
          })),
      };
    });
  }

  if (f.mvpName.trim()) {
    event.mvp = { name: f.mvpName.trim(), team: f.mvpTeam || 'philly' };
  } else {
    event.mvp = null;
  }

  if (f.patName.trim()) {
    event.patShanahanAward = { name: f.patName.trim(), team: f.patTeam || 'philly' };
  } else {
    event.patShanahanAward = null;
  }

  const hasFormat = f.entryFee || f.prizePool || f.handicapRule;
  if (hasFormat) {
    event.format = {
      ...(existing?.format ?? {}),
      ...(f.entryFee ? { entryFee: parseFloat(f.entryFee) } : {}),
      ...(f.prizePool ? { prizePool: parseFloat(f.prizePool) } : {}),
      ...(f.handicapRule ? { handicapRule: f.handicapRule } : {}),
    };
  }

  return event;
}

// ── Shared input styles ───────────────────────────────────────────────────────

const input =
  'border border-gray px-3 py-2 text-sm w-full focus:outline-none focus:border-blue bg-white';
const label = 'block text-xs text-slate uppercase tracking-wider mb-1';
const sectionHead = 'font-serif text-lg text-black mt-8 mb-4 pb-2 border-b border-gray';

// ── Roster editor ─────────────────────────────────────────────────────────────

function RosterEditor({
  players,
  allPlayers,
  team,
  onChange,
}: {
  players: PlayerRow[];
  allPlayers: AllPlayer[];
  team: 'philly' | 'dc';
  onChange: (players: PlayerRow[]) => void;
}) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);

  const update = (i: number, field: keyof PlayerRow, value: string) => {
    const next = players.map((p, idx) => (idx === i ? { ...p, [field]: value } : p));
    onChange(next);
  };
  const remove = (i: number) => onChange(players.filter((_, idx) => idx !== i));

  // Filter allPlayers by team, excluding already-selected names
  const selectedNames = new Set(players.map((p) => p.name).filter(Boolean));
  const available = allPlayers
    .filter((p) => p.team === team && !selectedNames.has(p.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  const addFromList = (name: string) => {
    onChange([...players, { name, role: '', handicap: '' }]);
  };

  const addNewPlayer = () => {
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;
    onChange([...players, { name: trimmed, role: '', handicap: '' }]);
    setNewPlayerName('');
    setShowNewInput(false);
  };

  return (
    <div className="space-y-2">
      {players.map((p, i) => (
        <div key={i} className="flex gap-2 items-center">
          <span className="flex-1 text-sm text-black truncate min-w-0 py-2">{p.name}</span>
          <input
            className="border border-gray px-3 py-2 text-sm w-36 shrink-0 focus:outline-none focus:border-blue bg-white"
            placeholder="Role"
            value={p.role}
            onChange={(e) => update(i, 'role', e.target.value)}
          />
          <input
            className="border border-gray px-3 py-2 text-sm w-20 shrink-0 focus:outline-none focus:border-blue bg-white"
            placeholder="HCP"
            type="number"
            step="0.1"
            value={p.handicap}
            onChange={(e) => update(i, 'handicap', e.target.value)}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-slate hover:text-black text-lg leading-none shrink-0"
            aria-label="Remove player"
          >
            ×
          </button>
        </div>
      ))}

      {/* Add from existing players */}
      {available.length > 0 && (
        <select
          className={input}
          value=""
          onChange={(e) => { if (e.target.value) addFromList(e.target.value); }}
        >
          <option value="">+ Add player from roster…</option>
          {available.map((p) => (
            <option key={p.name} value={p.name}>{p.name}</option>
          ))}
        </select>
      )}

      {/* Add new player not in allPlayers */}
      {showNewInput ? (
        <div className="flex gap-2 items-center">
          <input
            className={input + ' flex-1'}
            placeholder="New player name"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNewPlayer(); } }}
            autoFocus
          />
          <button
            type="button"
            onClick={addNewPlayer}
            className="text-sm text-blue hover:text-blue-dark"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => { setShowNewInput(false); setNewPlayerName(''); }}
            className="text-sm text-slate hover:text-black"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowNewInput(true)}
          className="text-sm text-slate hover:text-blue mt-1"
        >
          + Add new player (not in list)
        </button>
      )}
    </div>
  );
}

// ── Course list editor ────────────────────────────────────────────────────────

function CoursesEditor({
  courses,
  onChange,
}: {
  courses: string[];
  onChange: (courses: string[]) => void;
}) {
  const update = (i: number, val: string) =>
    onChange(courses.map((c, idx) => (idx === i ? val : c)));
  const add = () => onChange([...courses, '']);
  const remove = (i: number) => onChange(courses.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {courses.map((c, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            className={input + ' flex-1'}
            placeholder="Course name"
            value={c}
            onChange={(e) => update(i, e.target.value)}
          />
          {courses.length > 1 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-slate hover:text-black text-lg leading-none shrink-0"
              aria-label="Remove course"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-sm text-blue hover:text-blue-dark mt-1"
      >
        + Add course
      </button>
    </div>
  );
}

// ── Pairing editor ───────────────────────────────────────────────────────────

function PairingEditor({
  pairings,
  playersPerSide,
  phillyRoster,
  dcRoster,
  onChange,
}: {
  pairings: PairingForm[];
  playersPerSide: '1' | '2';
  phillyRoster: string[];
  dcRoster: string[];
  onChange: (pairings: PairingForm[]) => void;
}) {
  const count = parseInt(playersPerSide);

  const usedPhilly = new Set(pairings.flatMap((p) => p.philly.filter(Boolean)));
  const usedDC = new Set(pairings.flatMap((p) => p.dc.filter(Boolean)));

  const updatePlayer = (pIdx: number, team: 'philly' | 'dc', slot: number, value: string) => {
    const next = pairings.map((p, i) => {
      if (i !== pIdx) return p;
      const arr = [...p[team]];
      arr[slot] = value;
      return { ...p, [team]: arr };
    });
    onChange(next);
  };

  const add = () =>
    onChange([
      ...pairings,
      { philly: Array(count).fill(''), dc: Array(count).fill('') },
    ]);

  const remove = (i: number) => onChange(pairings.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3 mt-3">
      {pairings.map((pairing, pIdx) => (
        <div key={pIdx} className="flex gap-2 items-start border border-gray p-3">
          <div className="flex-1 space-y-1">
            <span className="text-xs text-slate uppercase">Philly</span>
            {Array.from({ length: count }).map((_, slot) => (
              <select
                key={slot}
                className={input}
                value={pairing.philly[slot] || ''}
                onChange={(e) => updatePlayer(pIdx, 'philly', slot, e.target.value)}
              >
                <option value="">Select player…</option>
                {phillyRoster.map((name) => (
                  <option
                    key={name}
                    value={name}
                    disabled={usedPhilly.has(name) && pairing.philly[slot] !== name}
                  >
                    {name}
                  </option>
                ))}
              </select>
            ))}
          </div>
          <span className="text-slate text-sm pt-6">vs</span>
          <div className="flex-1 space-y-1">
            <span className="text-xs text-slate uppercase">DC</span>
            {Array.from({ length: count }).map((_, slot) => (
              <select
                key={slot}
                className={input}
                value={pairing.dc[slot] || ''}
                onChange={(e) => updatePlayer(pIdx, 'dc', slot, e.target.value)}
              >
                <option value="">Select player…</option>
                {dcRoster.map((name) => (
                  <option
                    key={name}
                    value={name}
                    disabled={usedDC.has(name) && pairing.dc[slot] !== name}
                  >
                    {name}
                  </option>
                ))}
              </select>
            ))}
          </div>
          <button
            type="button"
            onClick={() => remove(pIdx)}
            className="text-slate hover:text-black text-lg leading-none shrink-0 pt-5"
            aria-label="Remove pairing"
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-sm text-blue hover:text-blue-dark">
        + Add pairing
      </button>
    </div>
  );
}

// ── Match round editor ───────────────────────────────────────────────────────

function MatchRoundEditor({
  matches,
  phillyRoster,
  dcRoster,
  onChange,
}: {
  matches: MatchRoundForm[];
  phillyRoster: string[];
  dcRoster: string[];
  onChange: (matches: MatchRoundForm[]) => void;
}) {
  const update = (i: number, field: keyof MatchRoundForm, value: any) => {
    const next = matches.map((m, idx) => {
      if (idx !== i) return m;
      const updated = { ...m, [field]: value };
      // When switching holes, adjust pairing slots if needed
      if (field === 'playersPerSide') {
        const count = parseInt(value);
        updated.pairings = updated.pairings.map((p) => ({
          philly: Array.from({ length: count }, (_, j) => p.philly[j] || ''),
          dc: Array.from({ length: count }, (_, j) => p.dc[j] || ''),
        }));
      }
      return updated;
    });
    onChange(next);
  };

  const add = () =>
    onChange([
      ...matches,
      {
        name: '',
        type: '',
        holes: '18',
        playersPerSide: '2',
        course: '',
        pointFront: '1',
        pointBack: '1',
        pointOverall: '2',
        pointTotal: '3',
        pairings: [],
        collapsed: false,
      },
    ]);

  const remove = (i: number) => onChange(matches.filter((_, idx) => idx !== i));
  const toggle = (i: number) =>
    onChange(matches.map((m, idx) => (idx === i ? { ...m, collapsed: !m.collapsed } : m)));

  return (
    <div className="space-y-4">
      {matches.map((m, i) => (
        <div key={i} className="border border-gray">
          <div
            className="flex items-center justify-between px-3 py-2 bg-gray/20 cursor-pointer"
            onClick={() => toggle(i)}
          >
            <span className="text-sm font-medium text-black">
              {m.name || m.type || `Round ${i + 1}`}
              <span className="text-slate ml-2 font-normal">
                {m.holes}H · {m.playersPerSide === '1' ? 'Individual' : 'Teams'} · {m.pairings.length} pairing{m.pairings.length !== 1 ? 's' : ''}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); remove(i); }}
                className="text-slate hover:text-black text-lg leading-none"
                aria-label="Remove round"
              >
                ×
              </button>
              <span className="text-slate text-sm">{m.collapsed ? '▸' : '▾'}</span>
            </div>
          </div>
          {!m.collapsed && (
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className={label}>Round name</label>
                  <input
                    className={input}
                    placeholder="e.g. Morning Foursomes"
                    value={m.name}
                    onChange={(e) => update(i, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className={label}>Format type</label>
                  <input
                    className={input}
                    placeholder="e.g. Foursomes"
                    value={m.type}
                    onChange={(e) => update(i, 'type', e.target.value)}
                  />
                </div>
                <div>
                  <label className={label}>Holes</label>
                  <select
                    className={input}
                    value={m.holes}
                    onChange={(e) => update(i, 'holes', e.target.value)}
                  >
                    <option value="18">18 holes</option>
                    <option value="9">9 holes</option>
                  </select>
                </div>
                <div>
                  <label className={label}>Players per side</label>
                  <select
                    className={input}
                    value={m.playersPerSide}
                    onChange={(e) => update(i, 'playersPerSide', e.target.value)}
                  >
                    <option value="2">Teams (2v2)</option>
                    <option value="1">Individual (1v1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={label}>Course</label>
                <input
                  className={input}
                  placeholder="Course name"
                  value={m.course}
                  onChange={(e) => update(i, 'course', e.target.value)}
                />
              </div>

              {/* Point values */}
              <div>
                <label className={label}>Point values (max pts available)</label>
                {m.holes === '18' ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs text-slate">Front 9</span>
                      <input
                        className={input}
                        type="number"
                        step="0.5"
                        placeholder="1"
                        value={m.pointFront}
                        onChange={(e) => update(i, 'pointFront', e.target.value)}
                      />
                    </div>
                    <div>
                      <span className="text-xs text-slate">Back 9</span>
                      <input
                        className={input}
                        type="number"
                        step="0.5"
                        placeholder="1"
                        value={m.pointBack}
                        onChange={(e) => update(i, 'pointBack', e.target.value)}
                      />
                    </div>
                    <div>
                      <span className="text-xs text-slate">Overall</span>
                      <input
                        className={input}
                        type="number"
                        step="0.5"
                        placeholder="2"
                        value={m.pointOverall}
                        onChange={(e) => update(i, 'pointOverall', e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-48">
                    <span className="text-xs text-slate">Total pts</span>
                    <input
                      className={input}
                      type="number"
                      step="0.5"
                      placeholder="3"
                      value={m.pointTotal}
                      onChange={(e) => update(i, 'pointTotal', e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Pairings */}
              <div>
                <label className={label}>Pairings</label>
                <PairingEditor
                  pairings={m.pairings}
                  playersPerSide={m.playersPerSide}
                  phillyRoster={phillyRoster}
                  dcRoster={dcRoster}
                  onChange={(pairings) =>
                    onChange(matches.map((mm, idx) => (idx === i ? { ...mm, pairings } : mm)))
                  }
                />
              </div>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={add} className="text-sm text-blue hover:text-blue-dark mt-1">
        + Add match round
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [events, setEvents] = useState<any[]>([]);
  const [allPlayers, setAllPlayers] = useState<AllPlayer[]>([]);
  const [eventPhotos, setEventPhotos] = useState<PhotoOption[]>([]);
  const [selectedYear, setSelectedYear] = useState('new');
  const [form, setForm] = useState<EventFormState>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveOk, setSaveOk] = useState(false);

  // Check auth on mount
  useEffect(() => {
    fetch('/api/auth')
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.isAdmin))
      .finally(() => setChecking(false));
  }, []);

  // Load events when authenticated
  const loadEvents = useCallback(() => {
    fetch('/api/admin/events')
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events ?? []);
        setAllPlayers(d.allPlayers ?? []);
      });
  }, []);

  useEffect(() => {
    if (isAdmin) loadEvents();
  }, [isAdmin, loadEvents]);

  // Populate form when selected event changes
  useEffect(() => {
    if (selectedYear === 'new') {
      setForm(emptyForm);
      setEventPhotos([]);
    } else {
      const ev = events.find((e) => e.year === selectedYear);
      if (ev) setForm(eventToForm(ev));
      // Fetch photos for this event
      fetch('/api/photos')
        .then((r) => r.json())
        .then((photos: any[]) => {
          setEventPhotos(
            photos
              .filter((p: any) => p.year === selectedYear)
              .map((p: any) => ({ id: p.id, src: p.src }))
          );
        })
        .catch(() => setEventPhotos([]));
    }
    setSaveMessage('');
    setSaveOk(false);
  }, [selectedYear, events]);

  // ── Login ──────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.success) {
      setIsAdmin(true);
    } else {
      setLoginError('Invalid password');
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');
    setSaveOk(false);

    try {
      const existing = events.find((ev) => ev.year === form.year);
      const eventData = formToEvent(form, existing);
      const isNew = selectedYear === 'new';

      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventData, isNew }),
      });

      if (res.ok) {
        setSaveOk(true);
        setSaveMessage(
          isNew
            ? 'Event created! Deploying to ffi.golf (1–2 min)…'
            : 'Saved! Deploying to ffi.golf (1–2 min)…'
        );
        loadEvents();
        if (isNew) setSelectedYear(form.year);
      } else {
        const err = await res.json();
        setSaveMessage(`Error: ${err.error ?? 'Failed to save'}`);
      }
    } catch {
      setSaveMessage('Error: Could not reach server');
    } finally {
      setSaving(false);
    }
  };

  // ── Field helpers ──────────────────────────────────────────────────────────

  const set = (field: keyof EventFormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // ── Render: loading ────────────────────────────────────────────────────────

  if (checking) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center text-slate">
        Checking…
      </div>
    );
  }

  // ── Render: login ──────────────────────────────────────────────────────────

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24">
        <h1 className="font-serif text-3xl text-blue mb-8">Admin</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className={label}>Password</label>
            <input
              type="password"
              className={input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          {loginError && <p className="text-sm text-red-600">{loginError}</p>}
          <button
            type="submit"
            className="w-full bg-blue text-white py-2 text-sm hover:bg-blue-dark transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    );
  }

  // ── Render: editor ─────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-baseline justify-between pb-4 border-b border-gray">
        <h1 className="font-serif text-4xl text-blue">Event Admin</h1>
        <button
          onClick={() => fetch('/api/auth', { method: 'DELETE' }).then(() => setIsAdmin(false))}
          className="text-sm text-slate hover:text-black"
        >
          Sign out
        </button>
      </div>

      {/* Event selector */}
      <div className="mt-8">
        <label className={label}>Select event</label>
        <select
          className={input}
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="new">＋ Create new event</option>
          {[...events].reverse().map((ev) => (
            <option key={ev.year} value={ev.year}>
              {ev.displayYear} — {ev.edition ? `${ev.edition}${ordinal(ev.edition)} Edition` : ev.year}
            </option>
          ))}
        </select>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="mt-4">

        {/* ── Event Info ── */}
        <h2 className={sectionHead}>Event Info</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className={label}>Year key *</label>
            <input
              className={input}
              placeholder="e.g. 2026 or S2018"
              value={form.year}
              onChange={set('year')}
              required
              readOnly={selectedYear !== 'new'}
            />
            {selectedYear !== 'new' && (
              <p className="text-xs text-slate mt-1">Year key cannot be changed after creation.</p>
            )}
          </div>
          <div>
            <label className={label}>Edition #</label>
            <input
              className={input}
              type="number"
              placeholder="e.g. 10"
              value={form.edition}
              onChange={set('edition')}
            />
          </div>
          <div>
            <label className={label}>Display year</label>
            <input
              className={input}
              placeholder="e.g. 2026"
              value={form.displayYear}
              onChange={set('displayYear')}
            />
          </div>
          <div>
            <label className={label}>Date(s)</label>
            <div className="space-y-2">
              {form.dates.map((d, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className={input}
                    type="date"
                    value={d}
                    onChange={(e) => {
                      const next = [...form.dates];
                      next[i] = e.target.value;
                      setForm((f) => ({ ...f, dates: next }));
                    }}
                  />
                  {form.dates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, dates: f.dates.filter((_, idx) => idx !== i) }))}
                      className="text-slate hover:text-black text-lg leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {form.dates.length < 2 && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, dates: [...f.dates, ''] }))}
                  className="text-xs text-blue hover:text-blue-dark"
                >
                  + Add second day
                </button>
              )}
            </div>
            <p className="text-xs text-slate mt-1">Scoring is available on these dates.</p>
          </div>
          <div>
            <label className={label}>Host city</label>
            <select className={input} value={form.hostCity} onChange={set('hostCity')}>
              <option value="philly">Philadelphia</option>
              <option value="dc">Washington, DC</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={label}>Courses</label>
          <CoursesEditor
            courses={form.courses}
            onChange={(courses) => setForm((f) => ({ ...f, courses }))}
          />
        </div>

        {/* ── Hero Image ── */}
        {eventPhotos.length > 0 && (
          <div className="mt-6">
            <label className={label}>Hero image</label>
            <p className="text-xs text-slate mb-3">Select the banner photo for this edition&apos;s event page.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {eventPhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, bannerPhotoId: f.bannerPhotoId === photo.id ? '' : photo.id }))}
                  className={`relative aspect-[3/2] overflow-hidden border-2 transition-colors ${
                    form.bannerPhotoId === photo.id ? 'border-blue' : 'border-transparent hover:border-gray'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {form.bannerPhotoId === photo.id && (
                    <div className="absolute inset-0 bg-blue/20 flex items-center justify-center">
                      <span className="bg-blue text-white text-xs px-2 py-0.5 rounded">Selected</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {form.bannerPhotoId && (
              <div className="mt-3">
                <label className={label}>Banner position (optional)</label>
                <input
                  className={input + ' w-48'}
                  placeholder="e.g. center 30%"
                  value={form.bannerPosition}
                  onChange={(e) => setForm((f) => ({ ...f, bannerPosition: e.target.value }))}
                />
                <p className="text-xs text-slate mt-1">CSS object-position to adjust cropping. Default is &quot;center center&quot;.</p>
              </div>
            )}
          </div>
        )}
        {selectedYear !== 'new' && eventPhotos.length === 0 && (
          <p className="text-xs text-slate mt-4">No photos uploaded for this event yet. Upload photos on the event page first.</p>
        )}

        {/* ── Results ── */}
        <h2 className={sectionHead}>Results</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className={label}>Score — Philly</label>
            <input
              className={input}
              type="number"
              step="0.5"
              placeholder="e.g. 15.5"
              value={form.scorePhilly}
              onChange={set('scorePhilly')}
            />
          </div>
          <div>
            <label className={label}>Score — DC</label>
            <input
              className={input}
              type="number"
              step="0.5"
              placeholder="e.g. 12.5"
              value={form.scoreDC}
              onChange={set('scoreDC')}
            />
          </div>
          <div className="col-span-2">
            <label className={label}>Champion</label>
            <select className={input} value={form.champion} onChange={set('champion')}>
              <option value="">TBD / not set</option>
              <option value="philly">Team Philly</option>
              <option value="dc">Team DC</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className={label}>MVP name</label>
            <input
              className={input}
              placeholder="Full name"
              value={form.mvpName}
              onChange={set('mvpName')}
            />
            <label className={label + ' mt-2'}>MVP team</label>
            <select className={input} value={form.mvpTeam} onChange={set('mvpTeam')}>
              <option value="">—</option>
              <option value="philly">Team Philly</option>
              <option value="dc">Team DC</option>
            </select>
          </div>
          <div>
            <label className={label}>Pat Shanahan Award name</label>
            <input
              className={input}
              placeholder="Full name"
              value={form.patName}
              onChange={set('patName')}
            />
            <label className={label + ' mt-2'}>Pat Shanahan Award team</label>
            <select className={input} value={form.patTeam} onChange={set('patTeam')}>
              <option value="">—</option>
              <option value="philly">Team Philly</option>
              <option value="dc">Team DC</option>
            </select>
          </div>
        </div>

        {/* ── Format ── */}
        <h2 className={sectionHead}>Format</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className={label}>Entry fee ($)</label>
            <input
              className={input}
              type="number"
              placeholder="e.g. 250"
              value={form.entryFee}
              onChange={set('entryFee')}
            />
          </div>
          <div>
            <label className={label}>Prize pool ($)</label>
            <input
              className={input}
              type="number"
              placeholder="e.g. 2000"
              value={form.prizePool}
              onChange={set('prizePool')}
            />
          </div>
          <div className="col-span-2 sm:col-span-3">
            <label className={label}>Handicap / format rule</label>
            <input
              className={input}
              placeholder="e.g. Better Ball, full handicap"
              value={form.handicapRule}
              onChange={set('handicapRule')}
            />
          </div>
        </div>

        {/* ── Rosters ── */}
        <h2 className={sectionHead}>Rosters</h2>
        <p className="text-xs text-slate mb-4">Select players from the master list. Role and handicap are optional.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <p className="font-serif text-black mb-3">Team Philly</p>
            <RosterEditor
              players={form.teamPhilly}
              allPlayers={allPlayers}
              team="philly"
              onChange={(teamPhilly) => setForm((f) => ({ ...f, teamPhilly }))}
            />
          </div>
          <div>
            <p className="font-serif text-black mb-3">Team DC</p>
            <RosterEditor
              players={form.teamDC}
              allPlayers={allPlayers}
              team="dc"
              onChange={(teamDC) => setForm((f) => ({ ...f, teamDC }))}
            />
          </div>
        </div>

        {/* ── Matches ── */}
        <h2 className={sectionHead}>Matches</h2>
        <p className="text-xs text-slate mb-4">
          Define match rounds, point values, and player pairings. Players are drawn from the rosters above.
        </p>
        <MatchRoundEditor
          matches={form.matches}
          phillyRoster={form.teamPhilly.map((p) => p.name).filter(Boolean)}
          dcRoster={form.teamDC.map((p) => p.name).filter(Boolean)}
          onChange={(matches) => setForm((f) => ({ ...f, matches }))}
        />

        {/* ── Narrative ── */}
        <h2 className={sectionHead}>Narrative</h2>
        <div className="space-y-4">
          <div>
            <label className={label}>Notes / event story</label>
            <textarea
              className={input + ' h-40 resize-y'}
              value={form.notes}
              onChange={set('notes')}
              placeholder="Narrative description of the event…"
            />
          </div>
          <div>
            <label className={label}>Weather</label>
            <input
              className={input}
              placeholder="e.g. Mid-October in Philadelphia. Highs around 62°F."
              value={form.weather}
              onChange={set('weather')}
            />
          </div>
        </div>

        {/* ── Save ── */}
        <div className="mt-10 flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue text-white px-8 py-3 text-sm hover:bg-blue-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : selectedYear === 'new' ? 'Create event' : 'Save changes'}
          </button>
          {saveMessage && (
            <p className={`text-sm ${saveOk ? 'text-green-700' : 'text-red-600'}`}>
              {saveMessage}
            </p>
          )}
        </div>

      </form>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0];
}
