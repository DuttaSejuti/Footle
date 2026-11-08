'use client';

import React, { useState } from 'react';
import { Trophy, Share2, Check, RotateCcw, Calendar, ExternalLink } from 'lucide-react';
import { Footballer } from '@/types/footballer';
import confetti from 'canvas-confetti';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mysteryPlayer: Footballer;
  score: number;
  cluesUsed: number;
  isWon: boolean;
  gameMode: 'daily' | 'practice';
  onPlayAgainPractice?: () => void;
  dateStr?: string;
}

export function ResultsModal({
  isOpen,
  onClose,
  mysteryPlayer,
  score,
  cluesUsed,
  isWon,
  gameMode,
  onPlayAgainPractice,
  dateStr,
}: ResultsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Trigger celebration confetti on win
  if (isWon && typeof window !== 'undefined') {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  const generateShareText = () => {
    const squares = Array.from({ length: 6 })
      .map((_, i) => {
        if (i < cluesUsed - 1) return '⬛';
        if (i === cluesUsed - 1 && isWon) return '🟩';
        return '⬜';
      })
      .join('');

    const title = gameMode === 'daily' ? `Who's the Footballer? Daily (${dateStr})` : `Who's the Footballer? (Practice)`;
    return `${title}\nScore: ${score}/6 ⚽\nClues: ${cluesUsed}/6\n${squares}\nPlay at: https://whosthefootballer.app`;
  };

  const handleShare = async () => {
    const text = generateShareText();
    // track share click in analytics
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareClicks: 1 }),
      });
    } catch {}

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Who's the Footballer?",
          text: text,
        });
        return;
      } catch (err) {
        // Fall back to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#121e28] border border-[#1e3345] rounded-2xl p-6 shadow-2xl text-center">
        {/* Header Badge */}
        <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-white">
          {isWon ? 'Goooaaal! Spot on!' : 'Full Time! Better luck tomorrow!'}
        </h2>

        <p className="text-sm text-slate-400 mt-1 mb-5">
          {isWon
            ? `You cracked the mystery in ${cluesUsed} clue${cluesUsed > 1 ? 's' : ''}!`
            : 'You surrendered this match, but the mystery is solved!'}
        </p>

        {/* Revealed Player Card */}
        <div className="bg-[#0b1319] border border-[#1e3345] rounded-xl p-4 mb-5 text-left flex items-center gap-4">
          {mysteryPlayer.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mysteryPlayer.imageUrl}
              alt={mysteryPlayer.displayName}
              className="w-16 h-16 rounded-xl object-cover border border-emerald-500/40"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-[#172735] border border-[#1e3345] flex items-center justify-center text-3xl">
              {mysteryPlayer.flagEmoji}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{mysteryPlayer.flagEmoji}</span>
              <h3 className="text-lg font-bold text-white truncate">
                {mysteryPlayer.displayName}
              </h3>
            </div>
            <p className="text-xs text-slate-400 truncate">
              {mysteryPlayer.position} • {mysteryPlayer.currentClub}
            </p>
            {mysteryPlayer.sourceUrl && (
              <a
                href={mysteryPlayer.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline mt-1"
              >
                Learn player bio <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#0b1319] border border-[#1e3345] rounded-xl p-3">
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
              Final Score
            </span>
            <span className="text-2xl font-extrabold text-emerald-400">
              {score} / 6
            </span>
          </div>

          <div className="bg-[#0b1319] border border-[#1e3345] rounded-xl p-3">
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
              Clues Used
            </span>
            <span className="text-2xl font-extrabold text-amber-400">
              {cluesUsed} / 6
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleShare}
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all rounded-xl text-black font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-black" /> Copied to Clipboard!
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5 text-black" /> Share Result
              </>
            )}
          </button>

          {gameMode === 'practice' && onPlayAgainPractice && (
            <button
              onClick={() => {
                onPlayAgainPractice();
                onClose();
              }}
              className="w-full py-3 px-4 bg-[#1b2b3a] hover:bg-[#23384d] rounded-xl text-white font-semibold flex items-center justify-center gap-2 border border-[#2e475e] transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              Play Another Footballer (Practice)
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Review Clues
          </button>
        </div>
      </div>
    </div>
  );
}
