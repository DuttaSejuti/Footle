import { NextResponse } from 'next/server';
import { getDailyPlayerIdForDate, getPlayerById } from '@/lib/server-storage';
import { getUtcTodayDateString, isCorrectGuess, calculateScore } from '@/lib/game-logic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedDate = searchParams.get('date') || getUtcTodayDateString();
  const cluesRequested = Math.min(Math.max(parseInt(searchParams.get('clues') || '1', 10), 1), 6);

  const playerId = getDailyPlayerIdForDate(requestedDate);
  const player = getPlayerById(playerId);

  if (!player) {
    return NextResponse.json({ error: 'Player not found for date' }, { status: 404 });
  }

  // Construct progressive clues without leaking identity or future clues
  const cluesData: Record<string, any> = {
    clue1Nationality: {
      nationality: player.nationality,
      countryCode: player.countryCode,
      flagEmoji: player.flagEmoji,
    },
  };

  if (cluesRequested >= 2) {
    cluesData.clue2Position = player.position;
  }
  if (cluesRequested >= 3) {
    cluesData.clue3CurrentClub = {
      club: player.currentClub,
      isRetired: player.isRetired,
    };
  }
  if (cluesRequested >= 4) {
    cluesData.clue4PreviousClubs = player.previousClubs;
  }
  if (cluesRequested >= 5) {
    cluesData.clue5Achievements = player.achievements;
  }
  if (cluesRequested >= 6) {
    cluesData.clue6Photo = {
      imageUrl: player.imageUrl || null,
      imageAttribution: player.imageAttribution || null,
      imageLicense: player.imageLicense || null,
      hasPhoto: Boolean(player.imageUrl),
    };
  }

  return NextResponse.json({
    date: requestedDate,
    currentClueIndex: cluesRequested,
    clues: cluesData,
  });
}

// Check guess on server side securely
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, guess, cluesUsed, giveUp } = body;

    const requestedDate = date || getUtcTodayDateString();
    const playerId = getDailyPlayerIdForDate(requestedDate);
    const player = getPlayerById(playerId);

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    if (giveUp) {
      return NextResponse.json({
        isCorrect: false,
        score: 0,
        cluesUsed: cluesUsed || 6,
        isGameOver: true,
        mysteryPlayer: player, // full reveal on give up
        message: `You gave up! The footballer was ${player.displayName}.`,
      });
    }

    const won = isCorrectGuess(guess, player);
    const score = calculateScore(cluesUsed || 1, won);

    return NextResponse.json({
      isCorrect: won,
      score: score,
      cluesUsed: cluesUsed || 1,
      isGameOver: won,
      mysteryPlayer: won ? player : undefined,
      message: won ? `Brilliant! That is ${player.displayName}!` : 'Not quite right. Try again or reveal the next clue!',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid request' }, { status: 400 });
  }
}
