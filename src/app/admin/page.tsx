'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Footballer } from '@/types/footballer';
import {
  ShieldCheck,
  PlusCircle,
  Calendar,
  BarChart3,
  Edit2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Lock,
} from 'lucide-react';

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [players, setPlayers] = useState<Footballer[]>([]);
  const [schedule, setSchedule] = useState<Record<string, string>>({});
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Footballer | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [scheduledPlayerId, setScheduledPlayerId] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  // Form state only containing what gameplay actually requires
  const [formData, setFormData] = useState<Partial<Footballer>>({
    id: '',
    displayName: '',
    alternativeNames: [],
    nationality: '',
    countryCode: '',
    flagEmoji: '⚽',
    league: 'Premier League',
    currentClub: '',
    position: 'Forward',
    positionAbbr: 'FWD',
    age: 26,
    isActive: true,
  });

  const [altNamesInput, setAltNamesInput] = useState('');
  const [prevClubsInput, setPrevClubsInput] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin?secret=${encodeURIComponent(secret)}`);
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players);
        setSchedule(data.schedule);
        setIsAuthenticated(true);
        setMessage(null);

        const aRes = await fetch('/api/analytics');
        const aData = await aRes.json();
        setAnalytics(aData);
      } else {
        setMessage('Invalid admin password. Default in local dev: footble-admin-pass');
      }
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleEditPlayer = (p: Footballer) => {
    setSelectedPlayer(p);
    setFormData(p);
    setAltNamesInput(p.alternativeNames?.join(', ') || '');
    setPrevClubsInput(p.previousClubs?.join(', ') || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewPlayer = () => {
    setSelectedPlayer(null);
    setFormData({
      id: '',
      displayName: '',
      alternativeNames: [],
      nationality: '',
      countryCode: '',
      flagEmoji: '⚽',
      league: 'Premier League',
      currentClub: '',
      position: 'Forward',
      positionAbbr: 'FWD',
      age: 26,
      isActive: true,
      previousClubs: [],
    });
    setAltNamesInput('');
    setPrevClubsInput('');
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName) return;

    const playerId =
      formData.id ||
      formData.displayName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');

    let posAbbrCalc: 'GK' | 'DEF' | 'MID' | 'FWD' = 'FWD';
    if (formData.position === 'Goalkeeper') posAbbrCalc = 'GK';
    else if (formData.position === 'Defender') posAbbrCalc = 'DEF';
    else if (formData.position === 'Midfielder') posAbbrCalc = 'MID';

    const playerToSave: Footballer = {
      ...(formData as Footballer),
      id: playerId,
      fullName: formData.displayName,
      displayName: formData.displayName,
      alternativeNames: altNamesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      positionAbbr: posAbbrCalc,
      isRetired: false,
      previousClubs: prevClubsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      difficulty: 'Easy',
      isActive: formData.isActive ?? true,
    };

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({
          action: 'save_player',
          player: playerToSave,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players);
        setMessage(`Footballer "${playerToSave.displayName}" saved successfully!`);
        handleNewPlayer();
      }
    } catch (err: any) {
      setMessage(`Save failed: ${err.message}`);
    }
  };

  const handleAssignSchedule = async () => {
    if (!scheduleDate || !scheduledPlayerId) return;

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({
          action: 'update_schedule',
          scheduleUpdate: {
            [scheduleDate]: scheduledPlayerId,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSchedule(data.schedule);
        setMessage(`Assigned mystery footballer for ${scheduleDate}!`);
      }
    } catch (err: any) {
      setMessage(`Schedule update failed: ${err.message}`);
    }
  };

  const toggleActiveStatus = async (p: Footballer) => {
    const updated = { ...p, isActive: !p.isActive };
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({
          action: 'save_player',
          player: updated,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players);
      }
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen px-4 py-12 max-w-md mx-auto text-white flex flex-col justify-center pitch-bg">
        <div className="bg-[#0e331c] border-2 border-emerald-400 rounded-2xl p-6 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-[#144f2c] border-2 border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-headline font-black text-center mb-1">Dugout Admin Portal</h1>
          <p className="text-xs text-emerald-200 text-center mb-6 font-medium">
            Enter administrative key to manage footballers and fixtures.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Admin password (default: footble-admin-pass)"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-4 py-3 bg-[#081f10] border-2 border-[#297a49] rounded-xl text-white text-sm focus:outline-none focus:border-white font-mono"
            />
            {message && <p className="text-xs text-red-300 font-bold">{message}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-headline font-black text-xs uppercase tracking-wider rounded-xl transition-colors border-2 border-emerald-300 shadow-md pressable"
            >
              Enter Admin Portal
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-emerald-300 hover:text-white font-bold">
              Back to Pitch
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 max-w-4xl mx-auto text-white pb-24 pitch-bg">
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-white/20">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-emerald-200 hover:text-white p-2 rounded-lg bg-[#0e331c] border border-emerald-400">
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </Link>
          <h1 className="text-2xl font-headline font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-300" />
            <span>Footble Admin Manager</span>
          </h1>
        </div>
        <button
          onClick={handleNewPlayer}
          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-headline font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 border-2 border-emerald-300 shadow-md pressable"
        >
          <PlusCircle className="w-4 h-4 stroke-[3]" /> Add Footballer
        </button>
      </div>

      {message && (
        <div className="mb-6 p-3.5 bg-[#15803d] border-2 border-emerald-300 text-white font-black text-xs rounded-xl shadow-md">
          {message}
        </div>
      )}

      {/* Analytics Overview */}
      {analytics && (
        <section className="mb-6 bg-[#0e331c] border-2 border-[#297a49] rounded-2xl p-4 shadow-lg">
          <h2 className="text-xs font-black text-emerald-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Matchday Analytics & Usage</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-[#081f10] rounded-xl border border-[#297a49]">
              <span className="text-[11px] text-emerald-200 font-bold block">Total Visitors</span>
              <span className="text-xl font-black text-white">{analytics.dailyVisitors}</span>
            </div>
            <div className="p-3 bg-[#081f10] rounded-xl border border-[#297a49]">
              <span className="text-[11px] text-emerald-200 font-bold block">Games Completed</span>
              <span className="text-xl font-black text-emerald-300">{analytics.gamesCompleted}</span>
            </div>
            <div className="p-3 bg-[#081f10] rounded-xl border border-[#297a49]">
              <span className="text-[11px] text-emerald-200 font-bold block">Practice vs Daily</span>
              <span className="text-sm font-black text-white">
                {analytics.practiceCount}P / {analytics.dailyCount}D
              </span>
            </div>
            <div className="p-3 bg-[#081f10] rounded-xl border border-[#297a49]">
              <span className="text-[11px] text-emerald-200 font-bold block">Share Clicks</span>
              <span className="text-xl font-black text-yellow-300">{analytics.shareClicks}</span>
            </div>
          </div>
        </section>
      )}

      {/* Daily Challenge Fixture Scheduler */}
      <section className="mb-6 bg-[#0e331c] border-2 border-[#297a49] rounded-2xl p-4 shadow-lg">
        <h2 className="text-xs font-black text-emerald-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Schedule Daily Mystery Fixture</span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-[#081f10] border-2 border-[#297a49] rounded-xl text-sm text-white font-mono"
          />
          <select
            value={scheduledPlayerId || schedule[scheduleDate] || ''}
            onChange={(e) => setScheduledPlayerId(e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 bg-[#081f10] border-2 border-[#297a49] rounded-xl text-sm text-white font-bold"
          >
            <option value="">-- Choose Footballer --</option>
            {players
              .filter((p) => p.isActive)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.flagEmoji} {p.displayName} ({p.currentClub} • {p.league} • {p.age}y)
                </option>
              ))}
          </select>
          <button
            onClick={handleAssignSchedule}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-headline font-black text-xs uppercase tracking-wider rounded-xl whitespace-nowrap border-2 border-emerald-300 pressable shadow-md"
          >
            Assign Date
          </button>
        </div>
      </section>

      {/* Streamlined Add / Edit Footballer Form (Only Wordle Grid Fields) */}
      <section className="mb-6 bg-[#0e331c] border-2 border-emerald-400 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#297a49]">
          <h2 className="text-base font-headline font-black text-white">
            {selectedPlayer ? `Edit Player: ${selectedPlayer.displayName}` : 'Add New Footballer'}
          </h2>
          <span className="text-[11px] font-mono font-bold text-emerald-200">
            Wordle Gameplay Fields Only
          </span>
        </div>

        <form onSubmit={handleSavePlayer} className="space-y-4">
          {/* 1. Name & Aliases */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-emerald-200 font-bold block mb-1">Player Name *</label>
              <input
                type="text"
                required
                value={formData.displayName || ''}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="e.g. Kevin De Bruyne"
                className="w-full px-3 py-2.5 bg-[#081f10] border-2 border-[#297a49] rounded-xl text-sm text-white font-bold focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="text-xs text-emerald-200 font-bold block mb-1">
                Alternative Names & Aliases (comma-separated)
              </label>
              <input
                type="text"
                value={altNamesInput}
                onChange={(e) => setAltNamesInput(e.target.value)}
                placeholder="e.g. KDB, De Bruyne"
                className="w-full px-3 py-2.5 bg-[#081f10] border-2 border-[#297a49] rounded-xl text-sm text-white font-bold focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* 2. Nationality, Flag & Country Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-emerald-200 font-bold block mb-1">Nationality *</label>
              <input
                type="text"
                required
                value={formData.nationality || ''}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder="e.g. Belgium"
                className="w-full px-3 py-2 bg-[#081f10] border-2 border-[#297a49] rounded-xl text-sm text-white font-bold focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="text-xs text-emerald-200 font-bold block mb-1">Flag Emoji & ISO Code *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.flagEmoji || ''}
                  onChange={(e) => setFormData({ ...formData, flagEmoji: e.target.value })}
                  placeholder="🇧🇪"
                  className="w-16 px-2 py-2 bg-[#081f10] border-2 border-[#297a49] rounded-xl text-lg text-white text-center font-bold"
                />
                <input
                  type="text"
                  required
                  value={formData.countryCode || ''}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
                  placeholder="BEL"
                  maxLength={3}
                  className="w-20 px-2 py-2 bg-[#081f10] border-2 border-[#297a49] rounded-xl text-sm text-white text-center font-mono font-bold"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-emerald-200 font-bold block mb-1">Position *</label>
              <select
                value={formData.position || 'Forward'}
                onChange={(e: any) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 bg-[#081f10] border-2 border-[#297a49] rounded-xl text-sm text-white font-bold"
              >
                <option value="Forward">Forward (FWD)</option>
                <option value="Midfielder">Midfielder (MID)</option>
                <option value="Defender">Defender (DEF)</option>
                <option value="Goalkeeper">Goalkeeper (GK)</option>
              </select>
            </div>
          </div>

          {/* 3. Club, League & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-emerald-200 font-bold block mb-1">Current Club *</label>
              <input
                type="text"
                required
                value={formData.currentClub || ''}
                onChange={(e) => setFormData({ ...formData, currentClub: e.target.value })}
                placeholder="e.g. Manchester City"
                className="w-full px-3 py-2 bg-[#081f10] border-2 border-[#297a49] rounded-xl text-sm text-white font-bold focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="text-xs text-emerald-200 font-bold block mb-1">Age *</label>
              <input
                type="number"
                required
                min={15}
                max={60}
                value={formData.age || 25}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 25 })}
                className="w-full px-3 py-2 bg-[#081f10] border-2 border-[#297a49] rounded-xl text-sm text-white font-mono font-bold text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-xs text-emerald-200 font-bold block mb-1">League *</label>
              <input
                type="text"
                required
                value={formData.league || ''}
                onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                placeholder="e.g. Premier League, La Liga, Serie A..."
                className="w-full px-3 py-2 bg-[#081f10] border-2 border-[#297a49] rounded-xl text-sm text-white font-bold"
              />
            </div>

            <div>
              <label className="text-xs text-emerald-200 font-bold block mb-1">
                Former Clubs (for Yellow clues, comma-separated)
              </label>
              <input
                type="text"
                value={prevClubsInput}
                onChange={(e) => setPrevClubsInput(e.target.value)}
                placeholder="e.g. Dortmund, Monaco, Chelsea"
                className="w-full px-3 py-2 bg-[#081f10] border-2 border-[#297a49] rounded-xl text-sm text-white font-bold"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
              <input
                type="checkbox"
                checked={formData.isActive ?? true}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-emerald-500 w-4 h-4"
              />
              <span>Active in Daily & Training Pool</span>
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            {selectedPlayer && (
              <button
                type="button"
                onClick={handleNewPlayer}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#144f2c] text-white hover:bg-[#1c633a] border border-[#297a49]"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-headline font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black border-2 border-emerald-300 shadow-md pressable"
            >
              Save Footballer
            </button>
          </div>
        </form>
      </section>

      {/* Footballers Registry Table */}
      <section className="bg-[#0e331c] border-2 border-[#297a49] rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-[#297a49] flex items-center justify-between">
          <h2 className="text-base font-headline font-black text-white">
            Registered Footballers ({players.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-emerald-100">
            <thead className="bg-[#081f10] uppercase text-emerald-300 font-mono font-black border-b border-[#297a49]">
              <tr>
                <th className="p-3">Player</th>
                <th className="p-3">Nat</th>
                <th className="p-3">League</th>
                <th className="p-3">Club</th>
                <th className="p-3">Pos</th>
                <th className="p-3">Age</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#174828]">
              {players.map((p) => (
                <tr key={p.id} className="hover:bg-[#124224] transition-colors">
                  <td className="p-3 flex items-center gap-2">
                    <span className="text-xl">{p.flagEmoji}</span>
                    <span className="font-black text-white">{p.displayName}</span>
                  </td>
                  <td className="p-3 font-mono font-bold">{p.countryCode || p.nationality}</td>
                  <td className="p-3 font-bold text-white">{p.league}</td>
                  <td className="p-3 font-bold text-white">{p.currentClub}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#165330] border border-emerald-400/60 text-white font-mono font-bold">
                      {p.positionAbbr || p.position.substring(0, 3).toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-white">{p.age}y</td>
                  <td className="p-3">
                    <button onClick={() => toggleActiveStatus(p)} className="cursor-pointer">
                      {p.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-300 font-black">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-bold">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleEditPlayer(p)}
                      className="p-1.5 rounded hover:bg-[#1b5e35] text-emerald-300 border border-emerald-400/50"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
