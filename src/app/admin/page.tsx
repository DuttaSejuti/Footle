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
  Eye,
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
  const [previewPlayer, setPreviewPlayer] = useState<Footballer | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [scheduledPlayerId, setScheduledPlayerId] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Footballer>>({
    id: '',
    fullName: '',
    displayName: '',
    alternativeNames: [],
    nationality: '',
    countryCode: '',
    flagEmoji: '⚽',
    position: 'Forward',
    currentClub: '',
    isRetired: false,
    previousClubs: [],
    achievements: [],
    imageUrl: '',
    imageAttribution: '',
    imageLicense: '',
    sourceUrl: '',
    difficulty: 'Easy',
    isActive: true,
  });

  const [altNamesInput, setAltNamesInput] = useState('');
  const [prevClubsInput, setPrevClubsInput] = useState('');
  const [achievementsInput, setAchievementsInput] = useState('');

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

        // Fetch analytics
        const aRes = await fetch('/api/analytics');
        const aData = await aRes.json();
        setAnalytics(aData);
      } else {
        setMessage('Invalid admin password. Default in local dev is: footle-admin-pass');
      }
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleEditPlayer = (p: Footballer) => {
    setSelectedPlayer(p);
    setFormData(p);
    setAltNamesInput(p.alternativeNames.join(', '));
    setPrevClubsInput(p.previousClubs.join(', '));
    setAchievementsInput(p.achievements.join('\n'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewPlayer = () => {
    setSelectedPlayer(null);
    setFormData({
      id: '',
      fullName: '',
      displayName: '',
      alternativeNames: [],
      nationality: '',
      countryCode: '',
      flagEmoji: '⚽',
      position: 'Forward',
      currentClub: '',
      isRetired: false,
      previousClubs: [],
      achievements: [],
      imageUrl: '',
      imageAttribution: '',
      imageLicense: '',
      sourceUrl: '',
      difficulty: 'Easy',
      isActive: true,
    });
    setAltNamesInput('');
    setPrevClubsInput('');
    setAchievementsInput('');
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

    const playerToSave: Footballer = {
      ...(formData as Footballer),
      id: playerId,
      alternativeNames: altNamesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      previousClubs: prevClubsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      achievements: achievementsInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
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
        setMessage(`Player "${playerToSave.displayName}" saved successfully!`);
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
        setMessage(`Assigned player for ${scheduleDate} successfully!`);
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
      <main className="min-h-screen px-4 py-12 max-w-md mx-auto text-white flex flex-col justify-center">
        <div className="bg-[#121e28] border border-[#1e3345] rounded-2xl p-6 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-center mb-1">Admin Portal</h1>
          <p className="text-xs text-slate-400 text-center mb-6">
            Enter administrative password to manage footballers, schedule matches, and review image rights.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Admin password (default: footle-admin-pass)"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-4 py-3 bg-[#0b1319] border border-[#1e3345] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
            {message && <p className="text-xs text-rose-400">{message}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm rounded-xl transition-colors"
            >
              Enter Admin Portal
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-white">
              Back to Game
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 max-w-4xl mx-auto text-white pb-24">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e3345]">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <span>Footle Admin Manager</span>
          </h1>
        </div>
        <button
          onClick={handleNewPlayer}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-lg flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" /> Add Footballer
        </button>
      </div>

      {message && (
        <div className="mb-6 p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm rounded-xl">
          {message}
        </div>
      )}

      {/* Analytics Overview */}
      {analytics && (
        <section className="mb-8 bg-[#121e28] border border-[#1e3345] rounded-2xl p-4">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Platform Analytics & Usage</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-[#0b1319] rounded-xl border border-[#1e3345]">
              <span className="text-[11px] text-slate-400 block">Total Visitors</span>
              <span className="text-xl font-bold text-white">{analytics.dailyVisitors}</span>
            </div>
            <div className="p-3 bg-[#0b1319] rounded-xl border border-[#1e3345]">
              <span className="text-[11px] text-slate-400 block">Games Completed</span>
              <span className="text-xl font-bold text-emerald-400">{analytics.gamesCompleted}</span>
            </div>
            <div className="p-3 bg-[#0b1319] rounded-xl border border-[#1e3345]">
              <span className="text-[11px] text-slate-400 block">Practice vs Daily</span>
              <span className="text-sm font-bold text-slate-200">
                {analytics.practiceCount}P / {analytics.dailyCount}D
              </span>
            </div>
            <div className="p-3 bg-[#0b1319] rounded-xl border border-[#1e3345]">
              <span className="text-[11px] text-slate-400 block">Share Clicks</span>
              <span className="text-xl font-bold text-amber-400">{analytics.shareClicks}</span>
            </div>
          </div>
        </section>
      )}

      {/* Daily Challenge Scheduler */}
      <section className="mb-8 bg-[#121e28] border border-[#1e3345] rounded-2xl p-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Schedule Daily Mystery Players</span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-[#0b1319] border border-[#1e3345] rounded-xl text-sm text-white"
          />
          <select
            value={scheduledPlayerId || schedule[scheduleDate] || ''}
            onChange={(e) => setScheduledPlayerId(e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 bg-[#0b1319] border border-[#1e3345] rounded-xl text-sm text-white"
          >
            <option value="">-- Choose Footballer --</option>
            {players
              .filter((p) => p.isActive)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.flagEmoji} {p.displayName} ({p.currentClub})
                </option>
              ))}
          </select>
          <button
            onClick={handleAssignSchedule}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm rounded-xl whitespace-nowrap"
          >
            Assign Date
          </button>
        </div>
      </section>

      {/* Add / Edit Footballer Form */}
      <section className="mb-8 bg-[#121e28] border border-[#1e3345] rounded-2xl p-5">
        <h2 className="text-base font-bold text-white mb-4">
          {selectedPlayer ? `Edit Player: ${selectedPlayer.displayName}` : 'Add New Footballer'}
        </h2>

        <form onSubmit={handleSavePlayer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Display Name *</label>
              <input
                type="text"
                required
                value={formData.displayName || ''}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="e.g. Lionel Messi"
                className="w-full px-3 py-2 bg-[#0b1319] border border-[#1e3345] rounded-xl text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Full Legal Name</label>
              <input
                type="text"
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Lionel Andrés Messi"
                className="w-full px-3 py-2 bg-[#0b1319] border border-[#1e3345] rounded-xl text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Alternative Names & Aliases (comma-separated for autocomplete matching)
            </label>
            <input
              type="text"
              value={altNamesInput}
              onChange={(e) => setAltNamesInput(e.target.value)}
              placeholder="e.g. Leo Messi, La Pulga, Messi"
              className="w-full px-3 py-2 bg-[#0b1319] border border-[#1e3345] rounded-xl text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nationality</label>
              <input
                type="text"
                value={formData.nationality || ''}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder="e.g. Argentina"
                className="w-full px-3 py-2 bg-[#0b1319] border border-[#1e3345] rounded-xl text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Country ISO Code & Flag Emoji</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.countryCode || ''}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  placeholder="AR"
                  className="w-20 px-3 py-2 bg-[#0b1319] border border-[#1e3345] rounded-xl text-sm text-white"
                />
                <input
                  type="text"
                  value={formData.flagEmoji || ''}
                  onChange={(e) => setFormData({ ...formData, flagEmoji: e.target.value })}
                  placeholder="🇦🇷"
                  className="w-20 px-3 py-2 bg-[#0b1319] border border-[#1e3345] rounded-xl text-sm text-white text-center"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Position</label>
              <select
                value={formData.position || 'Forward'}
                onChange={(e: any) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 bg-[#0b1319] border border-[#1e3345] rounded-xl text-sm text-white"
              >
                <option value="Forward">Forward</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Defender">Defender</option>
                <option value="Goalkeeper">Goalkeeper</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Current or Most Recent Club</label>
              <input
                type="text"
                value={formData.currentClub || ''}
                onChange={(e) => setFormData({ ...formData, currentClub: e.target.value })}
                placeholder="e.g. Inter Miami"
                className="w-full px-3 py-2 bg-[#0b1319] border border-[#1e3345] rounded-xl text-sm text-white"
              />
            </div>
            <div className="flex items-center gap-4 pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={formData.isRetired || false}
                  onChange={(e) => setFormData({ ...formData, isRetired: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-0"
                />
                <span>Retired Legend</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-0"
                />
                <span>Active in Game Pool</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Previous Clubs in Chronological Order (comma-separated)
            </label>
            <input
              type="text"
              value={prevClubsInput}
              onChange={(e) => setPrevClubsInput(e.target.value)}
              placeholder="e.g. Barcelona, Paris Saint-Germain"
              className="w-full px-3 py-2 bg-[#0b1319] border border-[#1e3345] rounded-xl text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Achievements / Honours (one per line)
            </label>
            <textarea
              rows={3}
              value={achievementsInput}
              onChange={(e) => setAchievementsInput(e.target.value)}
              placeholder="e.g. 8x Ballon d'Or winner&#10;2022 FIFA World Cup champion"
              className="w-full px-3 py-2 bg-[#0b1319] border border-[#1e3345] rounded-xl text-sm text-white font-mono text-xs"
            />
          </div>

          {/* Image Licensing & Rights Section */}
          <div className="p-4 bg-[#0d1620] border border-[#1e3345] rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Image Licensing & Personality Rights (Strict Compliance)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Only register images with reviewed commercial/creative commons licensing (e.g. Unsplash, Wikimedia Commons, Pexels). If none, leave empty to enable Image-Free gameplay.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 bg-[#0b1319] border border-[#1e3345] rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Image Attribution</label>
                <input
                  type="text"
                  value={formData.imageAttribution || ''}
                  onChange={(e) => setFormData({ ...formData, imageAttribution: e.target.value })}
                  placeholder="e.g. Photographer Name / Source"
                  className="w-full px-3 py-1.5 bg-[#0b1319] border border-[#1e3345] rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Licence Type</label>
                <input
                  type="text"
                  value={formData.imageLicense || ''}
                  onChange={(e) => setFormData({ ...formData, imageLicense: e.target.value })}
                  placeholder="e.g. CC BY-SA 4.0 / Free License"
                  className="w-full px-3 py-1.5 bg-[#0b1319] border border-[#1e3345] rounded-lg text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            {selectedPlayer && (
              <button
                type="button"
                onClick={handleNewPlayer}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400"
            >
              Save Footballer
            </button>
          </div>
        </form>
      </section>

      {/* Footballers Registry Table */}
      <section className="bg-[#121e28] border border-[#1e3345] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#1e3345] flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            Registered Footballers ({players.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0e1720] uppercase text-slate-400 border-b border-[#1e3345]">
              <tr>
                <th className="p-3">Player</th>
                <th className="p-3">Position</th>
                <th className="p-3">Club</th>
                <th className="p-3">Image Rights</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2b3a]">
              {players.map((p) => (
                <tr key={p.id} className="hover:bg-[#162533] transition-colors">
                  <td className="p-3 flex items-center gap-2">
                    <span className="text-xl">{p.flagEmoji}</span>
                    <div>
                      <span className="font-bold text-white block">{p.displayName}</span>
                      <span className="text-[10px] text-slate-400">{p.nationality}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {p.position}
                    </span>
                  </td>
                  <td className="p-3">{p.currentClub}</td>
                  <td className="p-3">
                    {p.imageUrl ? (
                      <span className="text-emerald-400 font-medium">Approved Photo</span>
                    ) : (
                      <span className="text-slate-500 italic">Image-Free Mode</span>
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleActiveStatus(p)}
                      className="cursor-pointer"
                    >
                      {p.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => setPreviewPlayer(p)}
                      className="p-1.5 rounded hover:bg-slate-700 text-slate-300"
                      title="Preview 6 Clues"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditPlayer(p)}
                      className="p-1.5 rounded hover:bg-slate-700 text-emerald-400"
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

      {/* Clue Preview Modal */}
      {previewPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121e28] border border-[#1e3345] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span>{previewPlayer.flagEmoji}</span>
              <span>Clue Preview: {previewPlayer.displayName}</span>
            </h3>
            <div className="space-y-2 text-xs text-slate-300 max-h-[70vh] overflow-y-auto pr-1">
              <div className="p-2 bg-[#0b1319] rounded-lg">
                <strong>Clue 1 (Nationality):</strong> {previewPlayer.nationality} ({previewPlayer.flagEmoji})
              </div>
              <div className="p-2 bg-[#0b1319] rounded-lg">
                <strong>Clue 2 (Position):</strong> {previewPlayer.position}
              </div>
              <div className="p-2 bg-[#0b1319] rounded-lg">
                <strong>Clue 3 (Club):</strong> {previewPlayer.currentClub} {previewPlayer.isRetired && '(Retired)'}
              </div>
              <div className="p-2 bg-[#0b1319] rounded-lg">
                <strong>Clue 4 (Previous):</strong> {previewPlayer.previousClubs.join(' → ') || 'None (One-club)'}
              </div>
              <div className="p-2 bg-[#0b1319] rounded-lg">
                <strong>Clue 5 (Achievements):</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {previewPlayer.achievements.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
              <div className="p-2 bg-[#0b1319] rounded-lg">
                <strong>Clue 6 (Photo):</strong> {previewPlayer.imageUrl || 'Image-free mode'}
              </div>
            </div>
            <button
              onClick={() => setPreviewPlayer(null)}
              className="mt-4 w-full py-2 bg-emerald-500 text-black font-bold text-xs rounded-xl"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
