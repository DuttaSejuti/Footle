import Link from 'next/link';
import { ArrowLeft, Globe, UserCheck, Shield, History, Trophy, Image as ImageIcon } from 'lucide-react';

export const metadata = {
  title: "How to Play — Who's the Footballer?",
  description: "Learn how to play Who's the Footballer, scoring rules, and clue reveals.",
};

export default function HowToPlay() {
  return (
    <main className="min-h-screen px-4 py-8 max-w-lg mx-auto text-white">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 mb-6 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Game
      </Link>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-3xl">⚽</span>
        <h1 className="text-2xl font-black">How to Play</h1>
      </div>

      <p className="text-slate-300 text-sm leading-relaxed mb-6">
        <strong>Who&apos;s the Footballer?</strong> is a daily football trivia game. You have 6 progressive clues to deduce the mystery footballer. The fewer clues you use, the higher your score!
      </p>

      {/* Progressive Clues Breakdown */}
      <h2 className="text-lg font-bold text-emerald-400 mb-3">The 6 Clues</h2>
      <div className="space-y-3 mb-8">
        <div className="p-3 bg-[#121e28] border border-[#1e3345] rounded-xl flex items-start gap-3">
          <Globe className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-sm font-bold text-white block">Clue 1: Nationality & Flag (6 Pts)</span>
            <p className="text-xs text-slate-400">The country the player represents internationally.</p>
          </div>
        </div>

        <div className="p-3 bg-[#121e28] border border-[#1e3345] rounded-xl flex items-start gap-3">
          <UserCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-sm font-bold text-white block">Clue 2: Position (5 Pts)</span>
            <p className="text-xs text-slate-400">Goalkeeper, Defender, Midfielder, or Forward.</p>
          </div>
        </div>

        <div className="p-3 bg-[#121e28] border border-[#1e3345] rounded-xl flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-sm font-bold text-white block">Clue 3: Current / Last Club (4 Pts)</span>
            <p className="text-xs text-slate-400">Current club, or most recent club for retired legends.</p>
          </div>
        </div>

        <div className="p-3 bg-[#121e28] border border-[#1e3345] rounded-xl flex items-start gap-3">
          <History className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-sm font-bold text-white block">Clue 4: Career History (3 Pts)</span>
            <p className="text-xs text-slate-400">Key previous clubs in chronological order.</p>
          </div>
        </div>

        <div className="p-3 bg-[#121e28] border border-[#1e3345] rounded-xl flex items-start gap-3">
          <Trophy className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-sm font-bold text-white block">Clue 5: Major Honours (2 Pts)</span>
            <p className="text-xs text-slate-400">Trophies, Ballon d&apos;Or, Golden Boots, and milestones.</p>
          </div>
        </div>

        <div className="p-3 bg-[#121e28] border border-[#1e3345] rounded-xl flex items-start gap-3">
          <ImageIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-sm font-bold text-white block">Clue 6: Photo Silhouette (1 Pt)</span>
            <p className="text-xs text-slate-400">Progressive blur reveal of the player.</p>
          </div>
        </div>
      </div>

      {/* Rules */}
      <h2 className="text-lg font-bold text-emerald-400 mb-3">Rules & Scoring</h2>
      <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside mb-8">
        <li><strong>Incorrect guesses</strong> do not deduct points, but they also do not reveal the next clue automatically.</li>
        <li>You can press <strong>&quot;Reveal Clue&quot;</strong> anytime to get more information.</li>
        <li>If you <strong>Give Up</strong>, the player is revealed and you score 0 points.</li>
        <li><strong>Daily Challenge:</strong> A new footballer every calendar day at 00:00 UTC. Everyone across the globe gets the same player!</li>
        <li><strong>Practice Mode:</strong> Play infinite random matches anytime to hone your football IQ.</li>
      </ul>

      <div className="text-center">
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
        >
          Play Today&apos;s Match
        </Link>
      </div>
    </main>
  );
}
