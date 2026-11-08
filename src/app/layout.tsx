import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Who's the Footballer? — Daily Football Player Guessing Game",
  description: "Test your football knowledge! Guess the mystery footballer in six progressive clues. Daily challenges, verified stats, and streak tracking.",
  keywords: ["football", "soccer", "wordle football", "who is the footballer", "trivia", "player quiz", "daily challenge"],
  openGraph: {
    title: "Who's the Footballer? — Daily Mystery Football Player",
    description: "Can you guess today's mystery footballer using 6 clues? Play now free on mobile & web.",
    type: "website",
    siteName: "Who's the Footballer?",
  },
  twitter: {
    card: "summary_large_image",
    title: "Who's the Footballer?",
    description: "Daily football player guessing game. 6 progressive clues. Test your IQ!",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
