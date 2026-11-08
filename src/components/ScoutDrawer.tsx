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
      <div className="w-full flex items-center justify-between bg-[#0e331c] border-2 border-[#297a49] rounded-xl px-4 py-2.5 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-emerald-300 text-base">⚽</span>
          <span className="font-extrabold text-white tracking-wide text-sm">Mystery Footballer</span>
          <span className="text-emerald-400 font-black">•</span>
          <span className="hidden sm:inline font-mono text-xs font-bold text-emerald-200">
            Top 5 European Leagues & FIFA
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-emerald-400/80 bg-[#165330] hover:bg-[#1a633a] text-white font-mono text-xs font-black transition-all pressable shadow-sm"
        >
          <Eye className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
          <span>Tactical Silhouette</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Chalk Tactical Drawer (Collapsible) */}
      {isOpen && (
        <div className="mt-2 w-full bg-[#0a2815] border-2 border-[#297a49] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all animate-clue-enter shadow-xl">
          <div className="relative w-28 h-28 rounded-xl border-2 border-emerald-400 bg-[#0e331c] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
            {clues.clue6Photo?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clues.clue6Photo.imageUrl}
                alt="Player Silhouette"
                style={{ filter: getBlurStyle() }}
                className="w-full h-full object-cover filter contrast-125 opacity-80 transition-all duration-700"
              />
            ) : (
              <span className="text-4xl">{clues.clue1Nationality?.flagEmoji || '⚽'}</span>
            )}
            <span className="absolute inset-0 flex items-center justify-center font-headline text-3xl font-black text-white/40 select-none">
              ?
            </span>
          </div>

          <div className="text-xs flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-white uppercase tracking-wider text-sm">
                Touchline Recon Hint
              </span>
              {!isGameOver && cluesRevealed < 6 && (
                <button
                  onClick={onRevealNext}
                  className="px-2.5 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-xs border border-emerald-300 shadow-sm"
                >
                  Sub Clue {cluesRevealed + 1}
                </button>
              )}
            </div>
            <p className="leading-relaxed text-emerald-100 font-medium">
              Player features sharpen with each chalked substitution. Match demographic columns on the dugout board.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
              <span className="px-2.5 py-1 rounded bg-[#165330] border-2 border-emerald-400 text-white font-black">
                Nat: {clues.clue1Nationality?.flagEmoji} {clues.clue1Nationality?.nationality}
              </span>
              {cluesRevealed >= 2 && (
                <span className="px-2.5 py-1 rounded bg-[#165330] border-2 border-emerald-400 text-white font-black">
                  Pos: {clues.clue2Position}
                </span>
              )}
              {cluesRevealed >= 3 && clues.clue3CurrentClub && (
                <span className="px-2.5 py-1 rounded bg-[#165330] border-2 border-emerald-400 text-white font-black">
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
