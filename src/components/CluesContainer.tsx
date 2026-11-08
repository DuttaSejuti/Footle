'use client';

import React from 'react';
import { Globe, UserCheck, Shield, History, Trophy, Image as ImageIcon, Lock, HelpCircle } from 'lucide-react';

interface CluesContainerProps {
  currentClueIndex: number; // 1 to 6
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
  isGameOver: boolean;
}

export function CluesContainer({ currentClueIndex, clues, isGameOver }: CluesContainerProps) {
  // 6 blur stages:
  // stage 1: blur(32px)
  // stage 2: blur(24px)
  // stage 3: blur(18px)
  // stage 4: blur(12px)
  // stage 5: blur(6px)
  // stage 6 or game over: blur(0px)
  const getBlurStyle = () => {
    if (isGameOver) return 'blur(0px)';
    if (currentClueIndex >= 6) return 'blur(3px)';
    const blurMap: Record<number, string> = {
      1: 'blur(32px)',
      2: 'blur(24px)',
      3: 'blur(18px)',
      4: 'blur(12px)',
      5: 'blur(6px)',
    };
    return blurMap[currentClueIndex] || 'blur(0px)';
  };

  return (
    <div className="w-full space-y-3">
      {/* Clue 1: Nationality */}
      <div className={`p-4 rounded-xl border transition-all duration-300 ${
        currentClueIndex >= 1
          ? 'bg-[#121e28] border-[#1e3345] shadow-md animate-reveal'
          : 'bg-[#0e1720]/50 border-slate-800/40 opacity-40'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Globe className="w-4 h-4" />
            <span>Clue 1 • Nationality & Flag</span>
          </div>
          <span className="text-xs font-mono text-slate-400">6 Pts</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-3xl">{clues.clue1Nationality?.flagEmoji || '🏳️'}</span>
          <div>
            <div className="text-lg font-bold text-white tracking-wide">
              {clues.clue1Nationality?.nationality}
            </div>
            <div className="text-xs text-slate-400">Country of International Representation</div>
          </div>
        </div>
      </div>

      {/* Clue 2: Position */}
      <div className={`p-4 rounded-xl border transition-all duration-300 ${
        currentClueIndex >= 2
          ? 'bg-[#121e28] border-[#1e3345] shadow-md animate-reveal'
          : 'bg-[#0e1720]/40 border-slate-800/30 opacity-40'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <UserCheck className="w-4 h-4" />
            <span>Clue 2 • Tactical Position</span>
          </div>
          <span className="text-xs font-mono text-slate-400">5 Pts</span>
        </div>
        {currentClueIndex >= 2 ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-base">
              {clues.clue2Position}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-slate-500 italic mt-1">
            <Lock className="w-3.5 h-3.5" /> Reveal next to unlock position
          </div>
        )}
      </div>

      {/* Clue 3: Current / Last Club */}
      <div className={`p-4 rounded-xl border transition-all duration-300 ${
        currentClueIndex >= 3
          ? 'bg-[#121e28] border-[#1e3345] shadow-md animate-reveal'
          : 'bg-[#0e1720]/40 border-slate-800/30 opacity-40'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Shield className="w-4 h-4" />
            <span>Clue 3 • Current / Most Recent Club</span>
          </div>
          <span className="text-xs font-mono text-slate-400">4 Pts</span>
        </div>
        {currentClueIndex >= 3 ? (
          <div className="flex items-center gap-2 mt-1">
            <div className="text-lg font-bold text-white">
              {clues.clue3CurrentClub?.club}
            </div>
            {clues.clue3CurrentClub?.isRetired && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-400/20">
                Retired Legend
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-slate-500 italic mt-1">
            <Lock className="w-3.5 h-3.5" /> Reveal next to unlock club
          </div>
        )}
      </div>

      {/* Clue 4: Career History */}
      <div className={`p-4 rounded-xl border transition-all duration-300 ${
        currentClueIndex >= 4
          ? 'bg-[#121e28] border-[#1e3345] shadow-md animate-reveal'
          : 'bg-[#0e1720]/40 border-slate-800/30 opacity-40'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <History className="w-4 h-4" />
            <span>Clue 4 • Previous Clubs (Chronological)</span>
          </div>
          <span className="text-xs font-mono text-slate-400">3 Pts</span>
        </div>
        {currentClueIndex >= 4 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {clues.clue4PreviousClubs && clues.clue4PreviousClubs.length > 0 ? (
              clues.clue4PreviousClubs.map((club, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-sm rounded-lg bg-[#182736] border border-[#23384d] text-slate-200 font-medium"
                >
                  {club}
                  {idx < clues.clue4PreviousClubs!.length - 1 && (
                    <span className="text-slate-500 ml-2">→</span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">One-club loyal legend! No prior senior clubs.</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-slate-500 italic mt-1">
            <Lock className="w-3.5 h-3.5" /> Reveal next to unlock career clubs
          </div>
        )}
      </div>

      {/* Clue 5: Major Achievements */}
      <div className={`p-4 rounded-xl border transition-all duration-300 ${
        currentClueIndex >= 5
          ? 'bg-[#121e28] border-[#1e3345] shadow-md animate-reveal'
          : 'bg-[#0e1720]/40 border-slate-800/30 opacity-40'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Trophy className="w-4 h-4" />
            <span>Clue 5 • Major Honours & Records</span>
          </div>
          <span className="text-xs font-mono text-slate-400">2 Pts</span>
        </div>
        {currentClueIndex >= 5 ? (
          <ul className="mt-2 space-y-1.5">
            {clues.clue5Achievements?.map((achievement, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-200">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{achievement}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-2 text-sm text-slate-500 italic mt-1">
            <Lock className="w-3.5 h-3.5" /> Reveal next to unlock trophy cabinet
          </div>
        )}
      </div>

      {/* Clue 6: Photo Reveal */}
      <div className={`p-4 rounded-xl border transition-all duration-300 ${
        currentClueIndex >= 6 || isGameOver
          ? 'bg-[#121e28] border-[#1e3345] shadow-md animate-reveal'
          : 'bg-[#0e1720]/40 border-slate-800/30 opacity-40'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <ImageIcon className="w-4 h-4" />
            <span>Clue 6 • Progressive Photo Reveal</span>
          </div>
          <span className="text-xs font-mono text-slate-400">1 Pt</span>
        </div>

        {currentClueIndex >= 6 || isGameOver ? (
          <div className="mt-2 flex flex-col items-center">
            {clues.clue6Photo?.imageUrl ? (
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={clues.clue6Photo.imageUrl}
                  alt="Mystery Footballer"
                  style={{ filter: getBlurStyle() }}
                  className="w-full h-full object-cover transition-all duration-700 ease-out"
                />
              </div>
            ) : (
              <div className="w-48 h-36 rounded-xl border border-dashed border-[#23384d] flex flex-col items-center justify-center p-4 text-center bg-[#0d1620]">
                <HelpCircle className="w-8 h-8 text-slate-500 mb-1" />
                <span className="text-xs text-slate-400">
                  Image-free mystery player. Verified licensing policy upheld.
                </span>
              </div>
            )}

            {clues.clue6Photo?.imageAttribution && (
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                Photo: {clues.clue6Photo.imageAttribution} ({clues.clue6Photo.imageLicense})
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-slate-500 italic mt-1">
            <Lock className="w-3.5 h-3.5" /> Reach final clue to view player silhouette photo
          </div>
        )}
      </div>
    </div>
  );
}
