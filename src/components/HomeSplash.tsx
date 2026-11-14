import React from 'react';
import Link from 'next/link';
import { UserStats } from '@/lib/user-stats';
import { Play, RotateCcw, Award, Flame, Trophy, HelpCircle } from 'lucide-react';

interface HomeSplashProps {
  stats: UserStats;
  gameState: 'new' | 'in_progress' | 'completed';
  attemptsCount: number;
  currentDateStr: string;
  countdown: string;
  onStartGame: () => void;
  onViewSummary: () => void;
}

export function HomeSplash({
  stats,
  gameState,
  attemptsCount,
  currentDateStr,
  countdown,
  onStartGame,
  onViewSummary,
}: HomeSplashProps) {
  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  return (
    <div className="w-full min-h-screen flex flex-col justify-between items-center px-4 py-8 relative z-10">
      <div className="w-full max-w-md flex flex-col items-center gap-6 my-auto">
        {/* Matchday Tagline */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0e331c] border border-emerald-400/50 text-[11px] font-mono font-bold text-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>DAILY FIXTURE • {currentDateStr}</span>
        </div>

        {/* Hero Branding */}
        <div className="text-center select-none">
          <h1 className="font-headline text-4xl sm:text-5xl font-black uppercase tracking-[0.16em] text-white flex items-center justify-center drop-shadow-lg">
            <span>F</span>
            <span className="inline-flex items-center gap-[0.14em] mx-[0.1em] select-none">
              <span className="text-[0.74em] leading-none translate-y-[0.05em]">⚽</span>
              <span className="text-[0.74em] leading-none translate-y-[0.05em]">⚽</span>
            </span>
            <span>TBLE</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100 font-medium tracking-wide">
            The Daily Football Player Guessing Game
          </p>
        </div>

        {/* Player Statistics Bar */}
        <div className="w-full bg-[#0a2615] border-2 border-emerald-400/60 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-400/20">
            <span className="text-[11px] font-mono font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              Career Record
            </span>
            <span className="text-[10px] font-mono text-emerald-300">
              Next in {countdown}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-[#0e331c] rounded-xl p-2.5 border border-[#297a49]/60">
              <div className="text-xl sm:text-2xl font-headline font-black text-white">
                {stats.played}
              </div>
              <div className="text-[10px] font-mono text-emerald-200 uppercase font-bold tracking-wider mt-0.5">
                Played
              </div>
            </div>

            <div className="bg-[#0e331c] rounded-xl p-2.5 border border-[#297a49]/60">
              <div className="text-xl sm:text-2xl font-headline font-black text-emerald-300">
                {winRate}%
              </div>
              <div className="text-[10px] font-mono text-emerald-200 uppercase font-bold tracking-wider mt-0.5">
                Win %
              </div>
            </div>

            <div className="bg-[#0e331c] rounded-xl p-2.5 border border-[#297a49]/60">
              <div className="text-xl sm:text-2xl font-headline font-black text-amber-300 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
                {stats.currentStreak}
              </div>
              <div className="text-[10px] font-mono text-emerald-200 uppercase font-bold tracking-wider mt-0.5">
                Streak
              </div>
            </div>

            <div className="bg-[#0e331c] rounded-xl p-2.5 border border-[#297a49]/60">
              <div className="text-xl sm:text-2xl font-headline font-black text-white">
                {stats.maxStreak}
              </div>
              <div className="text-[10px] font-mono text-emerald-200 uppercase font-bold tracking-wider mt-0.5">
                Best
              </div>
            </div>
          </div>
        </div>

        {/* Quick Matchday Rules (10-Second Briefing) */}
        <div className="w-full bg-[#0a2615] border-2 border-emerald-400/40 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-1.5 text-xs font-headline font-black text-white uppercase tracking-wider mb-2.5">
            <HelpCircle className="w-4 h-4 text-emerald-300" />
            <span>How to Play</span>
          </div>

          <p className="text-xs text-emerald-100 mb-3 leading-relaxed">
            Deduce the mystery player in <strong>6 substitution attempts</strong>. Each guess reveals matchday clues:
          </p>

          <div className="space-y-2 text-xs font-sans">
            <div className="flex items-center gap-2.5 bg-[#0e331c] px-3 py-2 rounded-lg border border-emerald-400/40">
              <div className="w-6 h-6 rounded bg-[#15803d] border border-emerald-300 flex items-center justify-center text-xs font-bold text-white shrink-0">
                🟩
              </div>
              <div className="text-emerald-100">
                <strong className="text-white">Exact Match:</strong> League, Club, Nation, Position, or Age
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-[#0e331c] px-3 py-2 rounded-lg border border-yellow-400/30">
              <div className="w-6 h-6 rounded bg-[#ca8a04] border border-yellow-300 flex items-center justify-center text-xs font-bold text-zinc-950 shrink-0">
                🟨
              </div>
              <div className="text-emerald-100">
                <strong className="text-white">Close / Career:</strong> Former club/league, or age within ±2 yrs
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-[#0e331c] px-3 py-2 rounded-lg border border-[#294a34]">
              <div className="w-6 h-6 rounded bg-[#0f1f15] border border-[#294a34] flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                ⬛
              </div>
              <div className="text-emerald-100">
                <strong className="text-slate-200">No Connection:</strong> Attribute has no match
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Button (State-Aware) */}
        <div className="w-full space-y-2.5">
          {gameState === 'completed' ? (
            <button
              onClick={onViewSummary}
              className="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] transition-all text-black font-headline text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl border-2 border-emerald-300 pressable"
            >
              <Award className="w-5 h-5 stroke-[2.5]" />
              View Matchday Summary
            </button>
          ) : gameState === 'in_progress' ? (
            <button
              onClick={onStartGame}
              className="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] transition-all text-black font-headline text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl border-2 border-emerald-300 pressable"
            >
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
              Resume Matchday (Sub {attemptsCount + 1}/6)
            </button>
          ) : (
            <button
              onClick={onStartGame}
              className="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] transition-all text-black font-headline text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl border-2 border-emerald-300 pressable"
            >
              <Play className="w-5 h-5 fill-black stroke-[2.5]" />
              Kick Off Today&apos;s Fixture
            </button>
          )}

          {gameState === 'completed' && (
            <button
              onClick={onStartGame}
              className="w-full py-2.5 text-xs text-emerald-200 hover:text-white font-mono font-bold transition-colors text-center"
            >
              Inspect Pitch Board
            </button>
          )}
        </div>
      </div>

      {/* Touchline Footer Navigation */}
      <footer className="w-full max-w-md pt-4 border-t border-white/10 flex items-center justify-center gap-6 text-xs text-emerald-200/80 font-medium">
        <Link href="/how-to-play" className="hover:text-white transition-colors">
          Full Rules
        </Link>
        <span className="text-emerald-400/40">•</span>
        <Link href="/about" className="hover:text-white transition-colors">
          About
        </Link>
        <span className="text-emerald-400/40">•</span>
        <Link href="/privacy" className="hover:text-white transition-colors">
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
