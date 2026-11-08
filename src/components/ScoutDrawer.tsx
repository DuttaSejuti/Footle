'use client';

import React, { useState } from 'react';
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface ScoutDrawerProps {
  clues: {
    clue1Nationality?: { nationality: string; countryCode: string; flagEmoji: string };
    clue2Position?: string;
    clue3CurrentClub?: { club: string; isRetired: boolean };
    clue4PreviousClubs?: string[];
    clue5Achievements?: string[];
    clue6Photo?: {
      imageUrl?: string | null;
      imageAttribution?: string | null;
      imageLicense?: string | null;
      hasPhoto: boolean;
    };
  };
  cluesRevealed: number;
  onRevealNext: () => void;
  isGameOver: boolean;
}

export function ScoutDrawer({ clues, cluesRevealed, onRevealNext, isGameOver }: ScoutDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getBlurStyle = () => {
    if (isGameOver) return 'blur(0px)';
    if (cluesRevealed >= 6) return 'blur(2px)';
    const blurMap: Record<number, string> = {
      1: 'blur(24px)',
      2: 'blur(18px)',
      3: 'blur(13px)',
      4: 'blur(8px)',
      5: 'blur(4px)',
    };
    return blurMap[cluesRevealed] || 'blur(0px)';
  };

  return (
    <div className="w-full">
      {/* Pitch Scouting Drawer / Hint bar */}
      <div className="w-full flex items-center justify-between bg-turf-dark/85 border border-turf-border rounded-lg px-3.5 py-2 text-xs">
        <div className="flex items-center gap-2 text-turf-muted">
          <span className="text-emerald-400 text-sm">⚽</span>
          <span className="font-semibold text-white tracking-wide">Mystery Footballer</span>
          <span className="text-turf-border">•</span>
          <span className="hidden sm:inline font-mono text-[11px] text-emerald-200/70">
            Top 5 European Leagues & FIFA
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-turf-border bg-turf-base hover:bg-turf-stripe hover:border-turf-chalk/30 text-emerald-300 font-mono text-[11px] font-semibold transition-all pressable"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tactical Silhouette</span>
          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Chalk Tactical Drawer (Collapsible) */}
      {isOpen && (
        <div className="mt-2 w-full bg-turf-dark/95 border border-turf-border/80 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all animate-clue-enter">
          <div className="relative w-24 h-24 rounded border border-turf-border bg-turf-base flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
            {clues.clue6Photo?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clues.clue6Photo.imageUrl}
                alt="Player Silhouette"
                style={{ filter: getBlurStyle() }}
                className="w-full h-full object-cover filter contrast-125 opacity-75 transition-all duration-700"
              />
            ) : (
              <span className="text-4xl">{clues.clue1Nationality?.flagEmoji || '⚽'}</span>
            )}
            <span className="absolute inset-0 flex items-center justify-center font-headline text-2xl font-black text-white/30 select-none">
              ?
            </span>
          </div>

          <div className="text-xs text-turf-muted flex flex-col gap-1.5 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase tracking-wider text-xs">
                Touchline Recon Hint
              </span>
              {!isGameOver && cluesRevealed < 6 && (
                <button
                  onClick={onRevealNext}
                  className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-[10px] border border-emerald-400"
                >
                  Sub Clue {cluesRevealed + 1}
                </button>
              )}
            </div>
            <p className="leading-relaxed">
              Player features sharpen with each chalked substitution. Match demographic columns on the dugout board.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-turf-base border border-turf-border text-emerald-300">
                Nat: {clues.clue1Nationality?.flagEmoji} {clues.clue1Nationality?.nationality}
              </span>
              {cluesRevealed >= 2 && (
                <span className="px-2 py-0.5 rounded bg-turf-base border border-turf-border text-white">
                  Pos: {clues.clue2Position}
                </span>
              )}
              {cluesRevealed >= 3 && clues.clue3CurrentClub && (
                <span className="px-2 py-0.5 rounded bg-turf-base border border-turf-border text-white">
                  Club: {clues.clue3CurrentClub.club}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
