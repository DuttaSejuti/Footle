'use client';

import React, { useState, useEffect } from 'react';
import { ScoreHeader } from '@/components/ScoreHeader';
import { CluesContainer } from '@/components/CluesContainer';
import { PlayerSearch } from '@/components/PlayerSearch';
import { ResultsModal } from '@/components/ResultsModal';
import { calculateScore, getUtcTodayDateString } from '@/lib/game-logic';
import { Footballer } from '@/types/footballer';
import { Eye, Flag, AlertCircle, HelpCircle, Trophy } from 'lucide-react';

export default function GameView() {
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [cluesRevealed, setCluesRevealed] = useState<number>(1);
  const [cluesData, setCluesData] = useState<any>({});
  const [incorrectGuesses, setIncorrectGuesses] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [mysteryPlayer, setMysteryPlayer] = useState<Footballer | undefined>();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showResultsModal, setShowResultsModal] = useState<boolean>(false);
  const [practicePlayerId, setPracticePlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  useEffect(() => {
    const today = getUtcTodayDateString();
    setCurrentDateStr(today);

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailyVisitors: 1 }),
    }).catch(() => {});

    loadGameState('daily', today);
  }, []);

  const loadGameState = async (targetMode: 'daily' | 'practice', date: string, customPracticeId?: string) => {
    setLoading(true);
    setFeedbackMessage(null);

    if (targetMode === 'daily') {
      const storageKey = `footle_daily_${date}`;
      const saved = localStorage.getItem(storageKey);

      let savedClues = 1;
      let savedGuesses: string[] = [];
      let savedOver = false;
      let savedWon = false;
      let savedScore = 0;
      let savedMystery: Footballer | undefined = undefined;

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          savedClues = parsed.cluesRevealed || 1;
          savedGuesses = parsed.guesses || [];
          savedOver = parsed.isGameOver || false;
          savedWon = parsed.isWon || false;
          savedScore = parsed.score || 0;
          savedMystery = parsed.mysteryPlayer;
        } catch {}
      }

      setCluesRevealed(savedClues);
      setIncorrectGuesses(savedGuesses);
      setIsGameOver(savedOver);
      setIsWon(savedWon);
      setFinalScore(savedScore);
      setMysteryPlayer(savedMystery);

      try {
        const res = await fetch(`/api/daily?date=${date}&clues=${savedClues}`);
        const data = await res.json();
        if (data.clues) {
          setCluesData(data.clues);
        }
      } catch (err) {
        console.error('Failed to fetch daily clues:', err);
      }

      if (savedOver && savedMystery) {
        setShowResultsModal(true);
      }
    } else {
      setIncorrectGuesses([]);
      setIsGameOver(false);
      setIsWon(false);
      setFinalScore(0);
      setMysteryPlayer(undefined);
      setCluesRevealed(1);

      try {
        const url = customPracticeId
          ? `/api/practice?id=${customPracticeId}&clues=1`
          : '/api/practice?clues=1';
        const res = await fetch(url);
        const data = await res.json();
        setPracticePlayerId(data.practiceId);
        setCluesData(data.clues);
      } catch (err) {
        console.error('Failed to start practice:', err);
      }
    }

    setLoading(false);
  };

  const handleModeChange = (newMode: 'daily' | 'practice') => {
    setMode(newMode);
    loadGameState(newMode, currentDateStr);
  };

  const persistDailyState = (
    clues: number,
    guesses: string[],
    over: boolean,
    won: boolean,
    score: number,
    mystery?: Footballer
  ) => {
    if (mode === 'daily') {
      const storageKey = `footle_daily_${currentDateStr}`;
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          cluesRevealed: clues,
          guesses,
          isGameOver: over,
          isWon: won,
          score,
          mysteryPlayer: mystery,
        })
      );
    }
  };

  const handleRevealNextClue = async () => {
    if (cluesRevealed >= 6 || isGameOver) return;
    const nextIndex = cluesRevealed + 1;
    setCluesRevealed(nextIndex);

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totalCluesRevealed: 1 }),
    }).catch(() => {});

    try {
      if (mode === 'daily') {
        const res = await fetch(`/api/daily?date=${currentDateStr}&clues=${nextIndex}`);
        const data = await res.json();
        setCluesData(data.clues);
        persistDailyState(nextIndex, incorrectGuesses, isGameOver, isWon, finalScore, mysteryPlayer);
      } else {
        const res = await fetch(`/api/practice?id=${practicePlayerId}&clues=${nextIndex}`);
        const data = await res.json();
        setCluesData(data.clues);
      }
    } catch (err) {
      console.error('Failed to reveal clue:', err);
    }
  };

  const handleGiveUp = async () => {
    if (isGameOver) return;
    try {
      const endpoint = mode === 'daily' ? '/api/daily' : '/api/practice';
      const body =
        mode === 'daily'
          ? { date: currentDateStr, giveUp: true, cluesUsed: cluesRevealed }
          : { playerId: practicePlayerId, giveUp: true, cluesUsed: cluesRevealed };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      setIsGameOver(true);
      setIsWon(false);
      setFinalScore(0);
      setMysteryPlayer(data.mysteryPlayer);
      setShowResultsModal(true);
      setFeedbackMessage(data.message);

      if (mode === 'daily') {
        persistDailyState(cluesRevealed, incorrectGuesses, true, false, 0, data.mysteryPlayer);
      }

      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gamesCompleted: 1, dailyCount: mode === 'daily' ? 1 : 0, practiceCount: mode === 'practice' ? 1 : 0 }),
      }).catch(() => {});
    } catch (err) {
      console.error('Failed to give up:', err);
    }
  };

  const handlePlayerGuess = async (selected: { displayName: string; id: string }) => {
    if (isGameOver) return;

    if (incorrectGuesses.includes(selected.displayName)) {
      setFeedbackMessage(`You already guessed "${selected.displayName}".`);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 350);
      return;
    }

    try {
      const endpoint = mode === 'daily' ? '/api/daily' : '/api/practice';
      const body =
        mode === 'daily'
          ? { date: currentDateStr, guess: selected.displayName, cluesUsed: cluesRevealed }
          : { playerId: practicePlayerId, guess: selected.displayName, cluesUsed: cluesRevealed };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.isCorrect) {
        setIsGameOver(true);
        setIsWon(true);
        setFinalScore(data.score);
        setMysteryPlayer(data.mysteryPlayer);
        setShowResultsModal(true);
        setFeedbackMessage(data.message);

        if (mode === 'daily') {
          persistDailyState(cluesRevealed, incorrectGuesses, true, true, data.score, data.mysteryPlayer);
        }

        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gamesCompleted: 1,
            totalScore: data.score,
            dailyCount: mode === 'daily' ? 1 : 0,
            practiceCount: mode === 'practice' ? 1 : 0,
          }),
        }).catch(() => {});
      } else {
        const nextGuesses = [...incorrectGuesses, selected.displayName];
        setIncorrectGuesses(nextGuesses);
        setFeedbackMessage(data.message);

        // Tactile shake feedback on miss
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 350);

        if (mode === 'daily') {
          persistDailyState(cluesRevealed, nextGuesses, false, false, 0);
        }
      }
    } catch (err) {
      console.error('Error submitting guess:', err);
    }
  };

  const currentScoreValue = calculateScore(cluesRevealed, true);

  return (
    <main className="min-h-screen px-4 py-4 pb-16 max-w-lg mx-auto flex flex-col items-center pitch-lines">
      <ScoreHeader
        cluesUsed={cluesRevealed}
        scoreIfGuessedNow={currentScoreValue}
        mode={mode}
        dateStr={currentDateStr}
        onSwitchMode={handleModeChange}
      />

      {/* Main Guessing Controls with error shake */}
      <div className={`w-full mb-3.5 ${isShaking ? 'animate-shake' : ''}`}>
        <PlayerSearch
          onSelectPlayer={handlePlayerGuess}
          disabled={isGameOver || loading}
          incorrectGuesses={incorrectGuesses}
        />

        {/* Feedback Message Banner */}
        {feedbackMessage && (
          <div
            className={`mt-2.5 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-clue-enter ${
              isWon
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200 shadow-sm'
                : 'bg-rose-950/60 border-rose-500/30 text-rose-200'
            }`}
          >
            {isWon ? <Trophy className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Incorrect Guesses Tag Cloud */}
        {incorrectGuesses.length > 0 && !isGameOver && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mr-1">
              Misses:
            </span>
            {incorrectGuesses.map((name, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/40 text-rose-300 border border-rose-500/25 flex items-center gap-1"
              >
                <span>✕</span> {name}
              </span>
            ))}
          </div>
        )}

        {/* Clue Controls */}
        {!isGameOver && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={handleRevealNextClue}
              disabled={cluesRevealed >= 6}
              className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border pressable transition-all ${
                cluesRevealed >= 6
                  ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-[#13222e] hover:bg-[#182b3a] border-[#223a4e] text-emerald-300 shadow-md'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Reveal Clue {cluesRevealed < 6 ? cluesRevealed + 1 : 'Max'}</span>
            </button>

            <button
              onClick={handleGiveUp}
              className="py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-[#121820] hover:bg-rose-950/40 border border-[#1e2833] hover:border-rose-900/40 text-slate-400 hover:text-rose-300 pressable transition-all"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Give Up (0 Pts)</span>
            </button>
          </div>
        )}

        {/* Game Over Banner */}
        {isGameOver && (
          <div className="mt-3 p-3.5 card-specular rounded-xl flex items-center justify-between border-emerald-500/40">
            <div className="text-xs">
              <span className="font-bold text-slate-100">Match Finished! </span>
              <span className="text-emerald-400 font-mono font-extrabold">
                Score: {finalScore}/6
              </span>
            </div>
            <button
              onClick={() => setShowResultsModal(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-400 text-slate-950 text-xs font-extrabold hover:bg-emerald-300 pressable"
            >
              Results Card
            </button>
          </div>
        )}
      </div>

      {/* Clues Card Stack */}
      <CluesContainer
        currentClueIndex={cluesRevealed}
        clues={cluesData}
        isGameOver={isGameOver}
      />

      {/* Clean single footer link */}
      <footer className="w-full mt-8 pt-4 border-t border-[#192735] flex items-center justify-center text-xs text-slate-400">
        <a href="/how-to-play" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 font-medium">
          <HelpCircle className="w-3.5 h-3.5" /> How to Play & Rules
        </a>
      </footer>

      {/* Results Modal */}
      {mysteryPlayer && (
        <ResultsModal
          isOpen={showResultsModal}
          onClose={() => setShowResultsModal(false)}
          mysteryPlayer={mysteryPlayer}
          score={finalScore}
          cluesUsed={cluesRevealed}
          isWon={isWon}
          gameMode={mode}
          dateStr={currentDateStr}
          onPlayAgainPractice={() => loadGameState('practice', currentDateStr)}
        />
      )}
    </main>
  );
}
