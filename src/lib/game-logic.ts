import { Footballer } from '@/types/footballer';

/**
 * Normalizes string:
 * - lowercase
 * - strips diacritics / accents (e.g., Modrić -> modric, Mbappé -> mbappe)
 * - removes punctuation and excess spaces
 */
export function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // convert special chars to space
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validates a guess against a mystery player.
 * Checks fullName, displayName, and all alternativeNames.
 */
export function isCorrectGuess(guess: string, mysteryPlayer: Footballer): boolean {
  const normGuess = normalizeString(guess);
  if (!normGuess) return false;

  const candidateNames = [
    mysteryPlayer.displayName,
    mysteryPlayer.fullName,
    ...mysteryPlayer.alternativeNames,
  ];

  for (const name of candidateNames) {
    if (normalizeString(name) === normGuess) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate score according to specifications:
 * - Guess after clue 1: 6 points
 * - Guess after clue 2: 5 points
 * - Guess after clue 3: 4 points
 * - Guess after clue 4: 3 points
 * - Guess after clue 5: 2 points
 * - Guess after clue 6: 1 point
 * - Give up or unsolved: 0 points
 */
export function calculateScore(cluesUsed: number, isWon: boolean): number {
  if (!isWon) return 0;
  if (cluesUsed <= 1) return 6;
  if (cluesUsed === 2) return 5;
  if (cluesUsed === 3) return 4;
  if (cluesUsed === 4) return 3;
  if (cluesUsed === 5) return 2;
  return 1;
}

/**
 * Returns UTC date string 'YYYY-MM-DD'
 */
export function getUtcTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}
