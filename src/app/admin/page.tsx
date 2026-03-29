'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlayerRow {
  name: string;
  role: string;
  handicap: string;
}

interface EventFormState {
  year: string;
  edition: string;
  displayYear: string;
  date: string;
  hostCity: 'philly' | 'dc';
  courses: string[];
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
}

const emptyForm: EventFormState = {
  year: '',
  edition: '',
  displayYear: '',
  date: '',
  hostCity: 'philly',
  courses: [''],
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
};

// ── Converters ────────────────────────────────────────────────────────────────

function eventToForm(e: any): EventFormState {
  return {
    year: e.year ?? '',
    edition: e.edition != null ? String(e.edition) : '',
    displayYear: e.displayYear ?? '',
    date: e.date ?? '',
    hostCity: e.hostCity ?? 'philly',
    courses: e.courses?.length ? e.courses : [''],
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

  if (f.date.trim()) event.date = f.date.trim();

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
  onChange,
}: {
  players: PlayerRow[];
  onChange: (players: PlayerRow[]) => void;
}) {
  const update = (i: number, field: keyof PlayerRow, value: string) => {
    const next = players.map((p, idx) => (idx === i ? { ...p, [field]: value } : p));
    onChange(next);
  };
  const add = () => onChange([...players, { name: '', role: '', handicap: '' }]);
  const remove = (i: number) => onChange(players.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {players.map((p, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            className={input + ' flex-1'}
            placeholder="Name"
            value={p.name}
            onChange={(e) => update(i, 'name', e.target.value)}
          />
          <input
            className={input + ' w-36'}
            placeholder="Role"
            value={p.role}
            onChange={(e) => update(i, 'role', e.target.value)}
          />
          <input
            className={input + ' w-20'}
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
      <button
        type="button"
        onClick={add}
        className="text-sm text-blue hover:text-blue-dark mt-1"
      >
        + Add player
      </button>
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

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [events, setEvents] = useState<any[]>([]);
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
      .then((d) => setEvents(d.events ?? []));
  }, []);

  useEffect(() => {
    if (isAdmin) loadEvents();
  }, [isAdmin, loadEvents]);

  // Populate form when selected event changes
  useEffect(() => {
    if (selectedYear === 'new') {
      setForm(emptyForm);
    } else {
      const ev = events.find((e) => e.year === selectedYear);
      if (ev) setForm(eventToForm(ev));
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
          <div className="col-span-2 sm:col-span-2">
            <label className={label}>Date</label>
            <input
              className={input}
              placeholder="e.g. October 15–16, 2026"
              value={form.date}
              onChange={set('date')}
            />
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
        <p className="text-xs text-slate mb-4">Name · Role (optional) · Handicap index (optional)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <p className="font-serif text-black mb-3">Team Philly</p>
            <RosterEditor
              players={form.teamPhilly}
              onChange={(teamPhilly) => setForm((f) => ({ ...f, teamPhilly }))}
            />
          </div>
          <div>
            <p className="font-serif text-black mb-3">Team DC</p>
            <RosterEditor
              players={form.teamDC}
              onChange={(teamDC) => setForm((f) => ({ ...f, teamDC }))}
            />
          </div>
        </div>

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
