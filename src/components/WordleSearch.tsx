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
      {/* Dugout Search & Input Area */}
      <div className="flex items-center bg-[#0b2917] border-2 border-white/60 rounded-xl shadow-lg focus-within:border-white focus-within:ring-2 focus-within:ring-white transition-all overflow-hidden">
        <div className="pl-3.5 pr-1 text-emerald-300 flex items-center justify-center">
          <Search className="w-5 h-5 stroke-[2.5]" />
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
              ? 'Matchday complete'
              : 'Search footballer by name...'
          }
          className="w-full bg-transparent px-3 py-3.5 text-sm md:text-base text-white placeholder:text-emerald-200/60 focus:outline-none font-bold"
        />
        <button
          type="button"
          disabled={disabled || !suggestions[0]}
          onClick={() => {
            if (suggestions[0] && !guessedPlayerIds.includes(suggestions[0].id)) {
              handleSelect(suggestions[0]);
            }
          }}
          className="mr-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-headline text-xs font-black uppercase tracking-wider rounded-lg border-2 border-emerald-300 transition-all active:translate-y-0.5 flex items-center gap-1 shadow-md cursor-pointer"
        >
          <span>Pick</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

      {/* Autocomplete Dropdown Preview */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a2615] border-2 border-emerald-400 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-[#1d5231]">
          {suggestions.map((p) => {
            const alreadyGuessed = guessedPlayerIds.includes(p.id);

            return (
              <button
                key={p.id}
                type="button"
                disabled={alreadyGuessed}
                onClick={() => handleSelect(p)}
                className={`w-full flex items-center justify-between p-3 hover:bg-[#123e23] transition-colors text-left group ${
                  alreadyGuessed ? 'opacity-40 cursor-not-allowed bg-[#081a0e]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#0e331c] flex items-center justify-center border-2 border-emerald-400 flex-shrink-0 text-xl">
                    {p.flagEmoji}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline font-black text-sm text-white group-hover:text-emerald-300 transition-colors">
                      {p.displayName}
                    </span>
                    <span className="text-xs text-emerald-200 font-bold">
                      {p.nationality}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {alreadyGuessed && (
                    <span className="text-xs font-black text-red-300">Guessed</span>
                  )}
                  <ArrowRight className="w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
