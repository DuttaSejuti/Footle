export interface Footballer {
  id: string;
  fullName: string;
  displayName: string;
  alternativeNames: string[];
  nationality: string;
  countryCode: string; // ISO 2-letter for flags, e.g. "AR", "PT", "FR"
  flagEmoji: string;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
  currentClub: string; // or last club if retired
  isRetired: boolean;
  previousClubs: string[]; // Chronological previous clubs
  achievements: string[]; // Major trophies / milestones
  imageUrl?: string;
  imageAttribution?: string;
  imageLicense?: string;
  sourceUrl?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isActive: boolean;
}

export interface GuessResult {
  isCorrect: boolean;
  score: number;
  cluesUsed: number;
  mysteryPlayer?: Footballer; // revealed on win or give up
  message: string;
}

export interface DailyPlayerInfo {
  date: string; // YYYY-MM-DD (UTC)
  revealedClues: {
    clue1Nationality: { nationality: string; countryCode: string; flagEmoji: string };
    clue2Position?: string;
    clue3CurrentClub?: { club: string; isRetired: boolean };
    clue4PreviousClubs?: string[];
    clue5Achievements?: string[];
    clue6Photo?: {
      imageUrl?: string;
      imageAttribution?: string;
      imageLicense?: string;
      blurStage: number; // 1 to 6
    };
  };
  currentClueIndex: number; // 1 to 6
  isGameOver: boolean;
  solved: boolean;
  pointsAwarded: number;
  mysteryPlayer?: Footballer;
}

export interface UserGameState {
  date: string;
  mode: 'daily' | 'practice';
  cluesRevealed: number; // 1 to 6
  guesses: string[]; // footballer IDs or display names
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
