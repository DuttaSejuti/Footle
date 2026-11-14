export interface UserStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string | null;
  lastWonDate: string | null;
}

const STATS_STORAGE_KEY = 'footble_user_stats';
const LEGACY_STORAGE_KEY = 'footle_user_stats';

export const DEFAULT_STATS: UserStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastPlayedDate: null,
  lastWonDate: null,
};

export function isConsecutiveDay(prevDateStr: string | null, currentDateStr: string): boolean {
  if (!prevDateStr) return false;
  const prev = new Date(prevDateStr + 'T00:00:00Z');
  const curr = new Date(currentDateStr + 'T00:00:00Z');
  const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

export function getUserStats(): UserStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      played: Number(parsed.played) || 0,
      wins: Number(parsed.wins) || 0,
      currentStreak: Number(parsed.currentStreak) || 0,
      maxStreak: Number(parsed.maxStreak) || 0,
      lastPlayedDate: typeof parsed.lastPlayedDate === 'string' ? parsed.lastPlayedDate : null,
      lastWonDate: typeof parsed.lastWonDate === 'string' ? parsed.lastWonDate : null,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function recordGameResult(
  currentStats: UserStats,
  currentDateStr: string,
  isWon: boolean
): UserStats {
  // If already recorded for this exact calendar date, do not duplicate play count
  if (currentStats.lastPlayedDate === currentDateStr) {
    return currentStats;
  }

  const nextPlayed = currentStats.played + 1;
  const nextWins = currentStats.wins + (isWon ? 1 : 0);

  let nextCurrentStreak = currentStats.currentStreak;
  let nextLastWonDate = currentStats.lastWonDate;

  if (isWon) {
    if (isConsecutiveDay(currentStats.lastWonDate, currentDateStr)) {
      nextCurrentStreak += 1;
    } else {
      nextCurrentStreak = 1;
    }
    nextLastWonDate = currentDateStr;
  } else {
    nextCurrentStreak = 0;
  }

  const nextMaxStreak = Math.max(currentStats.maxStreak, nextCurrentStreak);

  const updated: UserStats = {
    played: nextPlayed,
    wins: nextWins,
    currentStreak: nextCurrentStreak,
    maxStreak: nextMaxStreak,
    lastPlayedDate: currentDateStr,
    lastWonDate: nextLastWonDate,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save user stats to localStorage:', e);
    }
  }

  return updated;
}
