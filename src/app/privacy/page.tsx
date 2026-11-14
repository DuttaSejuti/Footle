import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: "Privacy Policy — FOOTBLE",
  description: "Privacy policy for FOOTBLE, explaining cookies, Google AdSense advertising, and analytics.",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen px-4 py-8 max-w-2xl mx-auto text-white">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-black text-emerald-200 hover:text-white mb-6 transition-colors bg-[#0e331c] px-3 py-1.5 rounded-lg border-2 border-emerald-400"
      >
        <ArrowLeft className="w-4 h-4 stroke-[3]" /> Back to Matchday
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <ShieldCheck className="w-8 h-8 text-emerald-400" />
        <h1 className="text-3xl font-headline font-black uppercase tracking-wide">Privacy Policy</h1>
      </div>
      <p className="text-emerald-200 text-xs font-mono mb-8">Last Updated: November 2026</p>

      <div className="space-y-6 text-sm text-emerald-100/90 leading-relaxed font-sans">
        <section className="bg-[#0e331c] border-2 border-emerald-400/60 p-5 rounded-xl">
          <h2 className="text-base font-black text-white uppercase tracking-wider mb-2">1. Overview</h2>
          <p>
            Welcome to <strong>FOOTBLE</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We respect your privacy and are committed to protecting any information associated with your use of our daily football guessing game.
          </p>
        </section>

        <section className="bg-[#0e331c] border-2 border-emerald-400/60 p-5 rounded-xl">
          <h2 className="text-base font-black text-white uppercase tracking-wider mb-2">2. Information We Collect</h2>
          <p className="mb-2">
            FOOTBLE does not require user accounts or registration. We collect minimal data necessary to provide a smooth gaming experience:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-emerald-200">
            <li><strong>Local Game Progress:</strong> Your daily guesses, streaks, and scores are stored locally in your browser&apos;s localStorage. This information never leaves your device.</li>
            <li><strong>Anonymous Server Analytics:</strong> Aggregated, non-personally identifiable metrics (such as number of daily games played and win rates) to help us balance puzzle difficulty.</li>
            <li><strong>Standard Web Server Logs:</strong> IP address, browser type, and timestamps for security and diagnostic purposes.</li>
          </ul>
        </section>

        <section className="bg-[#0e331c] border-2 border-emerald-400/60 p-5 rounded-xl">
          <h2 className="text-base font-black text-white uppercase tracking-wider mb-2">3. Cookies and Google AdSense Advertising</h2>
          <p className="mb-3">
            We use third-party advertising companies, including <strong>Google AdSense</strong>, to serve ads when you visit our website.
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs text-emerald-200">
            <li>
              Google, as a third-party vendor, uses cookies to serve ads on FOOTBLE.
            </li>
            <li>
              Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit to our site and/or other sites on the Internet.
            </li>
            <li>
              Users may opt out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 underline font-bold hover:text-white"
              >
                Google Ads Settings
              </a>
              . Alternatively, you can opt out of third-party vendor cookies by visiting{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 underline font-bold hover:text-white"
              >
                aboutads.info
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="bg-[#0e331c] border-2 border-emerald-400/60 p-5 rounded-xl">
          <h2 className="text-base font-black text-white uppercase tracking-wider mb-2">4. Third-Party Links & Services</h2>
          <p>
            Our website may contain links to external sites (such as Wikipedia or sports statistics databases). We are not responsible for the privacy practices or content of external third-party websites.
          </p>
        </section>

        <section className="bg-[#0e331c] border-2 border-emerald-400/60 p-5 rounded-xl">
          <h2 className="text-base font-black text-white uppercase tracking-wider mb-2">5. Children&apos;s Privacy</h2>
          <p>
            FOOTBLE is suitable for all ages and does not knowingly collect any personally identifiable information from children under the age of 13.
          </p>
        </section>

        <section className="bg-[#0e331c] border-2 border-emerald-400/60 p-5 rounded-xl">
          <h2 className="text-base font-black text-white uppercase tracking-wider mb-2">6. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy or FOOTBLE, you can reach out via email at{' '}
            <a
              href="mailto:konohasdp@gmail.com"
              className="font-mono text-emerald-300 font-bold hover:underline"
            >
              konohasdp@gmail.com
            </a>.
          </p>
        </section>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-headline font-black text-sm uppercase tracking-wider border-2 border-emerald-300 shadow-xl"
        >
          Return to Game
        </Link>
      </div>
    </main>
  );
}
