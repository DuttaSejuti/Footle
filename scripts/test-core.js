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

console.log('ALL TESTS PASSED SUCCESSFULLY! ⚽🏆');
