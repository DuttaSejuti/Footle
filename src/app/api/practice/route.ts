import { NextResponse } from 'next/server';
import { getPlayers, getPlayerById } from '@/lib/server-storage';
import { isCorrectGuess, calculateScore, compareFootballers } from '@/lib/game-logic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let playerId = searchParams.get('id');
  const cluesRequested = Math.min(Math.max(parseInt(searchParams.get('clues') || '1', 10), 1), 6);

  const players = getPlayers().filter((p) => p.isActive);
  if (!playerId) {
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    playerId = randomPlayer.id;
  }

  const player = getPlayerById(playerId);
  if (!player) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  }

  const cluesData: Record<string, any> = {
    clue1Nationality: {
      nationality: player.nationality,
      countryCode: player.countryCode,
      flagEmoji: player.flagEmoji,
    },
  };

  if (cluesRequested >= 2) cluesData.clue2Position = player.position;
  if (cluesRequested >= 3) {
    cluesData.clue3CurrentClub = {
      club: player.currentClub,
      isRetired: player.isRetired,
    };
  }
  if (cluesRequested >= 4) cluesData.clue4PreviousClubs = player.previousClubs;
  if (cluesRequested >= 5) cluesData.clue5Achievements = player.achievements;
  if (cluesRequested >= 6) {
    cluesData.clue6Photo = {
      imageUrl: player.imageUrl || null,
      imageAttribution: player.imageAttribution || null,
      imageLicense: player.imageLicense || null,
      hasPhoto: Boolean(player.imageUrl),
    };
  }

  return NextResponse.json({
    practiceId: playerId,
    currentClueIndex: cluesRequested,
    clues: cluesData,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerId, guess, guessedPlayerId, cluesUsed, giveUp } = body;

    const targetPlayer = getPlayerById(playerId);
    if (!targetPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    if (giveUp) {
      return NextResponse.json({
        isCorrect: false,
        score: 0,
        cluesUsed: cluesUsed || 6,
        isGameOver: true,
        mysteryPlayer: targetPlayer,
        message: `Match Over! The mystery footballer was ${targetPlayer.displayName}.`,
      });
    }

    let guessedPlayer = guessedPlayerId ? getPlayerById(guessedPlayerId) : undefined;
    if (!guessedPlayer && guess) {
      const all = getPlayers();
      guessedPlayer = all.find((p) => isCorrectGuess(guess, p));
    }

    let comparison = undefined;
    if (guessedPlayer) {
      comparison = compareFootballers(guessedPlayer, targetPlayer);
    }

    const won = guessedPlayer ? isCorrectGuess(guessedPlayer.displayName, targetPlayer) : isCorrectGuess(guess, targetPlayer);
    const score = calculateScore(cluesUsed || 1, won);

    return NextResponse.json({
      isCorrect: won,
      score: score,
      cluesUsed: cluesUsed || 1,
      isGameOver: won,
      comparison,
      mysteryPlayer: won ? targetPlayer : undefined,
      message: won ? `Brilliant! That is ${targetPlayer.displayName}!` : 'Keep going! Check the tile matches below.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid request' }, { status: 400 });
  }
}
