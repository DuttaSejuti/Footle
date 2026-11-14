import Link from 'next/link';
import { ArrowLeft, Info, Trophy, Users, Heart } from 'lucide-react';

export const metadata = {
  title: "About — FOOTBLE",
  description: "Learn more about FOOTBLE: the daily football mystery guessing game, our mission, and fair-use attribution.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen px-4 py-8 max-w-2xl mx-auto text-white">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-black text-emerald-200 hover:text-white mb-6 transition-colors bg-[#0e331c] px-3 py-1.5 rounded-lg border-2 border-emerald-400"
      >
        <ArrowLeft className="w-4 h-4 stroke-[3]" /> Back to Matchday
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <Info className="w-8 h-8 text-emerald-400" />
        <h1 className="text-3xl font-headline font-black uppercase tracking-wide">About FOOTBLE</h1>
      </div>
      <p className="text-emerald-200 text-xs font-mono mb-8">The Daily Football Mystery Challenge</p>

      <div className="space-y-6 text-sm text-emerald-100/90 leading-relaxed font-sans">
        <section className="bg-[#0e331c] border-2 border-emerald-400/60 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-emerald-300">
            <Trophy className="w-5 h-5" />
            <h2 className="text-base font-black uppercase tracking-wider text-white">What is FOOTBLE?</h2>
          </div>
          <p>
            <strong>FOOTBLE</strong> is a daily football trivia game created for passionate football fans across the globe. Inspired by games like Wordle and Poeltl, FOOTBLE tests your knowledge of European leagues, international squads, player ages, and career history through 6 tactical substitution attempts.
          </p>
        </section>

        <section className="bg-[#0e331c] border-2 border-emerald-400/60 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-emerald-300">
            <Users className="w-5 h-5" />
            <h2 className="text-base font-black uppercase tracking-wider text-white">How It Works</h2>
          </div>
          <p className="mb-3">
            Every day at midnight UTC, a new mystery footballer is selected from the world&apos;s top leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1, and more).
          </p>
          <p>
            Every player gets the same mystery fixture each day, allowing you to compare your scores, tactical deductions, and streaks with friends and teammates.
          </p>
        </section>

        <section className="bg-[#0e331c] border-2 border-emerald-400/60 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-emerald-300">
            <Heart className="w-5 h-5" />
            <h2 className="text-base font-black uppercase tracking-wider text-white">Disclaimer & Fair Use</h2>
          </div>
          <p className="text-xs text-emerald-200 leading-normal">
            FOOTBLE is a fan-made, non-commercial trivia project created for entertainment and educational purposes under nominative fair use. All player names, team references, league names, and trademarks are the property of their respective clubs, leagues, and governing bodies (such as FIFA, UEFA, and domestic federations). FOOTBLE is not affiliated with, endorsed by, or sponsored by any league, club, or player.
          </p>
        </section>

        <section className="bg-[#0e331c] border-2 border-emerald-400/60 p-5 rounded-xl">
          <h2 className="text-base font-black uppercase tracking-wider text-white mb-2">Feedback & Contact</h2>
          <p className="text-xs text-emerald-200 leading-normal">
            Have feedback, noticed a statistic discrepancy, or want to suggest a feature? Feel free to reach out to us at{' '}
            <a
              href="mailto:konohasdp@gmail.com"
              className="font-mono text-emerald-300 font-bold hover:underline"
            >
              konohasdp@gmail.com
            </a>.
          </p>
        </section>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/how-to-play"
          className="px-6 py-3 rounded-xl bg-[#144f2c] hover:bg-[#1a6639] text-white font-headline font-black text-xs uppercase tracking-wider border-2 border-emerald-400 text-center shadow-lg"
        >
          View Game Rules
        </Link>
        <Link
          href="/"
          className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-headline font-black text-xs uppercase tracking-wider border-2 border-emerald-300 text-center shadow-xl"
        >
          Play Today&apos;s Matchday
        </Link>
      </div>
    </main>
  );
}
