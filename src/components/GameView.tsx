'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WordleSearch, PlayerOption } from '@/components/WordleSearch';
import { WordleGrid } from '@/components/WordleGrid';
import { ResultsModal } from '@/components/ResultsModal';
import { Footballer, GuessComparison } from '@/types/footballer';
import { getUtcTodayDateString } from '@/lib/game-logic';
import { HelpCircle, Trophy, AlertCircle } from 'lucide-react';

export default function GameView() {
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [cluesRevealed, setCluesRevealed] = useState<number>(1);
  const [comparisons, setComparisons] = useState<GuessComparison[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [mysteryPlayer, setMysteryPlayer] = useState<Footballer | undefined>();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showResultsModal, setShowResultsModal] = useState<boolean>(false);
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

    loadGameState(today);
  }, []);

  const loadGameState = async (date: string) => {
    setLoading(true);
    setFeedbackMessage(null);

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

    if (savedOver && savedMystery) {
      setShowResultsModal(true);
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
  };

  const handleGiveUp = async () => {
    if (isGameOver) return;
    try {
      const body = { date: currentDateStr, giveUp: true, cluesUsed: comparisons.length || 6 };

      const res = await fetch('/api/daily', {
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

      persistDailyState(cluesRevealed, comparisons, true, false, 0, data.mysteryPlayer);
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
      const body = {
        date: currentDateStr,
        guess: selected.displayName,
        guessedPlayerId: selected.id,
        cluesUsed: attemptsCount,
      };

      const res = await fetch('/api/daily', {
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

          persistDailyState(cluesRevealed, nextComparisons, true, true, data.score, data.mysteryPlayer);

          fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gamesCompleted: 1,
              totalScore: data.score,
              dailyCount: 1,
            }),
          }).catch(() => {});
        } else {
          if (nextComparisons.length >= 6) {
            handleGiveUp();
          } else {
            setFeedbackMessage(data.message);
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 350);

            persistDailyState(cluesRevealed, nextComparisons, false, false, 0);
          }
        }
      }
    } catch (err) {
      console.error('Error submitting guess:', err);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-between relative overflow-x-hidden">
      {/* Crisp Pitch Chalk Markings Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-25 overflow-hidden">
        <div className="w-[600px] h-[600px] rounded-full border-4 border-white absolute" />
        <div className="w-4 h-4 rounded-full bg-white absolute" />
        <div className="w-full h-[4px] bg-white absolute top-1/2 -translate-y-1/2" />
        <div className="w-[340px] h-[170px] border-4 border-t-0 border-white rounded-b-full absolute -top-10 opacity-50" />
        <div className="w-[340px] h-[170px] border-4 border-b-0 border-white rounded-t-full absolute -bottom-10 opacity-50" />
      </div>

      {/* High-Contrast Matchday Header */}
      <header className="w-full border-b-2 border-white/20 bg-[#0c2f1a]/95 backdrop-blur-md sticky top-0 z-50 shadow-md">
        <div className="max-w-[760px] mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left Match Utility Icons */}
          <div className="flex items-center gap-2">
            <Link
              href="/how-to-play"
              aria-label="Help & Pitch Rules"
              className="w-10 h-10 rounded-lg border-2 border-emerald-400/80 bg-[#144f2c] flex items-center justify-center text-white hover:bg-emerald-600 transition-colors shadow-sm"
            >
              <HelpCircle className="w-5 h-5 stroke-[2.5]" />
            </Link>
          </div>

          {/* Center Wordle Title with Chalk Aesthetic */}
          <div className="flex flex-col items-center select-none">
            <h1 className="font-headline text-2xl tracking-[0.2em] font-black uppercase text-white flex items-center gap-1 drop-shadow-md">
              FOOTY<span className="text-emerald-300 font-black border-b-4 border-emerald-400 pb-0.5">DLE</span>
            </h1>
            <span className="font-mono text-xs text-emerald-100 tracking-widest uppercase font-extrabold drop-shadow">
              Daily Matchday • {currentDateStr}
            </span>
          </div>

          {/* Right Stats & Tactics Counter */}
          <div className="flex items-center gap-2">
            <div className="bg-[#0b2917] border-2 border-emerald-400 px-3.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-sm font-black text-white tracking-wider">
                {comparisons.length}/6
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Central Pitch Wordle Board */}
      <main className="w-full max-w-[760px] mx-auto px-4 py-6 flex-1 flex flex-col justify-start gap-4 z-10">
        {/* Dugout Search & Input Area */}
        <div className={`w-full ${isShaking ? 'animate-shake' : ''}`}>
          <WordleSearch
            onSelectPlayer={handlePlayerGuess}
            disabled={isGameOver || loading}
            guessedPlayerIds={comparisons.map((c) => c.player.id)}
          />

          {feedbackMessage && (
            <div
              className={`mt-2.5 p-3.5 rounded-xl border-2 text-xs font-black flex items-center gap-2 animate-clue-enter shadow-lg ${
                isWon
                  ? 'bg-[#15803d] border-emerald-300 text-white'
                  : 'bg-[#7f1d1d] border-red-400 text-white'
              }`}
            >
              {isWon ? <Trophy className="w-5 h-5 text-yellow-300 shrink-0 stroke-[2.5]" /> : <AlertCircle className="w-5 h-5 text-red-200 shrink-0 stroke-[2.5]" />}
              <span>{feedbackMessage}</span>
            </div>
          )}
        </div>

        {/* 6-ROW GUESS MATRIX */}
        <WordleGrid comparisons={comparisons} maxAttempts={6} />

        {isGameOver && (
          <div className="mt-2 p-4 bg-[#0c2f1a] border-2 border-emerald-400 rounded-xl flex items-center justify-between animate-clue-enter shadow-xl">
            <div className="text-sm">
              <span className="font-black text-white">Matchday Concluded! </span>
              <span className="text-emerald-300 font-mono font-black">
                {isWon ? `Solved in ${comparisons.length}/6 attempts` : 'Full Time'}
              </span>
            </div>
            <button
              onClick={() => setShowResultsModal(true)}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-headline text-xs font-black uppercase tracking-wider border-2 border-emerald-300 shadow-md pressable"
            >
              Match Summary Card
            </button>
          </div>
        )}
      </main>

      {/* High-Contrast Touchline Footer with Countdown */}
      <footer className="w-full border-t-2 border-white/20 py-3.5 bg-[#0c2f1a]/95 z-20 shadow-inner">
        <div className="max-w-[760px] mx-auto px-4 flex items-center justify-between text-xs text-emerald-100 font-mono font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-white font-extrabold tracking-wide">FOOTYDLE • DAILY FIXTURE</span>
          </div>
          <span>
            Next mystery fixture in <strong className="text-yellow-300 tracking-widest font-black text-sm">{countdown}</strong>
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
          dateStr={currentDateStr}
        />
      )}
    </div>
  );
}
