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
/**
 * Confederation / Continent mapping for Nationality Close logic
 */
const CONFEDERATIONS: Record<string, string> = {
  // UEFA (Europe)
  france: 'UEFA',
  portugal: 'UEFA',
  england: 'UEFA',
  spain: 'UEFA',
  germany: 'UEFA',
  italy: 'UEFA',
  netherlands: 'UEFA',
  belgium: 'UEFA',
  croatia: 'UEFA',
  norway: 'UEFA',
  poland: 'UEFA',
  scotland: 'UEFA',
  wales: 'UEFA',
  sweden: 'UEFA',
  denmark: 'UEFA',
  switzerland: 'UEFA',
  austria: 'UEFA',
  turkey: 'UEFA',
  serbia: 'UEFA',
  hungary: 'UEFA',
  georgia: 'UEFA',
  slovenia: 'UEFA',
  slovakia: 'UEFA',
  czechia: 'UEFA',
  'czech republic': 'UEFA',
  ukraine: 'UEFA',

  // CONMEBOL (South America)
  argentina: 'CONMEBOL',
  brazil: 'CONMEBOL',
  uruguay: 'CONMEBOL',
  colombia: 'CONMEBOL',
  chile: 'CONMEBOL',
  ecuador: 'CONMEBOL',
  paraguay: 'CONMEBOL',
  venezuela: 'CONMEBOL',
  peru: 'CONMEBOL',

  // CAF (Africa)
  egypt: 'CAF',
  nigeria: 'CAF',
  senegal: 'CAF',
  morocco: 'CAF',
  algeria: 'CAF',
  cameroon: 'CAF',
  ghana: 'CAF',
  'ivory coast': 'CAF',
  mali: 'CAF',
  tunisia: 'CAF',

  // CONCACAF (North / Central America)
  usa: 'CONCACAF',
  'united states': 'CONCACAF',
  canada: 'CONCACAF',
  mexico: 'CONCACAF',
  jamaica: 'CONCACAF',
  costa_rica: 'CONCACAF',

  // AFC (Asia)
  'south korea': 'AFC',
  japan: 'AFC',
  australia: 'AFC',
  saudi_arabia: 'AFC',
  iran: 'AFC',
};

/**
 * Common club to league mapping to detect former leagues played in
 */
const KNOWN_CLUB_LEAGUES: Record<string, string> = {
  // Premier League
  'manchester city': 'Premier League',
  'manchester united': 'Premier League',
  arsenal: 'Premier League',
  liverpool: 'Premier League',
  chelsea: 'Premier League',
  'tottenham hotspur': 'Premier League',
  tottenham: 'Premier League',
  'aston villa': 'Premier League',
  newcastle: 'Premier League',
  'newcastle united': 'Premier League',
  birmingham: 'Premier League',
  'birmingham city': 'Premier League',
  leicester: 'Premier League',
  'leicester city': 'Premier League',
  everton: 'Premier League',
  west_ham: 'Premier League',
  'west ham': 'Premier League',
  'west ham united': 'Premier League',

  // La Liga
  'real madrid': 'La Liga',
  barcelona: 'La Liga',
  'atletico madrid': 'La Liga',
  'atlético madrid': 'La Liga',
  sevilla: 'La Liga',
  valencia: 'La Liga',
  'athletic bilbao': 'La Liga',
  'real sociedad': 'La Liga',
  villarreal: 'La Liga',

  // Serie A
  'inter milan': 'Serie A',
  inter: 'Serie A',
  'ac milan': 'Serie A',
  milan: 'Serie A',
  juventus: 'Serie A',
  napoli: 'Serie A',
  roma: 'Serie A',
  lazio: 'Serie A',
  atalanta: 'Serie A',
  fiorentina: 'Serie A',

  // Bundesliga
  'bayern munich': 'Bundesliga',
  bayern: 'Bundesliga',
  'borussia dortmund': 'Bundesliga',
  dortmund: 'Bundesliga',
  'bayer leverkusen': 'Bundesliga',
  leverkusen: 'Bundesliga',
  'rb leipzig': 'Bundesliga',
  leipzig: 'Bundesliga',
  'vfl wolfsburg': 'Bundesliga',
  'werder bremen': 'Bundesliga',
  'eintracht frankfurt': 'Bundesliga',
  'borussia monchengladbach': 'Bundesliga',
  'vfb stuttgart': 'Bundesliga',

  // Ligue 1
  'paris saint-germain': 'Ligue 1',
  psg: 'Ligue 1',
  monaco: 'Ligue 1',
  'as monaco': 'Ligue 1',
  lyon: 'Ligue 1',
  marseille: 'Ligue 1',
  lille: 'Ligue 1',
  rennes: 'Ligue 1',

  // MLS
  'inter miami': 'MLS',
  lafc: 'MLS',
  'la galaxy': 'MLS',

  // Saudi Pro
  'al-nassr': 'Saudi Pro',
  'al nassr': 'Saudi Pro',
  'al-hilal': 'Saudi Pro',
  'al hilal': 'Saudi Pro',
  'al-ittihad': 'Saudi Pro',
  'al-ahli': 'Saudi Pro',
};

/**
 * Wordle / Poeltl Comparison Engine
 * Compares guessed player vs target mystery player
 */
export function compareFootballers(guessed: Footballer, target: Footballer): GuessComparison {
  const normGuessedNat = normalizeString(guessed.nationality);
  const normTargetNat = normalizeString(target.nationality);

  // 1. Nationality:
  // Exact: Same country
  // Partial: Same confederation (e.g. UEFA, CONMEBOL, CAF)
  let natStatus: MatchStatus = 'wrong';
  if (normGuessedNat === normTargetNat) {
    natStatus = 'correct';
  } else {
    const guessedConfed = CONFEDERATIONS[normGuessedNat];
    const targetConfed = CONFEDERATIONS[normTargetNat];
    if (guessedConfed && targetConfed && guessedConfed === targetConfed) {
      natStatus = 'partial';
    }
  }

  // 2. League:
  // Exact: Current league match
  // Partial: Mystery player played in guessed league in past career
  const normGuessedLeague = normalizeString(guessed.league);
  const normTargetLeague = normalizeString(target.league);
  let leagueStatus: MatchStatus = 'wrong';

  if (normGuessedLeague === normTargetLeague) {
    leagueStatus = 'correct';
  } else {
    // Check if target played in guessed league via former clubs
    const targetHistoricalLeagues = new Set<string>();
    targetHistoricalLeagues.add(normTargetLeague);

    for (const club of target.previousClubs || []) {
      const normClub = normalizeString(club);
      for (const [knownClub, leagueName] of Object.entries(KNOWN_CLUB_LEAGUES)) {
        if (normClub.includes(knownClub) || knownClub.includes(normClub)) {
          targetHistoricalLeagues.add(normalizeString(leagueName));
        }
      }
    }

    if (targetHistoricalLeagues.has(normGuessedLeague)) {
      leagueStatus = 'partial';
    }
  }

  // 3. Club:
  // Exact: Current club match
  // Partial: Mystery footballer previously played for the guessed player's club
  const normGuessedClub = normalizeString(guessed.currentClub);
  const normTargetClub = normalizeString(target.currentClub);
  let clubStatus: MatchStatus = 'wrong';

  if (normGuessedClub === normTargetClub) {
    clubStatus = 'correct';
  } else {
    // Yellow only if the mystery player previously played for the guessed player's club
    const targetPrevClubs = (target.previousClubs || []).map(normalizeString);
    const playedForGuessedClub = targetPrevClubs.some(
      (tc) =>
        tc.length >= 3 &&
        normGuessedClub.length >= 3 &&
        (tc === normGuessedClub || tc.includes(normGuessedClub) || normGuessedClub.includes(tc)) &&
        !((tc.includes('city') && normGuessedClub.includes('united')) ||
          (tc.includes('united') && normGuessedClub.includes('city')) ||
          (tc.includes('ac milan') && normGuessedClub.includes('inter')) ||
          (tc.includes('inter') && normGuessedClub.includes('ac milan')) ||
          (tc.includes('real madrid') && normGuessedClub.includes('atletico')) ||
          (tc.includes('atletico') && normGuessedClub.includes('real madrid')))
    );

    if (playedForGuessedClub) {
      clubStatus = 'partial';
    }
  }

  // 4. Position:
  // Exact: Same position
  // Partial: Adjacent pitch tactical line (GK ↔ DEF ↔ MID ↔ FWD)
  let posStatus: MatchStatus = 'wrong';
  if (guessed.position === target.position) {
    posStatus = 'correct';
  } else if (
    (guessed.position === 'Goalkeeper' && target.position === 'Defender') ||
    (guessed.position === 'Defender' && target.position === 'Goalkeeper') ||
    (guessed.position === 'Defender' && target.position === 'Midfielder') ||
    (guessed.position === 'Midfielder' && target.position === 'Defender') ||
    (guessed.position === 'Midfielder' && target.position === 'Forward') ||
    (guessed.position === 'Forward' && target.position === 'Midfielder')
  ) {
    posStatus = 'partial'; // Adjacent pitch tactical line
  }

  // 5. Age:
  // Exact: Same age
  // Direction: 'higher' (target is older ⬆️) or 'lower' (target is younger ⬇️)
  // Close: diff within ±2 years
  let ageStatus: MatchStatus = 'correct';
  const ageDiff = target.age - guessed.age;

  if (ageDiff > 0) {
    ageStatus = 'higher'; // Target player is older ⬆️
  } else if (ageDiff < 0) {
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
      diff: ageDiff,
    },
    isExactMatch: isExact,
  };
}
