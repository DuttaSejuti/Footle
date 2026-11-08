'use client';

import React from 'react';
import { GuessComparison } from '@/types/footballer';
import { Check } from 'lucide-react';

interface WordleGridProps {
  comparisons: GuessComparison[];
  maxAttempts?: number;
}

export function WordleGrid({ comparisons, maxAttempts = 6 }: WordleGridProps) {
  const emptyRowsCount = Math.max(0, maxAttempts - comparisons.length);

  return (
    <div className="w-full flex flex-col gap-2 select-none">
      {/* Column Headers with Bright Crisp Chalk Style */}
      <div className="grid grid-cols-6 gap-2 px-1 text-center font-mono text-xs font-black uppercase tracking-wider text-emerald-200 select-none drop-shadow-sm">
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
                isWin ? 'border-2 border-white rounded shadow-lg' : ''
              }`}
            >
              {/* Player Cell */}
              <div
                className={`col-span-1 bg-[#0b2917] border-2 rounded p-1.5 sm:p-2 flex flex-col justify-center text-left min-w-0 tactic-tile ${
                  isWin ? 'border-emerald-400 bg-[#0d3b1e]' : 'border-[#297a49]'
                }`}
              >
                <div className="flex items-center gap-1">
                  {isWin && <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 stroke-[3]" />}
                  <span
                    className={`font-headline font-black text-xs sm:text-sm truncate leading-tight ${
                      isWin ? 'text-emerald-200' : 'text-white'
                    }`}
                  >
                    {comp.player.displayName}
                  </span>
                </div>
                <span
                  className={`font-mono text-[10px] sm:text-[11px] truncate font-bold ${
                    isWin ? 'text-emerald-300' : 'text-emerald-300/80'
                  }`}
                >
                  {isWin ? `#${idx + 1} Solved!` : `#${idx + 1} Guess`}
                </span>
              </div>

              {/* NAT */}
              <div
                className={`col-span-1 rounded p-1 flex flex-col items-center justify-center text-center tactic-tile border-2 ${
                  comp.nationality.status === 'correct'
                    ? 'bg-[#15803d] border-emerald-400 text-white'
                    : comp.nationality.status === 'partial'
                    ? 'bg-[#eab308] border-[#fef08a] text-zinc-950'
                    : 'bg-[#0f1f15] border-[#294a34] text-slate-300'
                }`}
              >
                <span className="text-base sm:text-lg leading-none">{comp.nationality.flag}</span>
                <span
                  className={`font-mono text-[10px] sm:text-xs font-black truncate max-w-full mt-0.5 ${
                    comp.nationality.status === 'partial' ? 'text-zinc-950' : 'text-white'
                  }`}
                >
                  {comp.nationality.code}
                </span>
                <span
                  className={`font-mono text-[8px] sm:text-[9px] uppercase font-black tracking-tight leading-none ${
                    comp.nationality.status === 'partial' ? 'text-zinc-900' : 'text-white/80'
                  }`}
                >
                  {comp.nationality.status === 'correct'
                    ? 'Exact'
                    : comp.nationality.status === 'partial'
                    ? 'Region'
                    : 'Miss'}
                </span>
              </div>

              {/* LEAGUE */}
              <div
                className={`col-span-1 rounded p-1 flex flex-col items-center justify-center text-center tactic-tile border-2 ${
                  comp.league.status === 'correct'
                    ? 'bg-[#15803d] border-emerald-400 text-white'
                    : comp.league.status === 'partial'
                    ? 'bg-[#eab308] border-[#fef08a] text-zinc-950'
                    : 'bg-[#0f1f15] border-[#294a34] text-slate-300'
                }`}
              >
                <span
                  className={`font-mono text-[10px] sm:text-xs font-black leading-tight truncate max-w-full ${
                    comp.league.status === 'partial' ? 'text-zinc-950' : 'text-white'
                  }`}
                >
                  {comp.league.value}
                </span>
                <span
                  className={`font-mono text-[9px] sm:text-[10px] uppercase font-black tracking-tight ${
                    comp.league.status === 'partial' ? 'text-zinc-900' : 'text-white/90'
                  }`}
                >
                  {comp.league.status === 'correct'
                    ? 'Match'
                    : comp.league.status === 'partial'
                    ? 'Played'
                    : 'Miss'}
                </span>
              </div>

              {/* CLUB */}
              <div
                className={`col-span-1 rounded p-1 flex flex-col items-center justify-center text-center tactic-tile border-2 ${
                  comp.club.status === 'correct'
                    ? 'bg-[#15803d] border-emerald-400 text-white'
                    : comp.club.status === 'partial'
                    ? 'bg-[#eab308] border-[#fef08a] text-zinc-950'
                    : 'bg-[#0f1f15] border-[#294a34] text-slate-300'
                }`}
              >
                <span
                  className={`font-mono text-xs sm:text-sm font-black leading-tight truncate max-w-full ${
                    comp.club.status === 'partial' ? 'text-zinc-950' : 'text-white'
                  }`}
                >
                  {comp.club.abbr}
                </span>
                <span
                  className={`font-mono text-[9px] sm:text-[10px] uppercase font-black tracking-tight truncate max-w-full ${
                    comp.club.status === 'partial' ? 'text-zinc-900' : 'text-white/90'
                  }`}
                >
                  {comp.club.status === 'correct'
                    ? 'Exact'
                    : comp.club.status === 'partial'
                    ? 'Former'
                    : 'Miss'}
                </span>
              </div>

              {/* POS */}
              <div
                className={`col-span-1 rounded p-1 flex flex-col items-center justify-center text-center tactic-tile border-2 ${
                  comp.position.status === 'correct'
                    ? 'bg-[#15803d] border-emerald-400 text-white'
                    : comp.position.status === 'partial'
                    ? 'bg-[#eab308] border-[#fef08a] text-zinc-950'
                    : 'bg-[#0f1f15] border-[#294a34] text-slate-300'
                }`}
              >
                <span
                  className={`font-mono text-xs sm:text-sm font-black ${
                    comp.position.status === 'partial' ? 'text-zinc-950' : 'text-white'
                  }`}
                >
                  {comp.position.abbr}
                </span>
                <span
                  className={`font-mono text-[9px] sm:text-[10px] font-black uppercase ${
                    comp.position.status === 'partial' ? 'text-zinc-900' : 'text-white/90'
                  }`}
                >
                  {comp.position.status === 'correct'
                    ? 'Exact'
                    : comp.position.status === 'partial'
                    ? 'Close'
                    : 'Miss'}
                </span>
              </div>

              {/* AGE */}
              {(() => {
                const isExactAge = comp.age.status === 'correct';
                const isCloseAge = !isExactAge && Math.abs(comp.age.diff ?? 99) <= 2;

                return (
                  <div
                    className={`col-span-1 rounded p-1 flex flex-col items-center justify-center text-center tactic-tile border-2 ${
                      isExactAge
                        ? 'bg-[#15803d] border-emerald-400 text-white'
                        : isCloseAge
                        ? 'bg-[#eab308] border-[#fef08a] text-zinc-950'
                        : 'bg-[#0f1f15] border-[#294a34] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      <span
                        className={`font-mono text-xs sm:text-sm font-black ${
                          isExactAge
                            ? 'text-white'
                            : isCloseAge
                            ? 'text-zinc-950'
                            : 'text-white'
                        }`}
                      >
                        {comp.age.value}
                      </span>
                      {comp.age.status === 'higher' && <span className="text-sm font-black">⬆️</span>}
                      {comp.age.status === 'lower' && <span className="text-sm font-black">⬇️</span>}
                    </div>
                    <span
                      className={`font-mono text-[9px] sm:text-[10px] font-black uppercase ${
                        isExactAge
                          ? 'text-white/90'
                          : isCloseAge
                          ? 'text-zinc-900'
                          : 'text-emerald-300/80'
                      }`}
                    >
                      {isExactAge
                        ? 'Exact'
                        : comp.age.status === 'higher'
                        ? 'Older'
                        : 'Younger'}
                    </span>
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
              className={`grid grid-cols-6 gap-2 items-stretch h-12 sm:h-14 ${opacityClass}`}
            >
              <div className="col-span-1 border-2 border-white/30 rounded bg-[#0e331c]/80 flex items-center justify-center font-mono text-xs font-black text-emerald-200 empty-tile">
                {rowNum}
              </div>
              <div className="col-span-1 border-2 border-white/20 rounded bg-[#0e331c]/60 empty-tile" />
              <div className="col-span-1 border-2 border-white/20 rounded bg-[#0e331c]/60 empty-tile" />
              <div className="col-span-1 border-2 border-white/20 rounded bg-[#0e331c]/60 empty-tile" />
              <div className="col-span-1 border-2 border-white/20 rounded bg-[#0e331c]/60 empty-tile" />
              <div className="col-span-1 border-2 border-white/20 rounded bg-[#0e331c]/60 empty-tile" />
            </div>
          );
        })}
      </div>

      {/* Legend: Tactical Pitch Indicators with high contrast text */}
      <div className="w-full flex items-center justify-center gap-5 sm:gap-8 pt-3.5 pb-1 border-t-2 border-white/20 text-xs font-mono text-emerald-100 select-none font-bold">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-[#15803d] border-2 border-emerald-400 inline-block shadow-sm" />
          <span className="text-white font-extrabold">🟩 Exact Match</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-[#eab308] border-2 border-[#fef08a] inline-block shadow-sm" />
          <span className="text-white font-extrabold">🟨 Close / Direction</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-[#0f1f15] border-2 border-[#294a34] inline-block shadow-sm" />
          <span className="text-white font-extrabold">⬛ Incorrect</span>
        </div>
      </div>
    </div>
  );
}
