import Link from 'next/link';
import { ArrowLeft, Check, HelpCircle } from 'lucide-react';

export const metadata = {
  title: "How to Play — FOOTYDLE",
  description: "Learn how to play FOOTYDLE: matchday rules, tile feedback, and clues.",
};

export default function HowToPlay() {
  return (
    <main className="min-h-screen px-4 py-8 max-w-lg mx-auto text-white pitch-bg">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-black text-emerald-200 hover:text-white mb-6 transition-colors bg-[#0e331c] px-3 py-1.5 rounded-lg border-2 border-emerald-400"
      >
        <ArrowLeft className="w-4 h-4 stroke-[3]" /> Back to Matchday
      </Link>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-3xl">⚽</span>
        <h1 className="text-3xl font-headline font-black uppercase tracking-wide">How to Play</h1>
      </div>

      <p className="text-emerald-100 text-sm leading-relaxed mb-6 font-medium">
        <strong>FOOTYDLE</strong> is a daily football player guessing game inspired by Wordle and Poeltl. You have <strong>6 substitution attempts</strong> to identify the mystery footballer.
      </p>

      {/* Wordle Tile Matching Rules */}
      <h2 className="text-lg font-black text-emerald-300 uppercase tracking-wider mb-3">
        Matchday Tile Indicators
      </h2>

      <div className="space-y-3 mb-8">
        <div className="p-3 bg-[#0e331c] border-2 border-emerald-400 rounded-xl flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-[#15803d] border-2 border-emerald-400 flex items-center justify-center font-bold text-white shrink-0">
            🟩
          </div>
          <div>
            <span className="text-sm font-black text-white block">Exact Match (Green)</span>
            <p className="text-xs text-emerald-100">
              The player attribute (Nationality, League, Club, Position, or Age) is an exact match for the mystery footballer.
            </p>
          </div>
        </div>

        <div className="p-3 bg-[#0e331c] border-2 border-yellow-400 rounded-xl flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-[#eab308] border-2 border-yellow-300 flex items-center justify-center font-bold text-zinc-950 shrink-0">
            🟨
          </div>
          <div>
            <span className="text-sm font-black text-white block">Close / Direction (Yellow)</span>
            <p className="text-xs text-emerald-100">
              For <strong>Position</strong>: tactical role is adjacent (e.g. Midfielder vs Forward).<br />
              For <strong>Age</strong>: indicates whether the mystery footballer is older (⬆️) or younger (⬇️).
            </p>
          </div>
        </div>

        <div className="p-3 bg-[#0e331c] border-2 border-[#294a34] rounded-xl flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-[#0f1f15] border-2 border-[#294a34] flex items-center justify-center font-bold text-slate-300 shrink-0">
            ⬛
          </div>
          <div>
            <span className="text-sm font-black text-white block">Incorrect (Dark Grey)</span>
            <p className="text-xs text-emerald-100">
              No overlap with the mystery footballer for that attribute.
            </p>
          </div>
        </div>
      </div>

      {/* Rules */}
      <h2 className="text-lg font-black text-emerald-300 uppercase tracking-wider mb-3">
        Rules & Features
      </h2>
      <ul className="space-y-2 text-xs text-emerald-100 list-disc list-inside mb-8 font-medium">
        <li><strong>Daily Matchday:</strong> Everyone around the globe receives the same mystery footballer each UTC calendar day.</li>
        <li><strong>6 Substitution Attempts:</strong> Use demographic clues from each guess to deduce the player.</li>
        <li><strong>Autocomplete Search:</strong> Quick lookups with club, league, age, and position tags. Diacritics are auto-normalized (e.g. <em>Modrić</em> = <em>modric</em>).</li>
        <li><strong>No Repeats:</strong> Prevents accidentally re-submitting players you already tried.</li>
      </ul>

      <div className="text-center">
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-headline font-black text-sm uppercase tracking-wider border-2 border-emerald-300 shadow-xl"
        >
          Play Today&apos;s Fixture
        </Link>
      </div>
    </main>
  );
}
