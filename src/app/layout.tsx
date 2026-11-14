import type { Metadata } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: "FOOTBLE — Daily Football Player Guessing Game",
  description: "Test your football knowledge on the pitch! Guess the mystery footballer in six tactical attempts with Wordle-style matchday feedback.",
  keywords: ["footble", "football wordle", "poeltl soccer", "football quiz", "mystery player", "who is the footballer"],
  openGraph: {
    title: "FOOTBLE — Daily Mystery Footballer",
    description: "Can you guess today's mystery footballer using 6 tactical attempts? Play free on mobile & web.",
    type: "website",
    siteName: "FOOTBLE",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&family=Space+Grotesk:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="pitch-bg font-sans text-slate-100 antialiased selection:bg-emerald-500 selection:text-black min-h-screen relative overflow-x-hidden">
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
