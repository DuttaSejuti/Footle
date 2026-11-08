'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { normalizeString } from '@/lib/game-logic';

export interface PlayerOption {
  id: string;
  displayName: string;
  nationality: string;
  flagEmoji: string;
  position: string;
  positionAbbr: string;
  currentClub: string;
  clubAbbr: string;
  league: string;
  age: number;
  imageUrl?: string;
}

interface WordleSearchProps {
  onSelectPlayer: (player: PlayerOption) => void;
  disabled?: boolean;
  guessedPlayerIds: string[];
}

export function WordleSearch({ onSelectPlayer, disabled, guessedPlayerIds }: WordleSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlayerOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [allPlayers, setAllPlayers] = useState<PlayerOption[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/players')
      .then((res) => res.json())
      .then((data) => {
        if (data.players) {
          setAllPlayers(data.players);
        }
      })
      .catch((err) => console.error('Failed to load players:', err));
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const norm = normalizeString(trimmed);
    const matches = allPlayers
      .filter((p) => {
        return (
          normalizeString(p.displayName).includes(norm) ||
          normalizeString(p.currentClub).includes(norm) ||
          normalizeString(p.nationality).includes(norm)
        );
      })
      .slice(0, 8);

    setSuggestions(matches);
    setIsOpen(matches.length > 0);
  }, [query, allPlayers]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (player: PlayerOption) => {
    onSelectPlayer(player);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full z-30">
      {/* Search Input Bar */}
      <div className="flex items-center bg-[#15202c] border border-[#233547] rounded-xl shadow-lg focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all overflow-hidden">
        <div className="pl-4 pr-1 text-slate-400 flex items-center justify-center">
          <Search className="w-5 h-5 text-emerald-400" />
        </div>
        <input
          type="text"
          value={query}
          disabled={disabled}
          autoComplete="off"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim() && suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={
            disabled
              ? 'Game finished'
              : "Guess today's footballer (e.g. De Bruyne, Salah, Bellingham)..."
          }
          className="w-full bg-transparent px-3 py-3.5 text-sm md:text-base text-slate-100 placeholder:text-slate-500 focus:outline-none font-medium"
        />
        <button
          type="button"
          disabled={disabled || !suggestions[0]}
          onClick={() => {
            if (suggestions[0] && !guessedPlayerIds.includes(suggestions[0].id)) {
              handleSelect(suggestions[0]);
            }
          }}
          className="mr-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-headline text-xs font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
        >
          <span>Guess</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Autocomplete Dropdown Preview (Poeltl style) */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#121c27] border border-[#233547] rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-[#1b2b3a]">
          {suggestions.map((p) => {
            const alreadyGuessed = guessedPlayerIds.includes(p.id);

            return (
              <button
                key={p.id}
                type="button"
                disabled={alreadyGuessed}
                onClick={() => handleSelect(p)}
                className={`w-full flex items-center justify-between p-3 hover:bg-[#1a2938] transition-colors text-left group ${
                  alreadyGuessed ? 'opacity-40 cursor-not-allowed bg-[#0d151e]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-900 border border-[#233547] flex items-center justify-center text-lg flex-shrink-0">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{p.flagEmoji}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors">
                        {p.displayName}
                      </span>
                      <span className="text-xs">{p.flagEmoji}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {p.currentClub} • {p.league} • {p.positionAbbr} • {p.age}y
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {alreadyGuessed && (
                    <span className="text-[11px] font-bold text-rose-400">Guessed</span>
                  )}
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
