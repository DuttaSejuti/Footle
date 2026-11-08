'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WordleSearch, PlayerOption } from '@/components/WordleSearch';
import { WordleGrid } from '@/components/WordleGrid';
import { ScoutDrawer } from '@/components/ScoutDrawer';
import { ResultsModal } from '@/components/ResultsModal';
import { Footballer, GuessComparison } from '@/types/footballer';
import { getUtcTodayDateString } from '@/lib/game-logic';
import { HelpCircle, Calendar, BarChart3, Flag, Trophy, AlertCircle } from 'lucide-react';

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
  const [countdown, setCountdown] = useState<string>('08:42:12');

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
      const storageKey = `footle_pitch_${date}`;
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
      const storageKey = `footle_pitch_${currentDateStr}`;
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

    if (comparisons.some((c) => c.player.id === selected.id)) {
      setFeedbackMessage(`You already subbed in ${selected.displayName}!`);
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

  return (
    <div className="w-full min-h-screen flex flex-col justify-between relative overflow-x-hidden">
      {/* Ghosted Pitch Chalk Markings Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-15 overflow-hidden">
        {/* Center circle */}
        <div className="w-[580px] h-[580px] rounded-full border-[3px] border-white absolute" />
        <div className="w-3.5 h-3.5 rounded-full bg-white absolute" />
        {/* Halfway line */}
        <div className="w-full h-[3px] bg-white absolute top-1/2 -translate-y-1/2" />
        {/* Top Penalty box arc hint */}
        <div className="w-[320px] h-[160px] border-[3px] border-t-0 border-white rounded-b-full absolute -top-8 opacity-40" />
        {/* Bottom Penalty box arc hint */}
        <div className="w-[320px] h-[160px] border-[3px] border-b-0 border-white rounded-t-full absolute -bottom-8 opacity-40" />
      </div>

      {/* Minimal Matchday Header */}
      <header className="w-full border-b border-turf-border/60 bg-turf-dark/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[760px] mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left Match Utility Icons */}
          <div className="flex items-center gap-1.5">
            <Link
              href="/how-to-play"
              aria-label="Help & Pitch Rules"
              className="w-9 h-9 rounded-md border border-turf-border/50 bg-turf-base/80 flex items-center justify-center text-turf-muted hover:text-white hover:border-turf-chalk/40 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </Link>

            <button
              onClick={() => handleModeChange(mode === 'daily' ? 'practice' : 'daily')}
              className="px-2.5 py-1 rounded border border-turf-border/50 bg-turf-base/80 text-xs font-mono font-bold text-turf-muted hover:text-white transition-colors"
            >
              {mode === 'daily' ? 'Daily' : 'Practice'}
            </button>
          </div>

          {/* Center Wordle Title with Chalk Aesthetic */}
          <div className="flex flex-col items-center select-none">
            <h1 className="font-headline text-2xl tracking-[0.2em] font-black uppercase text-white flex items-center gap-1">
              FOOTY<span className="text-emerald-400 font-extrabold border-b-2 border-emerald-400 pb-0.5">DLE</span>
            </h1>
            <span className="font-mono text-[10px] text-turf-muted tracking-widest uppercase font-semibold">
              {mode === 'daily' ? `Matchday • ${currentDateStr}` : 'Training Matchday'}
            </span>
          </div>

          {/* Right Stats & Tactics Counter */}
          <div className="flex items-center gap-2">
            <div className="bg-turf-dark border border-turf-border px-3 py-1 rounded-md flex items-center gap-1.5 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs font-bold text-white tracking-wider">
                {comparisons.length}/6
              </span>
            </div>

            {!isGameOver && (
              <button
                onClick={handleGiveUp}
                aria-label="Give up"
                title="Give up match"
                className="w-9 h-9 rounded-md border border-turf-border/50 bg-turf-base/80 flex items-center justify-center text-turf-muted hover:text-red-400 transition-colors"
              >
                <Flag className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Central Pitch Wordle Board */}
      <main className="w-full max-w-[760px] mx-auto px-4 py-5 flex-1 flex flex-col justify-start gap-3.5 z-10">
        {/* Pitch Scouting Drawer / Hint bar */}
        <ScoutDrawer
          clues={cluesData}
          cluesRevealed={cluesRevealed}
          onRevealNext={handleRevealNextClue}
          isGameOver={isGameOver}
        />

        {/* Dugout Search & Input Area */}
        <div className={`w-full ${isShaking ? 'animate-shake' : ''}`}>
          <WordleSearch
            onSelectPlayer={handlePlayerGuess}
            disabled={isGameOver || loading}
            guessedPlayerIds={comparisons.map((c) => c.player.id)}
          />

          {feedbackMessage && (
            <div
              className={`mt-2.5 p-3 rounded-lg border text-xs font-bold flex items-center gap-2 animate-clue-enter ${
                isWon
                  ? 'bg-match-exact/20 border-match-exactBorder text-emerald-300'
                  : 'bg-red-950/60 border-red-700/50 text-red-200'
              }`}
            >
              {isWon ? <Trophy className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
              <span>{feedbackMessage}</span>
            </div>
          )}
        </div>

        {/* 6-ROW GUESS MATRIX */}
        <WordleGrid comparisons={comparisons} maxAttempts={6} />

        {isGameOver && (
          <div className="mt-2 p-3 bg-turf-dark border border-turf-border rounded-lg flex items-center justify-between animate-clue-enter">
            <div className="text-xs">
              <span className="font-bold text-white">Matchday Concluded! </span>
              <span className="text-emerald-400 font-mono font-bold">
                {isWon ? `Solved in ${comparisons.length}/6 attempts` : 'Full Time'}
              </span>
            </div>
            <button
              onClick={() => setShowResultsModal(true)}
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-headline text-xs font-black uppercase tracking-wider border border-emerald-400"
            >
              Match Summary Card
            </button>
          </div>
        )}
      </main>

      {/* Authentic Touchline Footer with Countdown */}
      <footer className="w-full border-t border-turf-border/80 py-3 bg-turf-dark/95 z-20">
        <div className="max-w-[760px] mx-auto px-4 flex items-center justify-between text-xs text-turf-muted font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>FOOTYDLE • PITCH VERIFIED</span>
          </div>
          <span>
            Next mystery fixture in <strong className="text-white tracking-widest">{countdown}</strong>
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
