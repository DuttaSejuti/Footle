'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WordleSearch, PlayerOption } from '@/components/WordleSearch';
import { WordleGrid } from '@/components/WordleGrid';
import { ScoutDrawer } from '@/components/ScoutDrawer';
import { ResultsModal } from '@/components/ResultsModal';
import { Footballer, GuessComparison } from '@/types/footballer';
import { getUtcTodayDateString, calculateScore } from '@/lib/game-logic';
import { HelpCircle, RotateCcw, Flag, Trophy, AlertCircle } from 'lucide-react';

export default function GameView() {
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [cluesRevealed, setCluesRevealed] = useState<number>(1);
  const [cluesData, setCluesData] = useState<any>({});
  const [comparisons, setComparisons] = useState<GuessComparison[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [mysteryPlayer, setMysteryPlayer] = useState<Footballer | undefined>();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showResultsModal, setShowResultsModal] = useState<boolean>(false);
  const [practicePlayerId, setPracticePlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<string>('00:00:00');

  // Countdown timer until next UTC midnight
  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      const diffSec = Math.max(0, Math.floor((tomorrow.getTime() - now.getTime()) / 1000));
      const h = String(Math.floor(diffSec / 3600)).padStart(2, '0');
      const m = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
      const s = String(diffSec % 60).padStart(2, '0');
      setCountdown(`${h}:${m}:${s}`);
    }
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize and load saved state
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
      const storageKey = `footle_wordle_${date}`;
      const saved = localStorage.getItem(storageKey);

      let savedClues = 1;
      let savedComparisons: GuessComparison[] = [];
      let savedOver = false;
      let savedWon = false;
      let savedScore = 0;
      let savedMystery: Footballer | undefined = undefined;

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          savedClues = parsed.cluesRevealed || 1;
          savedComparisons = parsed.comparisons || [];
          savedOver = parsed.isGameOver || false;
          savedWon = parsed.isWon || false;
          savedScore = parsed.score || 0;
          savedMystery = parsed.mysteryPlayer;
        } catch {}
      }

      setCluesRevealed(savedClues);
      setComparisons(savedComparisons);
      setIsGameOver(savedOver);
      setIsWon(savedWon);
      setFinalScore(savedScore);
      setMysteryPlayer(savedMystery);

      try {
        const res = await fetch(`/api/daily?date=${date}&clues=${savedClues}`);
        const data = await res.json();
        if (data.clues) setCluesData(data.clues);
      } catch (err) {
        console.error('Failed to fetch daily clues:', err);
      }

      if (savedOver && savedMystery) {
        setShowResultsModal(true);
      }
    } else {
      setComparisons([]);
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

  const persistDailyState = (
    clues: number,
    comps: GuessComparison[],
    over: boolean,
    won: boolean,
    score: number,
    mystery?: Footballer
  ) => {
    if (mode === 'daily') {
      const storageKey = `footle_wordle_${currentDateStr}`;
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          cluesRevealed: clues,
          comparisons: comps,
          isGameOver: over,
          isWon: won,
          score,
          mysteryPlayer: mystery,
        })
      );
    }
  };

  const handleModeChange = (newMode: 'daily' | 'practice') => {
    setMode(newMode);
    loadGameState(newMode, currentDateStr);
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
      const endpoint = mode === 'daily'
        ? `/api/daily?date=${currentDateStr}&clues=${nextIndex}`
        : `/api/practice?id=${practicePlayerId}&clues=${nextIndex}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setCluesData(data.clues);

      if (mode === 'daily') {
        persistDailyState(nextIndex, comparisons, isGameOver, isWon, finalScore, mysteryPlayer);
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
          ? { date: currentDateStr, giveUp: true, cluesUsed: comparisons.length || 6 }
          : { playerId: practicePlayerId, giveUp: true, cluesUsed: comparisons.length || 6 };

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
        persistDailyState(cluesRevealed, comparisons, true, false, 0, data.mysteryPlayer);
      }
    } catch (err) {
      console.error('Failed to surrender match:', err);
    }
  };

  const handlePlayerGuess = async (selected: PlayerOption) => {
    if (isGameOver) return;

    // Check if already guessed
    if (comparisons.some((c) => c.player.id === selected.id)) {
      setFeedbackMessage(`You already tried ${selected.displayName}!`);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 350);
      return;
    }

    try {
      const attemptsCount = comparisons.length + 1;
      const endpoint = mode === 'daily' ? '/api/daily' : '/api/practice';
      const body =
        mode === 'daily'
          ? {
              date: currentDateStr,
              guess: selected.displayName,
              guessedPlayerId: selected.id,
              cluesUsed: attemptsCount,
            }
          : {
              playerId: practicePlayerId,
              guess: selected.displayName,
              guessedPlayerId: selected.id,
              cluesUsed: attemptsCount,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.comparison) {
        const nextComparisons = [...comparisons, data.comparison];
        setComparisons(nextComparisons);

        if (data.isCorrect) {
          setIsGameOver(true);
          setIsWon(true);
          setFinalScore(data.score);
          setMysteryPlayer(data.mysteryPlayer);
          setShowResultsModal(true);
          setFeedbackMessage(data.message);

          if (mode === 'daily') {
            persistDailyState(cluesRevealed, nextComparisons, true, true, data.score, data.mysteryPlayer);
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
          // Check if maximum 6 attempts reached
          if (nextComparisons.length >= 6) {
            handleGiveUp();
          } else {
            setFeedbackMessage(data.message);
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 350);

            if (mode === 'daily') {
              persistDailyState(cluesRevealed, nextComparisons, false, false, 0);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error submitting guess:', err);
    }
  };

  const attemptsLeft = Math.max(0, 6 - comparisons.length);

  return (
    <div className="w-full min-h-screen flex flex-col justify-between bg-[#0a1017] text-slate-100">
      {/* Wordle Top Navbar */}
      <header className="w-full border-b border-[#1b2b3a] bg-[#070c12]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[760px] mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left utility icons */}
          <div className="flex items-center gap-1">
            <Link
              href="/how-to-play"
              aria-label="How to Play"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#152331] transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </Link>

            <button
              onClick={() => handleModeChange(mode === 'daily' ? 'practice' : 'daily')}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#142230] text-emerald-400 border border-[#21374d] hover:bg-[#1a2d40] transition-colors"
            >
              {mode === 'daily' ? 'Daily' : 'Practice'}
            </button>
          </div>

          {/* Center Brand Title */}
          <div className="flex flex-col items-center select-none">
            <h1 className="font-headline text-2xl font-black tracking-widest uppercase text-slate-100 flex items-center gap-1">
              FOOTY<span className="text-emerald-400 font-black">DLE</span>
            </h1>
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {mode === 'daily' ? `Daily Match • ${currentDateStr}` : 'Unlimited Training Mode'}
            </span>
          </div>

          {/* Right Status Badge */}
          <div className="flex items-center gap-2">
            <div className="bg-[#142332] border border-[#21374d] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs font-black text-slate-100">
                {comparisons.length}/6
              </span>
            </div>

            {!isGameOver && (
              <button
                onClick={handleGiveUp}
                aria-label="Give up"
                title="Give up match"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-[#1e1b22] transition-colors"
              >
                <Flag className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Central Board Container (max-w-[760px]) */}
      <main className="w-full max-w-[760px] mx-auto px-4 py-4 flex-1 flex flex-col justify-start gap-3.5">
        {/* Scout Silhouette & Intel Drawer */}
        <ScoutDrawer
          clues={cluesData}
          cluesRevealed={cluesRevealed}
          onRevealNext={handleRevealNextClue}
          isGameOver={isGameOver}
        />

        {/* Wordle Autocomplete Search Input */}
        <div className={`w-full ${isShaking ? 'animate-shake' : ''}`}>
          <WordleSearch
            onSelectPlayer={handlePlayerGuess}
            disabled={isGameOver || loading}
            guessedPlayerIds={comparisons.map((c) => c.player.id)}
          />

          {/* Feedback message banner */}
          {feedbackMessage && (
            <div
              className={`mt-2.5 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-clue-enter ${
                isWon
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/30 text-rose-200'
              }`}
            >
              {isWon ? <Trophy className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{feedbackMessage}</span>
            </div>
          )}
        </div>

        {/* Wordle / Poeltl Grid with Tile Match Feedback */}
        <WordleGrid comparisons={comparisons} maxAttempts={6} />

        {/* Game Finished Summary Pill */}
        {isGameOver && (
          <div className="mt-1 p-3.5 card-specular rounded-xl flex items-center justify-between border-emerald-500/40 animate-clue-enter">
            <div className="text-xs">
              <span className="font-bold text-slate-100">Match Concluded! </span>
              <span className="text-emerald-400 font-mono font-black">
                {isWon ? `Solved in ${comparisons.length}/6 attempts` : 'Better luck next time!'}
              </span>
            </div>
            <button
              onClick={() => setShowResultsModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-400 text-slate-950 text-xs font-black hover:bg-emerald-300 pressable"
            >
              Results Card
            </button>
          </div>
        )}
      </main>

      {/* Clean Wordle Footer */}
      <footer className="w-full border-t border-[#1b2b3a]/70 py-3 bg-[#070c12]/80 backdrop-blur-sm">
        <div className="max-w-[760px] mx-auto px-4 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>FOOTYDLE • DAILY MATCH</span>
          <span>
            Next mystery in <strong className="text-emerald-400 font-bold">{countdown}</strong>
          </span>
        </div>
      </footer>

      {/* Results Modal */}
      {mysteryPlayer && (
        <ResultsModal
          isOpen={showResultsModal}
          onClose={() => setShowResultsModal(false)}
          mysteryPlayer={mysteryPlayer}
          score={finalScore}
          cluesUsed={comparisons.length}
          isWon={isWon}
          gameMode={mode}
          dateStr={currentDateStr}
          onPlayAgainPractice={() => loadGameState('practice', currentDateStr)}
        />
      )}
    </div>
  );
}
