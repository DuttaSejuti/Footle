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
      <div className="flex items-center justify-between py-2 border-b border-[#1b2b3a] mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚽</span>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Who&apos;s the Footballer?</span>
            </h1>
            <p className="text-[10px] text-slate-400">
              {mode === 'daily' ? `Daily Match • UTC ${dateStr}` : 'Unlimited Practice Match'}
            </p>
          </div>
        </div>

        {/* Mode Toggle pills */}
        <div className="flex bg-[#0e1720] p-1 rounded-xl border border-[#1e3345]">
          <button
            onClick={() => onSwitchMode('daily')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'daily'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => onSwitchMode('practice')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'practice'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Practice
          </button>
        </div>
      </div>

      {/* Progress & Current Potential Points */}
      <div className="bg-[#121e28] border border-[#1e3345] rounded-xl p-3 flex items-center justify-between shadow-sm">
        <div className="flex-1 pr-3">
          <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-300">
            <span>Clues Revealed</span>
            <span className="font-mono text-emerald-400">{cluesUsed} / 6</span>
          </div>

          {/* 6 Step Progress Indicator */}
          <div className="grid grid-cols-6 gap-1.5 h-2">
            {[1, 2, 3, 4, 5, 6].map((step) => {
              const isRevealed = step <= cluesUsed;
              const isCurrent = step === cluesUsed;
              return (
                <div
                  key={step}
                  className={`rounded-full transition-all duration-300 ${
                    isCurrent
                      ? 'bg-emerald-400 ring-2 ring-emerald-400/40'
                      : isRevealed
                      ? 'bg-emerald-600'
                      : 'bg-[#1e3345]'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="pl-3 border-l border-[#1e3345] text-right min-w-[70px]">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Win Value
          </span>
          <span className="text-xl font-extrabold text-emerald-400">
            {scoreIfGuessedNow} <span className="text-xs text-slate-400 font-normal">pts</span>
          </span>
        </div>
      </div>
    </header>
  );
}
