'use client';

import React from 'react';
import { GuessComparison } from '@/types/footballer';

interface WordleGridProps {
  comparisons: GuessComparison[];
  maxAttempts?: number;
}

export function WordleGrid({ comparisons, maxAttempts = 6 }: WordleGridProps) {
  const emptyRowsCount = Math.max(0, maxAttempts - comparisons.length);

  return (
    <div className="w-full flex flex-col gap-2 select-none">
      {/* Column Headers with Bright Crisp Chalk Style */}
      <div className="grid grid-cols-6 gap-2 sm:gap-3 px-1 text-center font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-200 select-none drop-shadow-sm">
        <div className="col-span-1 text-left pl-2">PLAYER</div>
        <div className="col-span-1">COUNTRY</div>
        <div className="col-span-1">LEAGUE</div>
        <div className="col-span-1">CLUB</div>
        <div className="col-span-1">POSITION</div>
        <div className="col-span-1">AGE</div>
      </div>

      {/* Rows Board */}
      <div className="flex flex-col gap-2.5">
        {comparisons.map((comp, idx) => {
          const isWin = comp.isExactMatch;

          return (
            <div
              key={idx}
              className="grid grid-cols-6 gap-2 sm:gap-3 items-stretch h-16 sm:h-20 animate-clue-enter"
            >
              {/* Player Cell */}
              <div
                className={`col-span-1 bg-[#0b2917] border-2 rounded-lg p-2 sm:p-2.5 flex items-center text-left min-w-0 tactic-tile ${
                  isWin ? 'border-emerald-400 bg-[#0d3b1e]' : 'border-[#297a49]'
                }`}
              >
                <span
                  title={comp.player.displayName}
                  className={`font-headline font-black text-xs sm:text-base line-clamp-2 leading-snug break-words ${
                    isWin ? 'text-emerald-300' : 'text-white'
                  }`}
                >
                  {comp.player.displayName}
                </span>
              </div>

              {/* COUNTRY */}
              <div
                className={`col-span-1 rounded-lg p-1.5 flex items-center justify-center text-center tactic-tile border-2 ${
                  comp.nationality.status === 'correct'
                    ? 'bg-[#15803d] border-emerald-400 text-white'
                    : comp.nationality.status === 'partial'
                    ? 'bg-[#eab308] border-[#fef08a] text-zinc-950'
                    : 'bg-[#0f1f15] border-[#294a34] text-slate-300'
                }`}
              >
                <span className="text-2xl sm:text-4xl leading-none select-none">{comp.nationality.flag}</span>
              </div>

              {/* LEAGUE */}
              <div
                className={`col-span-1 rounded-lg p-2 flex items-center justify-center text-center tactic-tile border-2 ${
                  comp.league.status === 'correct'
                    ? 'bg-[#15803d] border-emerald-400 text-white'
                    : comp.league.status === 'partial'
                    ? 'bg-[#eab308] border-[#fef08a] text-zinc-950'
                    : 'bg-[#0f1f15] border-[#294a34] text-slate-300'
                }`}
              >
                <span
                  title={comp.league.value}
                  className={`font-mono text-xs sm:text-sm font-black leading-tight break-words line-clamp-2 max-w-full ${
                    comp.league.status === 'partial' ? 'text-zinc-950' : 'text-white'
                  }`}
                >
                  {comp.league.value}
                </span>
              </div>

              {/* CLUB */}
              <div
                className={`col-span-1 rounded-lg p-1.5 flex items-center justify-center text-center tactic-tile border-2 ${
                  comp.club.status === 'correct'
                    ? 'bg-[#15803d] border-emerald-400 text-white'
                    : comp.club.status === 'partial'
                    ? 'bg-[#eab308] border-[#fef08a] text-zinc-950'
                    : 'bg-[#0f1f15] border-[#294a34] text-slate-300'
                }`}
              >
                <span
                  title={comp.club.value}
                  className={`font-mono text-xs sm:text-sm font-black leading-tight break-words line-clamp-2 max-w-full ${
                    comp.club.status === 'partial' ? 'text-zinc-950' : 'text-white'
                  }`}
                >
                  {comp.club.value}
                </span>
              </div>

              {/* POS */}
              <div
                className={`col-span-1 rounded-lg p-2 flex items-center justify-center text-center tactic-tile border-2 ${
                  comp.position.status === 'correct'
                    ? 'bg-[#15803d] border-emerald-400 text-white'
                    : comp.position.status === 'partial'
                    ? 'bg-[#eab308] border-[#fef08a] text-zinc-950'
                    : 'bg-[#0f1f15] border-[#294a34] text-slate-300'
                }`}
              >
                <span
                  className={`font-mono text-sm sm:text-base font-black ${
                    comp.position.status === 'partial' ? 'text-zinc-950' : 'text-white'
                  }`}
                >
                  {comp.position.abbr}
                </span>
              </div>

              {/* AGE */}
              {(() => {
                const isExactAge = comp.age.status === 'correct';
                const isCloseAge = !isExactAge && Math.abs(comp.age.diff ?? 99) <= 2;

                return (
                  <div
                    className={`col-span-1 rounded-lg p-2 flex items-center justify-center text-center tactic-tile border-2 ${
                      isExactAge
                        ? 'bg-[#15803d] border-emerald-400 text-white'
                        : isCloseAge
                        ? 'bg-[#eab308] border-[#fef08a] text-zinc-950'
                        : 'bg-[#0f1f15] border-[#294a34] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        className={`font-mono text-sm sm:text-base font-black ${
                          isExactAge
                            ? 'text-white'
                            : isCloseAge
                            ? 'text-zinc-950'
                            : 'text-white'
                        }`}
                      >
                        {comp.age.value}
                      </span>
                      {comp.age.status === 'higher' && <span className="text-base sm:text-lg font-black">⬆️</span>}
                      {comp.age.status === 'lower' && <span className="text-base sm:text-lg font-black">⬇️</span>}
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })}

        {/* Pitch Dugout Socket Empty Rows */}
        {Array.from({ length: emptyRowsCount }).map((_, i) => {
          const rowNum = comparisons.length + i + 1;
          const opacityClass =
            i === 0 ? 'opacity-80' : i === 1 ? 'opacity-60' : 'opacity-40';

          return (
            <div
              key={i}
              className={`grid grid-cols-6 gap-2 sm:gap-3 items-stretch h-14 sm:h-16 ${opacityClass}`}
            >
              <div className="col-span-1 border-2 border-white/30 rounded-lg bg-[#0e331c]/80 flex items-center justify-center font-mono text-sm font-black text-emerald-200 empty-tile">
                {rowNum}
              </div>
              <div className="col-span-1 border-2 border-white/20 rounded-lg bg-[#0e331c]/60 empty-tile" />
              <div className="col-span-1 border-2 border-white/20 rounded-lg bg-[#0e331c]/60 empty-tile" />
              <div className="col-span-1 border-2 border-white/20 rounded-lg bg-[#0e331c]/60 empty-tile" />
              <div className="col-span-1 border-2 border-white/20 rounded-lg bg-[#0e331c]/60 empty-tile" />
              <div className="col-span-1 border-2 border-white/20 rounded-lg bg-[#0e331c]/60 empty-tile" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
