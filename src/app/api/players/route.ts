import { NextResponse } from 'next/server';
import { getPlayers } from '@/lib/server-storage';
import { normalizeString } from '@/lib/game-logic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const normQ = normalizeString(q);

  const players = getPlayers().filter((p) => p.isActive);

  if (!normQ) {
    const list = players.map((p) => ({
      id: p.id,
      displayName: p.displayName,
      nationality: p.nationality,
      flagEmoji: p.flagEmoji,
      position: p.position,
      positionAbbr: p.positionAbbr || p.position.substring(0, 3).toUpperCase(),
      currentClub: p.currentClub,
      league: p.league,
      age: p.age,
      imageUrl: p.imageUrl,
    }));
    return NextResponse.json({ players: list });
  }

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
      positionAbbr: p.positionAbbr || p.position.substring(0, 3).toUpperCase(),
      currentClub: p.currentClub,
      league: p.league,
      age: p.age,
      imageUrl: p.imageUrl,
    }));

  return NextResponse.json({ players: filtered });
}
