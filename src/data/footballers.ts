import { Footballer } from '@/types/footballer';
import footballersData from './footballers.json';

// Type-safe export backed by the high-performance footballers.json database
export const footballersSeed: Footballer[] = footballersData as Footballer[];
