import fs from 'fs';
import path from 'path';
import { footballersSeed } from '@/data/footballers';
import { Footballer } from '@/types/footballer';

const DATA_DIR = path.join(process.cwd(), 'data');
const PLAYERS_FILE = path.join(process.cwd(), 'src', 'data', 'footballers.json');
const SCHEDULE_FILE = path.join(DATA_DIR, 'schedule.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 1. Players Data Store (Single Source of Truth: src/data/footballers.json)
export function getPlayers(): Footballer[] {
  try {
    if (fs.existsSync(PLAYERS_FILE)) {
      const raw = fs.readFileSync(PLAYERS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
    return footballersSeed;
  } catch {
    return footballersSeed;
  }
}

export function savePlayers(players: Footballer[]): void {
  fs.writeFileSync(PLAYERS_FILE, JSON.stringify(players, null, 2), 'utf-8');
}

export function getPlayerById(id: string): Footballer | undefined {
  const players = getPlayers();
  return players.find((p) => p.id === id);
}

// 2. Daily Scheduling
export interface ScheduleEntry {
  date: string; // YYYY-MM-DD (UTC)
  playerId: string;
}

export function getSchedule(): Record<string, string> {
  ensureDataDir();
  if (!fs.existsSync(SCHEDULE_FILE)) {
    // Generate initial schedule mapping for 365 days deterministically
    const initialSchedule: Record<string, string> = {};
    const players = getPlayers().filter((p) => p.isActive);
    
    // Seed dates around now
    const baseDate = new Date();
    baseDate.setUTCHours(0, 0, 0, 0);

    for (let i = -30; i < 365; i++) {
      const d = new Date(baseDate);
      d.setUTCDate(d.getUTCDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Deterministic hash so everyone gets the same player per date
      const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 42;
      const index = Math.abs(hash) % players.length;
      initialSchedule[dateStr] = players[index].id;
    }

    fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(initialSchedule, null, 2), 'utf-8');
    return initialSchedule;
  }
  try {
    const raw = fs.readFileSync(SCHEDULE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveSchedule(schedule: Record<string, string>): void {
  ensureDataDir();
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(schedule, null, 2), 'utf-8');
}

export function getDailyPlayerIdForDate(dateStr: string): string {
  const schedule = getSchedule();
  if (schedule[dateStr]) {
    return schedule[dateStr];
  }
  // Fallback: deterministic selector from active players
  const players = getPlayers().filter((p) => p.isActive);
  const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 42;
  const index = Math.abs(hash) % players.length;
  const selected = players[index].id;
  schedule[dateStr] = selected;
  saveSchedule(schedule);
  return selected;
}

// 3. Analytics
export interface AnalyticsData {
  dailyVisitors: number;
  gamesStarted: number;
  gamesCompleted: number;
  totalScore: number;
  totalCluesRevealed: number;
  practiceCount: number;
  dailyCount: number;
  shareClicks: number;
}

export function getAnalytics(): AnalyticsData {
  ensureDataDir();
  const defaultAnalytics: AnalyticsData = {
    dailyVisitors: 0,
    gamesStarted: 0,
    gamesCompleted: 0,
    totalScore: 0,
    totalCluesRevealed: 0,
    practiceCount: 0,
    dailyCount: 0,
    shareClicks: 0,
  };
  if (!fs.existsSync(ANALYTICS_FILE)) {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(defaultAnalytics, null, 2), 'utf-8');
    return defaultAnalytics;
  }
  try {
    const raw = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return defaultAnalytics;
  }
}

export function updateAnalytics(patch: Partial<AnalyticsData>): AnalyticsData {
  const current = getAnalytics();
  const updated: AnalyticsData = {
    dailyVisitors: current.dailyVisitors + (patch.dailyVisitors || 0),
    gamesStarted: current.gamesStarted + (patch.gamesStarted || 0),
    gamesCompleted: current.gamesCompleted + (patch.gamesCompleted || 0),
    totalScore: current.totalScore + (patch.totalScore || 0),
    totalCluesRevealed: current.totalCluesRevealed + (patch.totalCluesRevealed || 0),
    practiceCount: current.practiceCount + (patch.practiceCount || 0),
    dailyCount: current.dailyCount + (patch.dailyCount || 0),
    shareClicks: current.shareClicks + (patch.shareClicks || 0),
  };
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}
