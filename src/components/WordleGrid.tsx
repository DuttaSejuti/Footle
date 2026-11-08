'use client';

import React from 'react';
import { GuessComparison } from '@/types/footballer';
import { CheckCircle, X } from 'lucide-react';

interface WordleGridProps {
  comparisons: GuessComparison[];
  maxAttempts?: number;
}

export function WordleGrid({ comparisons, maxAttempts = 6 }: WordleGridProps) {
  const emptyRowsCount = Math.max(0, maxAttempts - comparisons.length);

  return (
    <div className="w-full flex flex-col gap-2 select-none">
      {/* Grid Column Headers */}
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2 px-1 text-center font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 select-none">
        <div className="col-span-1 text-left pl-1 sm:pl-2">Player</div>
        <div className="col-span-1">Nat</div>
        <div className="col-span-1">League</div>
        <div className="col-span-1">Club</div>
        <div className="col-span-1">Pos</div>
        <div className="col-span-1">Age</div>
      </div>

      {/* Completed / Active Rows */}
      <div className="flex flex-col gap-2">
        {comparisons.map((comp, idx) => {
          const isWin = comp.isExactMatch;

          return (
            <div
              key={idx}
              className={`grid grid-cols-6 gap-1.5 sm:gap-2 items-stretch h-14 sm:h-16 animate-clue-enter ${
                isWin ? 'ring-2 ring-emerald-400/80 rounded-xl' : ''
              }`}
            >
              {/* Player Name */}
              <div className="col-span-1 bg-[#16212d] border border-[#233547] rounded-xl p-1.5 sm:p-2 flex flex-col justify-center text-left min-w-0">
                <div className="flex items-center gap-1">
                  {isWin && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  <span
                    className={`font-headline font-bold text-xs sm:text-sm truncate leading-tight ${
                      isWin ? 'text-emerald-400' : 'text-slate-100'
                    }`}
                  >
                    {comp.player.displayName}
                  </span>
                </div>
                <span className="font-mono text-[9px] sm:text-[10px] text-slate-400 truncate">
                  Attempt #{idx + 1}
                </span>
              </div>

              {/* Nationality */}
              <div
                className={`col-span-1 rounded-xl p-1 flex flex-col items-center justify-center text-center shadow-sm border transition-all ${
                  comp.nationality.status === 'correct'
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-red-950/80 border-red-700/60 text-red-200'
                }`}
              >
                <span className="text-base sm:text-lg leading-none">{comp.nationality.flag}</span>
                <span className="font-mono text-[9px] sm:text-[11px] font-bold truncate max-w-full mt-0.5">
                  {comp.nationality.code}
                </span>
              </div>

              {/* League */}
              <div
                className={`col-span-1 rounded-xl p-1 flex flex-col items-center justify-center text-center shadow-sm border transition-all ${
                  comp.league.status === 'correct'
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-red-950/80 border-red-700/60 text-red-200'
                }`}
              >
                <span className="font-mono text-[9px] sm:text-[11px] font-bold leading-tight truncate max-w-full">
                  {comp.league.value}
                </span>
                <span className="font-mono text-[8px] sm:text-[9px] opacity-80 uppercase">
                  {comp.league.status === 'correct' ? 'Match' : 'Miss'}
                </span>
              </div>

              {/* Club */}
              <div
                className={`col-span-1 rounded-xl p-1 flex flex-col items-center justify-center text-center shadow-sm border transition-all ${
                  comp.club.status === 'correct'
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-red-950/80 border-red-700/60 text-red-200'
                }`}
              >
                <span className="font-mono text-[10px] sm:text-[12px] font-black leading-tight truncate max-w-full">
                  {comp.club.abbr}
                </span>
                <span className="font-mono text-[8px] sm:text-[9px] opacity-80 uppercase truncate max-w-full">
                  {comp.club.status === 'correct' ? 'Exact' : 'Miss'}
                </span>
              </div>

              {/* Position */}
              <div
                className={`col-span-1 rounded-xl p-1 flex flex-col items-center justify-center text-center shadow-sm border transition-all ${
                  comp.position.status === 'correct'
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : comp.position.status === 'partial'
                    ? 'bg-amber-600 border-amber-400 text-white'
                    : 'bg-red-950/80 border-red-700/60 text-red-200'
                }`}
              >
                <span className="font-mono text-xs sm:text-sm font-black">
                  {comp.position.abbr}
                </span>
                <span className="font-mono text-[8px] sm:text-[9px] opacity-90 uppercase">
                  {comp.position.status === 'correct'
                    ? 'Exact'
                    : comp.position.status === 'partial'
                    ? 'Close'
                    : 'Miss'}
                </span>
              </div>

              {/* Age */}
              <div
                className={`col-span-1 rounded-xl p-1 flex flex-col items-center justify-center text-center shadow-sm border transition-all ${
                  comp.age.status === 'correct'
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-amber-600 border-amber-400 text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-0.5">
                  <span className="font-mono text-xs sm:text-sm font-black">
                    {comp.age.value}
                  </span>
                  {comp.age.status === 'higher' && <span className="text-xs">⬆️</span>}
                  {comp.age.status === 'lower' && <span className="text-xs">⬇️</span>}
                </div>
                <span className="font-mono text-[8px] sm:text-[9px] opacity-90 uppercase">
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

        {/* Empty Pending Rows */}
        {Array.from({ length: emptyRowsCount }).map((_, i) => {
          const rowNum = comparisons.length + i + 1;
          const opacityClass =
            i === 0 ? 'opacity-40' : i === 1 ? 'opacity-25' : 'opacity-15';

          return (
            <div
              key={i}
              className={`grid grid-cols-6 gap-1.5 sm:gap-2 items-stretch h-12 sm:h-14 ${opacityClass}`}
            >
              <div className="col-span-1 border border-slate-700 rounded-xl flex items-center justify-center font-mono text-xs text-slate-500 font-bold">
                {rowNum}
              </div>
              <div className="col-span-1 border border-slate-800 rounded-xl bg-slate-900/40" />
              <div className="col-span-1 border border-slate-800 rounded-xl bg-slate-900/40" />
              <div className="col-span-1 border border-slate-800 rounded-xl bg-slate-900/40" />
              <div className="col-span-1 border border-slate-800 rounded-xl bg-slate-900/40" />
              <div className="col-span-1 border border-slate-800 rounded-xl bg-slate-900/40" />
            </div>
          );
        })}
      </div>

      {/* Wordle Color Key Indicator */}
      <div className="w-full flex items-center justify-center gap-4 sm:gap-6 pt-3 pb-1 border-t border-[#1c2a38] text-[11px] font-mono text-slate-400 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-600 shadow-sm" />
          <span>Exact Match</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-600 shadow-sm" />
          <span>Close / ⬆️ Older / ⬇️ Younger</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-950 border border-red-800 shadow-sm" />
          <span>Wrong</span>
        </div>
      </div>
    </div>
  );
}
