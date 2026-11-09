export interface Footballer {
  id: string;
  fullName: string;
  displayName: string;
  alternativeNames: string[];
  nationality: string;
  countryCode: string; // ISO 2-letter for flags, e.g. "AR", "PT", "FR"
  flagEmoji: string;
  league: string; // e.g. "Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "MLS", "Saudi Pro"
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
  positionAbbr: 'GK' | 'DEF' | 'MID' | 'FWD';
  currentClub: string; // or last club if retired
  age: number;
  birthYear?: number;
  isRetired: boolean;
  previousClubs: string[]; // Chronological previous clubs
  imageUrl?: string;
  imageAttribution?: string;
  imageLicense?: string;
  sourceUrl?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isActive: boolean;
}

export type MatchStatus = 'correct' | 'partial' | 'wrong' | 'higher' | 'lower';

export interface GuessComparison {
  player: {
    id: string;
    displayName: string;
    flagEmoji: string;
    imageUrl?: string;
  };
  nationality: {
    value: string;
    code: string;
    flag: string;
    status: MatchStatus;
  };
  league: {
    value: string;
    status: MatchStatus;
  };
  club: {
    value: string;
    status: MatchStatus;
  };
  position: {
    value: string;
    abbr: string;
    status: MatchStatus;
  };
  age: {
    value: number;
    status: MatchStatus; // 'correct', 'higher' (target is older/higher), 'lower' (target is younger/lower)
    diff: number;
  };
  isExactMatch: boolean;
}

export interface GuessResult {
  isCorrect: boolean;
  score: number;
  cluesUsed: number;
  comparison?: GuessComparison;
  mysteryPlayer?: Footballer;
  message: string;
}

export interface UserGameState {
  date: string;
  mode: 'daily' | 'practice';
  cluesRevealed: number; // 1 to 6
  guesses: string[]; // names guessed
  comparisons: GuessComparison[]; // Wordle comparison rows
  isGameOver: boolean;
  isWon: boolean;
  score: number;
  mysteryPlayer?: Footballer;
}

export interface GameAnalytics {
  dailyVisitors: number;
  gamesStarted: number;
  gamesCompleted: number;
  totalScore: number;
  totalCluesRevealed: number;
  practiceCount: number;
  dailyCount: number;
  shareClicks: number;
}
