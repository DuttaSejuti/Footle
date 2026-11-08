import { Footballer, GuessComparison, MatchStatus } from '@/types/footballer';

export function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isCorrectGuess(guess: string, mysteryPlayer: Footballer): boolean {
  const normGuess = normalizeString(guess);
  if (!normGuess) return false;

  const candidateNames = [
    mysteryPlayer.displayName,
    mysteryPlayer.fullName,
    ...mysteryPlayer.alternativeNames,
  ];

  return candidateNames.some((name) => normalizeString(name) === normGuess);
}

export function calculateScore(cluesUsed: number, isWon: boolean): number {
  if (!isWon) return 0;
  if (cluesUsed <= 1) return 6;
  if (cluesUsed === 2) return 5;
  if (cluesUsed === 3) return 4;
  if (cluesUsed === 4) return 3;
  if (cluesUsed === 5) return 2;
  return 1;
}

export function getUtcTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Wordle / Poeltl Comparison Engine
 * Compares guessed player vs target mystery player
 */
export function compareFootballers(guessed: Footballer, target: Footballer): GuessComparison {
  // 1. Nationality
  const natStatus: MatchStatus =
    normalizeString(guessed.nationality) === normalizeString(target.nationality)
      ? 'correct'
      : 'wrong';

  // 2. League
  const leagueStatus: MatchStatus =
    normalizeString(guessed.league) === normalizeString(target.league)
      ? 'correct'
      : 'wrong';

  // 3. Club
  const clubStatus: MatchStatus =
    normalizeString(guessed.currentClub) === normalizeString(target.currentClub)
      ? 'correct'
      : 'wrong';

  // 4. Position
  let posStatus: MatchStatus = 'wrong';
  if (guessed.position === target.position) {
    posStatus = 'correct';
  } else if (
    (guessed.position === 'Midfielder' && target.position === 'Forward') ||
    (guessed.position === 'Forward' && target.position === 'Midfielder') ||
    (guessed.position === 'Defender' && target.position === 'Midfielder') ||
    (guessed.position === 'Midfielder' && target.position === 'Defender')
  ) {
    posStatus = 'partial'; // Adjacent pitch tactical line
  }

  // 5. Age
  let ageStatus: MatchStatus = 'correct';
  if (guessed.age < target.age) {
    ageStatus = 'higher'; // Target player is older ⬆️
  } else if (guessed.age > target.age) {
    ageStatus = 'lower'; // Target player is younger ⬇️
  }

  const isExact =
    natStatus === 'correct' &&
    leagueStatus === 'correct' &&
    clubStatus === 'correct' &&
    posStatus === 'correct' &&
    ageStatus === 'correct';

  return {
    player: {
      id: guessed.id,
      displayName: guessed.displayName,
      flagEmoji: guessed.flagEmoji,
      imageUrl: guessed.imageUrl,
    },
    nationality: {
      value: guessed.nationality,
      code: guessed.countryCode,
      flag: guessed.flagEmoji,
      status: natStatus,
    },
    league: {
      value: guessed.league,
      status: leagueStatus,
    },
    club: {
      value: guessed.currentClub,
      abbr: guessed.clubAbbr || guessed.currentClub.substring(0, 3).toUpperCase(),
      status: clubStatus,
    },
    position: {
      value: guessed.position,
      abbr: guessed.positionAbbr || guessed.position.substring(0, 3).toUpperCase(),
      status: posStatus,
    },
    age: {
      value: guessed.age,
      status: ageStatus,
      diff: target.age - guessed.age,
    },
    isExactMatch: isExact,
  };
}
