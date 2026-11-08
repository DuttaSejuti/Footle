'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { normalizeString } from '@/lib/game-logic';

interface PlayerSuggestion {
  id: string;
  displayName: string;
  nationality: string;
  flagEmoji: string;
  position: string;
}

interface PlayerSearchProps {
  onSelectPlayer: (player: PlayerSuggestion) => void;
  disabled?: boolean;
  incorrectGuesses: string[];
}

export function PlayerSearch({ onSelectPlayer, disabled, incorrectGuesses }: PlayerSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlayerSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [allPlayers, setAllPlayers] = useState<PlayerSuggestion[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load all players once for instant snappy client-side autocomplete
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

  // Filter based on input
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
        return normalizeString(p.displayName).includes(norm);
      })
      .slice(0, 8);

    setSuggestions(matches);
    setIsOpen(matches.length > 0);
  }, [query, allPlayers]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (player: PlayerSuggestion) => {
    onSelectPlayer(player);
    setQuery('');
    setIsOpen(false);
  };

  const isAlreadyGuessed = (playerName: string) => {
    return incorrectGuesses.some(
      (g) => normalizeString(g) === normalizeString(playerName)
    );
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim() && suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={disabled ? "Game completed" : "Search footballer name..."}
          className="w-full pl-11 pr-4 py-3.5 bg-[#121e28] border border-[#1e3345] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-base shadow-lg transition-all"
        />
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && !disabled && (
        <ul className="absolute z-50 w-full mt-2 bg-[#121e28] border border-[#1e3345] rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-[#1b2b3a]">
          {suggestions.map((p) => {
            const alreadyGuessed = isAlreadyGuessed(p.displayName);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={alreadyGuessed}
                  onClick={() => handleSelect(p)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                    alreadyGuessed
                      ? 'opacity-40 cursor-not-allowed bg-[#0e1720]'
                      : 'hover:bg-[#1a2b3a] cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{p.flagEmoji}</span>
                    <span className="font-semibold text-slate-100">{p.displayName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {p.position}
                    </span>
                    {alreadyGuessed && (
                      <span className="text-xs text-rose-400 font-medium">Guessed</span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
