'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Check } from 'lucide-react';
import { Footballer, GuessComparison } from '@/types/footballer';
import { UserStats, DEFAULT_STATS } from '@/lib/user-stats';
import confetti from 'canvas-confetti';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mysteryPlayer: Footballer;
  cluesUsed: number;
  isWon: boolean;
  dateStr?: string;
  userStats?: UserStats;
  comparisons?: GuessComparison[];
  onReviewPitch?: () => void;
}

function getStatusEmoji(status: string): string {
  if (status === 'correct') return '🟩';
  if (status === 'partial') return '🟨';
  return '⬛';
}

function getAgeEmoji(status: string, diff?: number): string {
  if (status === 'correct' || diff === 0) return '🟩';
  if (typeof diff === 'number' && Math.abs(diff) <= 2) return '🟨';
  return '⬛';
}

export function ResultsModal({
  isOpen,
  onClose,
  mysteryPlayer,
  cluesUsed,
  isWon,
  dateStr,
  userStats = DEFAULT_STATS,
  comparisons = [],
  onReviewPitch,
}: ResultsModalProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastTimer, setToastTimer] = useState<NodeJS.Timeout | null>(null);

  const winRate = userStats.played > 0 ? Math.round((userStats.wins / userStats.played) * 100) : 0;

  useEffect(() => {
    return () => {
      if (toastTimer) clearTimeout(toastTimer);
    };
  }, [toastTimer]);

  // Trigger celebration confetti on win
  useEffect(() => {
    if (isOpen && isWon && typeof window !== 'undefined') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#16a34a', '#eab308', '#ffffff'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#22c55e', '#facc15', '#f8fafc'],
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen, isWon]);

  if (!isOpen) return null;

  const generateShareText = () => {
    const attemptDisplay = isWon ? `${cluesUsed}/6 ⚽` : 'X/6 🟥';
    let gridRows = '';

    if (comparisons && comparisons.length > 0) {
      gridRows = comparisons
        .map((comp) => {
          return [
            getStatusEmoji(comp.nationality.status),
            getStatusEmoji(comp.league.status),
            getStatusEmoji(comp.club.status),
            getStatusEmoji(comp.position.status),
            getAgeEmoji(comp.age.status, comp.age.diff),
          ].join('');
        })
        .join('\n');
    } else {
      gridRows = Array.from({ length: cluesUsed })
        .map((_, i) => (i === cluesUsed - 1 && isWon ? '🟩🟩🟩🟩🟩' : '⬛⬛⬛⬛⬛'))
        .join('\n');
    }

    const siteUrl =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://footble.vercel.app';

    return `FOOTBLE Daily (#${dateStr}) ${attemptDisplay}\n\n${gridRows}\n\nPlay at: ${siteUrl}`;
  };

  const handleShare = async () => {
    const text = generateShareText();

    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareClicks: 1 }),
      });
    } catch {}

    let success = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        success = true;
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        success = true;
      }
    } catch {
      success = false;
    }

    if (success) {
      setShowToast(true);
      if (toastTimer) clearTimeout(toastTimer);
      const timer = setTimeout(() => setShowToast(false), 2500);
      setToastTimer(timer);
    }
  };

  return (
    <>
      {/* Floating Success Pill Alert - Fixed top center of viewport (horizontally centered, not vertically) */}
      {showToast && (
        <div className="fixed top-6 left-1/2 z-[100] bg-emerald-400 text-black px-5 py-2.5 rounded-full font-headline font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xl border-2 border-white pointer-events-none whitespace-nowrap animate-toast-slide">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Result Copied to Clipboard!</span>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-[#0a2615] border-2 border-emerald-400/80 rounded-2xl p-5 sm:p-6 shadow-2xl text-center">
          {/* Football Celebration Badge */}
        <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2.5">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-net-ripple" />
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#144f2c] border-2 border-emerald-300 flex items-center justify-center shadow-lg animate-goal-kick">
            <span className="text-2xl sm:text-3xl select-none">{isWon ? '⚽' : '🧤'}</span>
          </div>
        </div>

        {/* Stadium Goal Announcement */}
        <h2 className="text-xl sm:text-2xl font-headline font-black text-white tracking-wide uppercase">
          {isWon ? 'GOAL! Top Bins!' : 'Full Time Whistle!'}
        </h2>

        <p className="text-xs text-emerald-200 font-bold mt-1 mb-4">
          {isWon
            ? `Tactical masterclass! Identified in ${cluesUsed}/6 substitutions.`
            : 'Match conceded, but here is today\'s verified footballer!'}
        </p>

        {/* Revealed Player Showcase Card */}
        <div className="bg-[#0e331c] border-2 border-emerald-400 rounded-2xl p-4 mb-4 text-center flex flex-col items-center gap-2.5 shadow-xl">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#081f10] border-2 border-emerald-400 overflow-hidden shadow-lg flex items-center justify-center relative">
            {mysteryPlayer.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mysteryPlayer.imageUrl}
                alt={mysteryPlayer.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d2a17] text-white">
                <span className="text-3xl">{mysteryPlayer.flagEmoji}</span>
                <span className="text-[10px] text-emerald-300/80 font-mono font-bold mt-1 uppercase tracking-wider">
                  No Photo
                </span>
              </div>
            )}
          </div>

          <div className="w-full">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">{mysteryPlayer.flagEmoji}</span>
              <h3 className="text-base sm:text-lg font-headline font-black text-white">
                {mysteryPlayer.displayName}
              </h3>
            </div>
            <p className="text-xs text-emerald-200 font-bold mt-0.5">
              {mysteryPlayer.position} • {mysteryPlayer.currentClub}
            </p>
            <p className="text-xs text-emerald-300 font-mono font-bold mt-0.5">
              {mysteryPlayer.league} • {mysteryPlayer.age} years old
            </p>
          </div>
        </div>

        {/* Wordle-Style STATISTICS Section */}
        <div className="bg-[#0e331c] border-2 border-[#297a49] rounded-2xl p-4 mb-4 shadow-sm text-center">
          <h3 className="font-headline font-black text-xs uppercase tracking-widest text-emerald-200 mb-3">
            STATISTICS
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center select-none">
            <div
              className="flex flex-col items-center"
              aria-label={`Number of games played, ${userStats.played}`}
            >
              <span className="font-headline text-2xl sm:text-3xl font-black text-white leading-tight">
                {userStats.played}
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-200 uppercase tracking-wider mt-0.5">
                Played
              </span>
            </div>

            <div
              className="flex flex-col items-center"
              aria-label={`Win percentage, ${winRate}`}
            >
              <span className="font-headline text-2xl sm:text-3xl font-black text-emerald-300 leading-tight">
                {winRate}
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-200 uppercase tracking-wider mt-0.5">
                Win %
              </span>
            </div>

            <div
              className="flex flex-col items-center"
              aria-label={`Current Streak count, ${userStats.currentStreak}`}
            >
              <span className="font-headline text-2xl sm:text-3xl font-black text-amber-300 leading-tight">
                {userStats.currentStreak}
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-200 uppercase tracking-wider mt-0.5 leading-tight">
                Current Streak
              </span>
            </div>

            <div
              className="flex flex-col items-center"
              aria-label={`Max Streak count, ${userStats.maxStreak}`}
            >
              <span className="font-headline text-2xl sm:text-3xl font-black text-white leading-tight">
                {userStats.maxStreak}
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-200 uppercase tracking-wider mt-0.5 leading-tight">
                Max Streak
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleShare}
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] transition-all rounded-xl text-black font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg border-2 border-emerald-300 pressable"
          >
            {showToast ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" /> Result Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 stroke-[3]" /> Share Matchday Result
              </>
            )}
          </button>

          <button
            onClick={onReviewPitch || onClose}
            className="w-full py-2.5 text-xs text-emerald-200 hover:text-white transition-colors font-bold rounded-lg hover:bg-white/5"
          >
            Review Pitch Board
          </button>
        </div>
      </div>
    </div>
  </>
);
}
