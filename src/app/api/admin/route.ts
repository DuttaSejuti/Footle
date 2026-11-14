import { NextResponse } from 'next/server';
import { getPlayers, savePlayers, getSchedule, saveSchedule } from '@/lib/server-storage';
import { Footballer } from '@/types/footballer';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'footble-admin-pass';

function checkAuth(req: Request) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  const querySecret = new URL(req.url).searchParams.get('secret');
  return token === ADMIN_SECRET || querySecret === ADMIN_SECRET;
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const players = getPlayers();
  const schedule = getSchedule();

  return NextResponse.json({ players, schedule });
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, player, scheduleUpdate } = body;

    const players = getPlayers();

    if (action === 'save_player') {
      const footballer: Footballer = player;
      const index = players.findIndex((p) => p.id === footballer.id);
      if (index >= 0) {
        players[index] = footballer;
      } else {
        players.push(footballer);
      }
      savePlayers(players);
      return NextResponse.json({ success: true, players });
    }

    if (action === 'update_schedule') {
      const schedule = getSchedule();
      const updatedSchedule = { ...schedule, ...scheduleUpdate };
      saveSchedule(updatedSchedule);
      return NextResponse.json({ success: true, schedule: updatedSchedule });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
