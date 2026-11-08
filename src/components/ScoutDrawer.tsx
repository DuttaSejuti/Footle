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
      1: 'blur(26px)',
      2: 'blur(20px)',
      3: 'blur(15px)',
      4: 'blur(10px)',
      5: 'blur(5px)',
    };
    return blurMap[cluesRevealed] || 'blur(0px)';
  };

  return (
    <div className="w-full">
      {/* Compact Wordle Hint Toggle Bar */}
      <div className="w-full flex items-center justify-between bg-[#121c27] border border-[#213547] rounded-xl px-4 py-2.5 text-xs shadow-sm">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-100">Mystery Footballer</span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline font-mono text-[11px] text-slate-400">
            Top Leagues & International
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#182838] hover:bg-[#20364c] text-emerald-300 font-mono text-xs font-bold transition-all pressable border border-[#274059]"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>Scout Intel ({cluesRevealed}/6)</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Collapsible Silhouette & Clues Intel Drawer */}
      {isOpen && (
        <div className="mt-2 w-full bg-[#0d1620] border border-[#213547] rounded-2xl p-4 shadow-xl animate-clue-enter">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Silhouette box */}
            <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center flex-shrink-0 border border-emerald-500/40 shadow-inner">
              {clues.clue6Photo?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={clues.clue6Photo.imageUrl}
                  alt="Mystery Silhouette"
                  style={{ filter: getBlurStyle() }}
                  className="w-full h-full object-cover transition-all duration-700"
                />
              ) : (
                <span className="text-4xl">{clues.clue1Nationality?.flagEmoji || '⚽'}</span>
              )}
              <span className="absolute inset-0 flex items-center justify-center font-headline text-3xl font-black text-white/20 select-none">
                ?
              </span>
            </div>

            {/* Clue Highlights List */}
            <div className="text-xs text-slate-300 flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-sm">Visual Scout Intel</span>
                {!isGameOver && cluesRevealed < 6 && (
                  <button
                    onClick={onRevealNext}
                    className="px-2 py-0.5 rounded-md bg-emerald-500 text-black font-extrabold text-[10px] hover:bg-emerald-400"
                  >
                    Unlock Clue {cluesRevealed + 1}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-[#14202c] p-2 rounded-lg border border-[#1f3142]">
                  <span className="text-slate-500 block text-[9px] uppercase">Nat</span>
                  <span className="font-bold text-emerald-400">
                    {clues.clue1Nationality?.flagEmoji} {clues.clue1Nationality?.nationality}
                  </span>
                </div>
                <div className="bg-[#14202c] p-2 rounded-lg border border-[#1f3142]">
                  <span className="text-slate-500 block text-[9px] uppercase">Position</span>
                  <span className="font-bold text-slate-200">
                    {cluesRevealed >= 2 ? clues.clue2Position : '🔒 Locked'}
                  </span>
                </div>
              </div>

              {cluesRevealed >= 3 && clues.clue3CurrentClub && (
                <div className="text-[11px] font-mono text-slate-300 pt-0.5">
                  <span className="text-slate-500">Club: </span>
                  <strong className="text-slate-100">{clues.clue3CurrentClub.club}</strong>
                  {clues.clue3CurrentClub.isRetired && ' (Retired)'}
                </div>
              )}

              {cluesRevealed >= 5 && clues.clue5Achievements && (
                <div className="text-[11px] text-slate-300">
                  <span className="text-slate-500 font-mono">Top Trophy: </span>
                  <span className="text-amber-300">{clues.clue5Achievements[0]}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
