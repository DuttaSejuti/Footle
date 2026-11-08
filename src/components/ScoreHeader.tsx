'use client';

import React from 'react';

interface ScoreHeaderProps {
  cluesUsed: number; // 1 to 6
  scoreIfGuessedNow: number;
  mode: 'daily' | 'practice';
  dateStr?: string;
  onSwitchMode: (mode: 'daily' | 'practice') => void;
}

export function ScoreHeader({
  cluesUsed,
  scoreIfGuessedNow,
  mode,
  dateStr,
  onSwitchMode,
}: ScoreHeaderProps) {
  return (
    <header className="w-full max-w-md mx-auto mb-4">
      {/* Brand & Mode Toggle */}
      <div className="flex items-center justify-between py-2.5 border-b border-[#1b2b3a] mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner select-none">
            ⚽
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-100 flex items-center gap-1.5">
              <span>Who&apos;s the Footballer?</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              {mode === 'daily' ? `Daily Match • UTC ${dateStr}` : 'Unlimited Training Match'}
            </p>
          </div>
        </div>

        {/* Mode Toggle pills with tactile active state */}
        <div className="flex bg-[#0b141d] p-1 rounded-xl border border-[#1c2e3d]">
          <button
            onClick={() => onSwitchMode('daily')}
            className={`px-3 py-1 rounded-lg text-xs font-bold pressable transition-all ${
              mode === 'daily'
                ? 'bg-emerald-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => onSwitchMode('practice')}
            className={`px-3 py-1 rounded-lg text-xs font-bold pressable transition-all ${
              mode === 'practice'
                ? 'bg-emerald-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Practice
          </button>
        </div>
      </div>

      {/* Progress & Current Potential Points */}
      <div className="card-specular rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex-1 pr-3">
          <div className="flex justify-between text-xs font-bold mb-2 text-slate-300">
            <span className="uppercase text-[10px] tracking-wider text-slate-400 font-semibold">
              Clues Unlocked
            </span>
            <span className="font-mono text-emerald-400 font-bold">{cluesUsed} / 6</span>
          </div>

          {/* 6 Step Progress Indicator with subtle glow on active */}
          <div className="grid grid-cols-6 gap-1.5 h-2">
            {[1, 2, 3, 4, 5, 6].map((step) => {
              const isRevealed = step <= cluesUsed;
              const isCurrent = step === cluesUsed;
              return (
                <div
                  key={step}
                  className={`rounded-full transition-all duration-300 ${
                    isCurrent
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                      : isRevealed
                      ? 'bg-emerald-600'
                      : 'bg-[#182735]'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="pl-3.5 border-l border-[#1f3242] text-right min-w-[76px]">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
            Win Value
          </span>
          <span className="text-xl font-black text-emerald-400 tracking-tight">
            {scoreIfGuessedNow} <span className="text-xs text-slate-400 font-semibold">pts</span>
          </span>
        </div>
      </div>
    </header>
  );
}
