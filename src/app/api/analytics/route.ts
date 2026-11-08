import { NextResponse } from 'next/server';
import { getAnalytics, updateAnalytics } from '@/lib/server-storage';

export async function GET() {
  const data = getAnalytics();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = updateAnalytics(body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
