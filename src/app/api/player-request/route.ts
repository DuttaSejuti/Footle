import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const playerName = typeof body.playerName === 'string' ? body.playerName.trim() : '';
    const club = typeof body.club === 'string' ? body.club.trim().slice(0, 100) : '';
    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 300) : '';

    if (!playerName || playerName.length < 2 || playerName.length > 100) {
      return NextResponse.json(
        { error: 'Player name must be between 2 and 100 characters.' },
        { status: 400 }
      );
    }

    const payload = {
      timestamp: new Date().toISOString(),
      playerName,
      club: club || 'Not specified',
      notes: notes || '',
    };

    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

    // If Google Sheet webhook is configured, forward payload
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (webhookErr) {
        console.error('Failed to forward player request to webhook:', webhookErr);
      }
    } else {
      // In local development or before webhook is set, save to local data/player-requests.json
      try {
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        const filePath = path.join(dataDir, 'player-requests.json');
        let existing: any[] = [];
        if (fs.existsSync(filePath)) {
          try {
            existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          } catch {
            existing = [];
          }
        }
        existing.push(payload);
        fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8');
      } catch (localErr) {
        console.log('Local save note (ephemeral on cloud):', localErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Player request received. Thank you!',
    });
  } catch (error) {
    console.error('Player request error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the request.' },
      { status: 500 }
    );
  }
}
