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
      <div className="flex items-center bg-turf-dark border-2 border-white/20 rounded-lg shadow-md focus-within:border-white focus-within:ring-2 focus-within:ring-white/20 transition-all overflow-hidden">
        <div className="pl-3.5 pr-1 text-turf-muted flex items-center justify-center">
          <Search className="w-5 h-5" />
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
              : 'Type footballer name (e.g. De Bruyne, Salah, Bellingham)...'
          }
          className="w-full bg-transparent px-3 py-3 text-sm md:text-base text-white placeholder:text-turf-muted/70 focus:outline-none font-sans font-medium"
        />
        <button
          type="button"
          disabled={disabled || !suggestions[0]}
          onClick={() => {
            if (suggestions[0] && !guessedPlayerIds.includes(suggestions[0].id)) {
              handleSelect(suggestions[0]);
            }
          }}
          className="mr-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-headline text-xs font-black uppercase tracking-wider rounded border border-emerald-400 transition-all active:translate-y-0.5 flex items-center gap-1 shadow-sm cursor-pointer"
        >
          <span>Sub In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Autocomplete Dropdown Preview */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-turf-dark border border-turf-border rounded-lg shadow-2xl overflow-hidden z-50 divide-y divide-turf-border/60">
          {suggestions.map((p) => {
            const alreadyGuessed = guessedPlayerIds.includes(p.id);

            return (
              <button
                key={p.id}
                type="button"
                disabled={alreadyGuessed}
                onClick={() => handleSelect(p)}
                className={`w-full flex items-center justify-between p-2.5 hover:bg-turf-base transition-colors text-left group ${
                  alreadyGuessed ? 'opacity-40 cursor-not-allowed bg-turf-dark/70' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-turf-base flex items-center justify-center border border-turf-border overflow-hidden flex-shrink-0">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">{p.flagEmoji}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                        {p.displayName}
                      </span>
                      <span className="text-xs">{p.flagEmoji}</span>
                    </div>
                    <span className="text-xs text-turf-muted font-mono">
                      {p.currentClub} • {p.league} • {p.positionAbbr} • {p.age}y
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {alreadyGuessed && (
                    <span className="text-[11px] font-bold text-red-400">Guessed</span>
                  )}
                  <ArrowRight className="w-4 h-4 text-turf-muted group-hover:text-emerald-400 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
