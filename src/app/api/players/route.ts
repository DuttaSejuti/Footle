import { NextResponse } from 'next/server';
import { getPlayers } from '@/lib/server-storage';
import { normalizeString } from '@/lib/game-logic';

// Public endpoint providing the searchable database of players
// Excludes secret career clue answers, only returns id, displayName, nationality, position for the autocomplete
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const normQ = normalizeString(q);

  const players = getPlayers().filter((p) => p.isActive);

  if (!normQ) {
    // Return all players for local quick searching (light payload: id, displayName, nationality, flag)
    const list = players.map((p) => ({
      id: p.id,
      displayName: p.displayName,
      nationality: p.nationality,
      flagEmoji: p.flagEmoji,
      position: p.position,
    }));
    return NextResponse.json({ players: list });
  }

  // Filter matched players
  const filtered = players
    .filter((p) => {
      if (normalizeString(p.displayName).includes(normQ)) return true;
      if (normalizeString(p.fullName).includes(normQ)) return true;
      return p.alternativeNames.some((alt) => normalizeString(alt).includes(normQ));
    })
    .slice(0, 10)
    .map((p) => ({
      id: p.id,
      displayName: p.displayName,
      nationality: p.nationality,
      flagEmoji: p.flagEmoji,
      position: p.position,
    }));

  return NextResponse.json({ players: filtered });
}
