const assert = require('assert');

// 1. Test accent normalization
function normalizeString(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log('--- RUNNING CORE TESTS ---');

// Test 1: Normalization
assert.strictEqual(normalizeString('Luka Modrić'), 'luka modric');
assert.strictEqual(normalizeString('Kylian Mbappé'), 'kylian mbappe');
assert.strictEqual(normalizeString('N\'Golo Kanté'), 'n golo kante');
assert.strictEqual(normalizeString('   Vinícius   Júnior  '), 'vinicius junior');
console.log('✓ Accent & case normalization tests passed');

// Test 2: Scoring logic
function calculateScore(cluesUsed, isWon) {
  if (!isWon) return 0;
  if (cluesUsed <= 1) return 6;
  if (cluesUsed === 2) return 5;
  if (cluesUsed === 3) return 4;
  if (cluesUsed === 4) return 3;
  if (cluesUsed === 5) return 2;
  return 1;
}

assert.strictEqual(calculateScore(1, true), 6);
assert.strictEqual(calculateScore(2, true), 5);
assert.strictEqual(calculateScore(3, true), 4);
assert.strictEqual(calculateScore(4, true), 3);
assert.strictEqual(calculateScore(5, true), 2);
assert.strictEqual(calculateScore(6, true), 1);
assert.strictEqual(calculateScore(3, false), 0);
assert.strictEqual(calculateScore(6, false), 0);
console.log('✓ Scoring specification rules tests passed');

// Test 3: Answer matching with alternative names
const testPlayer = {
  id: 'lionel-messi',
  displayName: 'Lionel Messi',
  fullName: 'Lionel Andrés Messi',
  alternativeNames: ['Messi', 'Leo Messi', 'La Pulga', 'Lionel Andres Messi'],
};

function isCorrectGuess(guess, player) {
  const normGuess = normalizeString(guess);
  if (!normGuess) return false;
  const candidateNames = [
    player.displayName,
    player.fullName,
    ...player.alternativeNames,
  ];
  return candidateNames.some((n) => normalizeString(n) === normGuess);
}

assert.strictEqual(isCorrectGuess('Messi', testPlayer), true);
assert.strictEqual(isCorrectGuess('LEO MESSI', testPlayer), true);
assert.strictEqual(isCorrectGuess('Lionel Andres Messi', testPlayer), true);
assert.strictEqual(isCorrectGuess('lionel andrés messi', testPlayer), true);
assert.strictEqual(isCorrectGuess('Cristiano Ronaldo', testPlayer), false);
console.log('✓ Player name & alias validation tests passed');

// Test 4: Daily Deterministic Selection consistency
function getDeterministicPlayerIndex(dateStr, playerCount) {
  const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 42;
  return Math.abs(hash) % playerCount;
}

const date = '2026-11-08';
const idx1 = getDeterministicPlayerIndex(date, 52);
const idx2 = getDeterministicPlayerIndex(date, 52);
assert.strictEqual(idx1, idx2, 'Daily selector must be strictly deterministic across calls');
console.log('✓ Deterministic daily challenge player selector passed');

// Test 5: Club Yellow Rule (Target previously played for guessed player's current club)
function checkClubStatus(guessedClub, targetCurrentClub, targetPreviousClubs) {
  const normGuessed = normalizeString(guessedClub);
  const normTarget = normalizeString(targetCurrentClub);
  if (normGuessed === normTarget) return 'correct';

  const targetPrev = (targetPreviousClubs || []).map(normalizeString);
  const playedForGuessedClub = targetPrev.some(
    (tc) =>
      tc.length >= 3 &&
      normGuessed.length >= 3 &&
      (tc === normGuessed || tc.includes(normGuessed) || normGuessed.includes(tc)) &&
      !((tc.includes('city') && normGuessed.includes('united')) ||
        (tc.includes('united') && normGuessed.includes('city')) ||
        (tc.includes('ac milan') && normGuessed.includes('inter')) ||
        (tc.includes('inter') && normGuessed.includes('ac milan')) ||
        (tc.includes('real madrid') && normGuessed.includes('atletico')) ||
        (tc.includes('atletico') && normGuessed.includes('real madrid')))
  );

  return playedForGuessedClub ? 'partial' : 'wrong';
}

// Robert Lewandowski (Barcelona, ex: Bayern Munich, Borussia Dortmund)
assert.strictEqual(checkClubStatus('Barcelona', 'Barcelona', ['Bayern Munich', 'Borussia Dortmund']), 'correct');
assert.strictEqual(checkClubStatus('Bayern Munich', 'Barcelona', ['Bayern Munich', 'Borussia Dortmund']), 'partial');
assert.strictEqual(checkClubStatus('Borussia Dortmund', 'Barcelona', ['Bayern Munich', 'Borussia Dortmund']), 'partial');
// Guessed club never played for by target
assert.strictEqual(checkClubStatus('Arsenal', 'Barcelona', ['Bayern Munich', 'Borussia Dortmund']), 'wrong');
// Make sure distinct city clubs don't trigger partial
assert.strictEqual(checkClubStatus('Manchester United', 'Barcelona', ['Manchester City']), 'wrong');
assert.strictEqual(checkClubStatus('Inter Milan', 'Barcelona', ['AC Milan']), 'wrong');
console.log('✓ Club comparison rule (Yellow only if mystery player played for guessed club) passed');

// Test 6: User Stats & Consecutive Streak Engine
function isConsecutiveDay(prevDateStr, currentDateStr) {
  if (!prevDateStr) return false;
  const prev = new Date(prevDateStr + 'T00:00:00Z');
  const curr = new Date(currentDateStr + 'T00:00:00Z');
  const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

function recordGameResult(currentStats, currentDateStr, isWon) {
  if (currentStats.lastPlayedDate === currentDateStr) return currentStats;
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
  return {
    played: nextPlayed,
    wins: nextWins,
    currentStreak: nextCurrentStreak,
    maxStreak: nextMaxStreak,
    lastPlayedDate: currentDateStr,
    lastWonDate: nextLastWonDate,
  };
}

let stats = { played: 0, wins: 0, currentStreak: 0, maxStreak: 0, lastPlayedDate: null, lastWonDate: null };
// Day 1: Win
stats = recordGameResult(stats, '2026-11-10', true);
assert.strictEqual(stats.played, 1);
assert.strictEqual(stats.wins, 1);
assert.strictEqual(stats.currentStreak, 1);
assert.strictEqual(stats.maxStreak, 1);

// Day 2: Win (Consecutive)
stats = recordGameResult(stats, '2026-11-11', true);
assert.strictEqual(stats.played, 2);
assert.strictEqual(stats.wins, 2);
assert.strictEqual(stats.currentStreak, 2);
assert.strictEqual(stats.maxStreak, 2);

// Replaying Day 2 does not duplicate
stats = recordGameResult(stats, '2026-11-11', true);
assert.strictEqual(stats.played, 2);

// Day 4: Win (Missed Day 3 -> resets current streak to 1, maxStreak stays 2)
stats = recordGameResult(stats, '2026-11-13', true);
assert.strictEqual(stats.played, 3);
assert.strictEqual(stats.wins, 3);
assert.strictEqual(stats.currentStreak, 1);
assert.strictEqual(stats.maxStreak, 2);

// Day 5: Loss -> streak drops to 0, maxStreak stays 2
stats = recordGameResult(stats, '2026-11-14', false);
assert.strictEqual(stats.played, 4);
assert.strictEqual(stats.wins, 3);
assert.strictEqual(stats.currentStreak, 0);
assert.strictEqual(stats.maxStreak, 2);
console.log('✓ User Stats & consecutive streak engine tests passed');

console.log('ALL TESTS PASSED SUCCESSFULLY! ⚽🏆');
