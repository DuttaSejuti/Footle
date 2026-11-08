'use client';

import React from 'react';
import { GuessComparison } from '@/types/footballer';
import { Check, Shield, X } from 'lucide-react';

interface WordleGridProps {
  comparisons: GuessComparison[];
  maxAttempts?: number;
}

export function WordleGrid({ comparisons, maxAttempts = 6 }: WordleGridProps) {
  const emptyRowsCount = Math.max(0, maxAttempts - comparisons.length);

  return (
    <div className="w-full flex flex-col gap-2 select-none">
      {/* Column Headers with Chalk Style */}
      <div className="grid grid-cols-6 gap-2 px-1 text-center font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-turf-muted select-none">
        <div className="col-span-1 text-left pl-2">PLAYER</div>
        <div className="col-span-1">NAT</div>
        <div className="col-span-1">LEAGUE</div>
        <div className="col-span-1">CLUB</div>
        <div className="col-span-1">POS</div>
        <div className="col-span-1">AGE</div>
      </div>

      {/* Rows Board */}
      <div className="flex flex-col gap-2">
        {comparisons.map((comp, idx) => {
          const isWin = comp.isExactMatch;

          return (
            <div
              key={idx}
              className={`grid grid-cols-6 gap-2 items-stretch h-14 sm:h-16 animate-clue-enter ${
                isWin ? 'border-2 border-white/60 rounded' : ''
              }`}
            >
              {/* Player Cell */}
              <div
                className={`col-span-1 bg-turf-dark border rounded p-1.5 sm:p-2 flex flex-col justify-center text-left min-w-0 tactic-tile ${
                  isWin ? 'border-emerald-500/80' : 'border-turf-border'
                }`}
              >
                <div className="flex items-center gap-1">
                  {isWin && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  <span
                    className={`font-headline font-bold text-xs sm:text-sm truncate leading-tight ${
                      isWin ? 'text-emerald-300 font-black' : 'text-white'
                    }`}
                  >
                    {comp.player.displayName}
                  </span>
                </div>
                <span
                  className={`font-mono text-[9px] sm:text-[10px] truncate ${
                    isWin ? 'text-emerald-400/90 font-bold' : 'text-turf-muted'
                  }`}
                >
                  {isWin ? `#${idx + 1} Solved!` : `#${idx + 1} Guess`}
                </span>
              </div>

              {/* NAT */}
              <div
                className={`col-span-1 rounded p-1 flex flex-col items-center justify-center text-center tactic-tile border ${
                  comp.nationality.status === 'correct'
                    ? 'bg-match-exact border-match-exactBorder text-white'
                    : 'bg-match-wrong border-match-wrongBorder text-slate-400'
                }`}
              >
                <span className="text-base sm:text-lg leading-none">{comp.nationality.flag}</span>
                <span
                  className={`font-mono text-[9px] sm:text-[11px] truncate max-w-full mt-0.5 ${
                    comp.nationality.status === 'correct' ? 'font-extrabold' : 'font-bold text-slate-300'
                  }`}
                >
                  {comp.nationality.code}
                </span>
              </div>

              {/* LEAGUE */}
              <div
                className={`col-span-1 rounded p-1 flex flex-col items-center justify-center text-center tactic-tile border ${
                  comp.league.status === 'correct'
                    ? 'bg-match-exact border-match-exactBorder text-white'
                    : 'bg-match-wrong border-match-wrongBorder text-slate-400'
                }`}
              >
                <span
                  className={`font-mono text-[9px] sm:text-[11px] leading-tight truncate max-w-full ${
                    comp.league.status === 'correct' ? 'font-extrabold' : 'font-bold text-slate-300'
                  }`}
                >
                  {comp.league.value}
                </span>
                <span className="font-mono text-[8px] sm:text-[9px] uppercase opacity-80">
                  {comp.league.status === 'correct' ? 'Match' : 'Miss'}
                </span>
              </div>

              {/* CLUB */}
              <div
                className={`col-span-1 rounded p-1 flex flex-col items-center justify-center text-center tactic-tile border ${
                  comp.club.status === 'correct'
                    ? 'bg-match-exact border-match-exactBorder text-white'
                    : 'bg-match-wrong border-match-wrongBorder text-slate-400'
                }`}
              >
                <span
                  className={`font-mono text-[10px] sm:text-[12px] leading-tight truncate max-w-full ${
                    comp.club.status === 'correct' ? 'font-extrabold' : 'font-bold text-slate-300'
                  }`}
                >
                  {comp.club.abbr}
                </span>
                <span className="font-mono text-[8px] sm:text-[9px] uppercase opacity-80 truncate max-w-full">
                  {comp.club.status === 'correct' ? 'Exact' : 'Miss'}
                </span>
              </div>

              {/* POS */}
              <div
                className={`col-span-1 rounded p-1 flex flex-col items-center justify-center text-center tactic-tile border ${
                  comp.position.status === 'correct'
                    ? 'bg-match-exact border-match-exactBorder text-white'
                    : comp.position.status === 'partial'
                    ? 'bg-match-close border-match-closeBorder text-zinc-950'
                    : 'bg-match-wrong border-match-wrongBorder text-slate-400'
                }`}
              >
                <span className="font-mono text-xs sm:text-sm font-black">
                  {comp.position.abbr}
                </span>
                <span className="font-mono text-[8px] sm:text-[9px] font-bold uppercase opacity-90">
                  {comp.position.status === 'correct'
                    ? 'Exact'
                    : comp.position.status === 'partial'
                    ? 'Close'
                    : 'Miss'}
                </span>
              </div>

              {/* AGE */}
              <div
                className={`col-span-1 rounded p-1 flex flex-col items-center justify-center text-center tactic-tile border ${
                  comp.age.status === 'correct'
                    ? 'bg-match-exact border-match-exactBorder text-white'
                    : 'bg-match-close border-match-closeBorder text-zinc-950'
                }`}
              >
                <div className="flex items-center justify-center gap-0.5">
                  <span className="font-mono text-xs sm:text-sm font-black">
                    {comp.age.value}
                  </span>
                  {comp.age.status === 'higher' && <span className="text-xs font-extrabold">⬆️</span>}
                  {comp.age.status === 'lower' && <span className="text-xs font-extrabold">⬇️</span>}
                </div>
                <span className="font-mono text-[8px] sm:text-[9px] font-extrabold uppercase">
                  {comp.age.status === 'correct'
                    ? 'Exact'
                    : comp.age.status === 'higher'
                    ? 'Older'
                    : 'Younger'}
                </span>
              </div>
            </div>
          );
        })}

        {/* Pitch Dugout Socket Empty Rows */}
        {Array.from({ length: emptyRowsCount }).map((_, i) => {
          const rowNum = comparisons.length + i + 1;
          const opacityClass =
            i === 0 ? 'opacity-60' : i === 1 ? 'opacity-40' : 'opacity-25';

          return (
            <div
              key={i}
              className={`grid grid-cols-6 gap-2 items-stretch h-12 sm:h-14 ${opacityClass}`}
            >
              <div className="col-span-1 border border-white/20 rounded bg-turf-dark/50 flex items-center justify-center font-mono text-xs font-bold text-turf-muted/70 empty-tile">
                {rowNum}
              </div>
              <div className="col-span-1 border border-white/15 rounded bg-turf-dark/40 empty-tile" />
              <div className="col-span-1 border border-white/15 rounded bg-turf-dark/40 empty-tile" />
              <div className="col-span-1 border border-white/15 rounded bg-turf-dark/40 empty-tile" />
              <div className="col-span-1 border border-white/15 rounded bg-turf-dark/40 empty-tile" />
              <div className="col-span-1 border border-white/15 rounded bg-turf-dark/40 empty-tile" />
            </div>
          );
        })}
      </div>

      {/* Legend: Tactical Pitch Indicators */}
      <div className="w-full flex items-center justify-center gap-5 sm:gap-8 pt-3 pb-1 border-t border-turf-border/70 text-[11px] font-mono text-turf-muted select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-match-exact border border-match-exactBorder inline-block" />
          <span className="text-white font-medium">🟩 Exact Match</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-match-close border border-match-closeBorder inline-block" />
          <span className="text-white font-medium">🟨 Close / Direction</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-match-wrong border border-match-wrongBorder inline-block" />
          <span className="text-white font-medium">⬛ Incorrect</span>
        </div>
      </div>
    </div>
  );
}
