'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Check, RotateCcw, ExternalLink } from 'lucide-react';
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

  // Trigger celebration confetti EXACTLY ONCE or TWICE (not looping)
  useEffect(() => {
    if (isOpen && isWon && typeof window !== 'undefined') {
      // Burst 1: immediate football turf celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#16a34a', '#eab308', '#ffffff'],
      });

      // Burst 2: second subtle celebratory volley 300ms later, then stop completely
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
    const squares = Array.from({ length: 6 })
      .map((_, i) => {
        if (i < cluesUsed - 1) return '⬛';
        if (i === cluesUsed - 1 && isWon) return '🟩';
        return '⬜';
      })
      .join('');

    const title =
      gameMode === 'daily'
        ? `FOOTYDLE Daily (#${dateStr})`
        : `FOOTYDLE (Training Match)`;
    return `${title}\nScore: ${score}/6 ⚽\nAttempts: ${cluesUsed}/6\n${squares}\nPlay at: https://whosthefootballer.app`;
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

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FOOTYDLE',
          text: text,
        });
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0a2615] border-2 border-emerald-400/80 rounded-2xl p-6 shadow-2xl text-center">
        {/* Football Celebration Badge with Goal Kick Animation */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center mb-3">
          {/* Subtle goal net ripple ring */}
          <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-net-ripple" />
          <div className="w-16 h-16 rounded-full bg-[#144f2c] border-2 border-emerald-300 flex items-center justify-center shadow-lg animate-goal-kick">
            <span className="text-3xl select-none">{isWon ? '⚽' : '🧤'}</span>
          </div>
        </div>

        {/* Stadium Goal Announcement */}
        <h2 className="text-2xl font-headline font-black text-white tracking-wide uppercase">
          {isWon ? 'GOAL! Top Bins!' : 'Full Time Whistle!'}
        </h2>

        <p className="text-xs text-emerald-200 font-bold mt-1 mb-5">
          {isWon
            ? `Tactical masterclass! Identified in ${cluesUsed}/6 substitutions.`
            : 'Match conceded, but here is today\'s verified footballer!'}
        </p>

        {/* Revealed Player Card */}
        <div className="bg-[#0e331c] border-2 border-emerald-400/70 rounded-xl p-4 mb-5 text-left flex items-center gap-4 shadow-inner">
          {mysteryPlayer.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mysteryPlayer.imageUrl}
              alt={mysteryPlayer.displayName}
              className="w-16 h-16 rounded-lg object-cover border-2 border-emerald-400"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-[#165330] border-2 border-emerald-400 flex items-center justify-center text-3xl">
              {mysteryPlayer.flagEmoji}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{mysteryPlayer.flagEmoji}</span>
              <h3 className="text-base font-black text-white truncate">
                {mysteryPlayer.displayName}
              </h3>
            </div>
            <p className="text-xs text-emerald-100 font-bold truncate mt-0.5">
              {mysteryPlayer.position} • {mysteryPlayer.currentClub}
            </p>
            <p className="text-[11px] text-emerald-300 font-mono font-semibold truncate">
              {mysteryPlayer.league} • {mysteryPlayer.age} years old
            </p>
            {mysteryPlayer.sourceUrl && (
              <a
                href={mysteryPlayer.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-yellow-300 hover:underline mt-1 font-bold"
              >
                Official player bio <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Tactical Match Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-[#0e331c] border-2 border-[#297a49] rounded-xl p-3 shadow-sm">
            <span className="text-[10px] text-emerald-200 font-black uppercase tracking-wider block mb-1">
              Match Points
            </span>
            <span className="text-2xl font-headline font-black text-emerald-300">
              {score} / 6
            </span>
          </div>

          <div className="bg-[#0e331c] border-2 border-[#297a49] rounded-xl p-3 shadow-sm">
            <span className="text-[10px] text-emerald-200 font-black uppercase tracking-wider block mb-1">
              Subs Used
            </span>
            <span className="text-2xl font-headline font-black text-yellow-300">
              {cluesUsed} / 6
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleShare}
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] transition-all rounded-xl text-black font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg border-2 border-emerald-300 pressable"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" /> Result Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 stroke-[3]" /> Share Matchday Result
              </>
            )}
          </button>

          {gameMode === 'practice' && onPlayAgainPractice && (
            <button
              onClick={() => {
                onPlayAgainPractice();
                onClose();
              }}
              className="w-full py-3 px-4 bg-[#144f2c] hover:bg-[#1a633a] rounded-xl text-white font-black text-xs flex items-center justify-center gap-2 border-2 border-emerald-400/80 transition-colors pressable"
            >
              <RotateCcw className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
              New Training Fixture
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-emerald-200 hover:text-white transition-colors font-bold"
          >
            Review Pitch Board
          </button>
        </div>
      </div>
    </div>
  );
}
