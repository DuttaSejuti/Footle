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
  const getBlurStyle = () => {
    if (isGameOver) return 'blur(0px)';
    if (currentClueIndex >= 6) return 'blur(2px)';
    const blurMap: Record<number, string> = {
      1: 'blur(28px)',
      2: 'blur(22px)',
      3: 'blur(16px)',
      4: 'blur(10px)',
      5: 'blur(5px)',
    };
    return blurMap[currentClueIndex] || 'blur(0px)';
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Clue 1: Nationality */}
      <div
        className={`p-4 rounded-2xl transition-all duration-200 card-specular ${
          currentClueIndex >= 1 ? 'animate-clue-enter' : 'opacity-35'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clue 1 • Nationality & Flag</span>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            6 Pts
          </span>
        </div>
        <div className="flex items-center gap-3.5 mt-2">
          <span className="text-3xl drop-shadow-sm select-none">
            {clues.clue1Nationality?.flagEmoji || '🏳️'}
          </span>
          <div>
            <div className="text-base font-extrabold text-slate-100 tracking-tight">
              {clues.clue1Nationality?.nationality}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">International Representation</div>
          </div>
        </div>
      </div>

      {/* Clue 2: Position */}
      <div
        className={`p-4 rounded-2xl transition-all duration-200 card-specular ${
          currentClueIndex >= 2 ? 'animate-clue-enter' : 'opacity-35'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clue 2 • Tactical Position</span>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            5 Pts
          </span>
        </div>
        {currentClueIndex >= 2 ? (
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-xl bg-emerald-400/10 text-emerald-300 border border-emerald-500/30 font-bold text-sm">
              {clues.clue2Position}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
            <Lock className="w-3.5 h-3.5" /> Reveal next clue to unlock role
          </div>
        )}
      </div>

      {/* Clue 3: Current / Last Club */}
      <div
        className={`p-4 rounded-2xl transition-all duration-200 card-specular ${
          currentClueIndex >= 3 ? 'animate-clue-enter' : 'opacity-35'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clue 3 • Current / Most Recent Club</span>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            4 Pts
          </span>
        </div>
        {currentClueIndex >= 3 ? (
          <div className="mt-2 flex items-center gap-2.5">
            <div className="text-base font-bold text-slate-100">
              {clues.clue3CurrentClub?.club}
            </div>
            {clues.clue3CurrentClub?.isRetired && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/30">
                Retired Legend
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
            <Lock className="w-3.5 h-3.5" /> Reveal next clue to unlock club
          </div>
        )}
      </div>

      {/* Clue 4: Career History */}
      <div
        className={`p-4 rounded-2xl transition-all duration-200 card-specular ${
          currentClueIndex >= 4 ? 'animate-clue-enter' : 'opacity-35'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clue 4 • Previous Clubs (Chronological)</span>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            3 Pts
          </span>
        </div>
        {currentClueIndex >= 4 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {clues.clue4PreviousClubs && clues.clue4PreviousClubs.length > 0 ? (
              clues.clue4PreviousClubs.map((club, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs rounded-lg bg-[#14222f] border border-[#21374a] text-slate-200 font-semibold"
                >
                  {club}
                  {idx < clues.clue4PreviousClubs!.length - 1 && (
                    <span className="text-emerald-400/60 ml-2">→</span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">One-club loyal legend! No prior senior clubs.</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
            <Lock className="w-3.5 h-3.5" /> Reveal next clue to unlock previous transfers
          </div>
        )}
      </div>

      {/* Clue 5: Major Honours */}
      <div
        className={`p-4 rounded-2xl transition-all duration-200 card-specular ${
          currentClueIndex >= 5 ? 'animate-clue-enter' : 'opacity-35'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clue 5 • Major Honours & Records</span>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            2 Pts
          </span>
        </div>
        {currentClueIndex >= 5 ? (
          <ul className="mt-2 space-y-1.5">
            {clues.clue5Achievements?.map((achievement, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed font-normal">
                <span className="text-emerald-400 font-black mt-0.5">•</span>
                <span>{achievement}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
            <Lock className="w-3.5 h-3.5" /> Reveal next clue to unlock trophy cabinet
          </div>
        )}
      </div>

      {/* Clue 6: Progressive Photo Reveal */}
      <div
        className={`p-4 rounded-2xl transition-all duration-200 card-specular ${
          currentClueIndex >= 6 || isGameOver ? 'animate-clue-enter' : 'opacity-35'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clue 6 • Progressive Photo Reveal</span>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            1 Pt
          </span>
        </div>

        {currentClueIndex >= 6 || isGameOver ? (
          <div className="mt-2 flex flex-col items-center">
            {clues.clue6Photo?.imageUrl ? (
              <div className="relative w-44 h-44 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-xl bg-slate-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={clues.clue6Photo.imageUrl}
                  alt="Mystery Player Silhouette"
                  style={{ filter: getBlurStyle() }}
                  className="w-full h-full object-cover photo-reveal-transition"
                />
              </div>
            ) : (
              <div className="w-44 h-32 rounded-xl border border-dashed border-[#243748] flex flex-col items-center justify-center p-3 text-center bg-[#0a1218]">
                <HelpCircle className="w-6 h-6 text-slate-500 mb-1" />
                <span className="text-[11px] text-slate-400">
                  Image-Free verified player. Licensing guidelines upheld.
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
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
            <Lock className="w-3.5 h-3.5" /> Reach final clue to view player silhouette photo
          </div>
        )}
      </div>
    </div>
  );
}
