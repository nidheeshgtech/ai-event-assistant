import type { AssistantSettings } from '@/types/assistant';
import type { EventDataset } from '@/types/event';

export interface EventClock {
  /** Index into info.days, or -1 / days.length when the real date is before / after the event. */
  dayIndex: number;
  /** "HH:MM" */
  time: string;
  /** True when the demo clock stands in for the real date. */
  simulated: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

function localIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Real date and time when the event is running; otherwise the configured demo clock,
 * flagged as simulated so answers can say so.
 */
export function eventClock(data: EventDataset, settings: AssistantSettings, now = new Date()): EventClock {
  const today = localIso(now);
  const idx = data.info.days.findIndex((d) => d.date === today);
  if (idx >= 0) return { dayIndex: idx, time: `${pad(now.getHours())}:${pad(now.getMinutes())}`, simulated: false };
  const dayIndex = Math.min(Math.max(settings.demoClock.dayIndex, 0), data.info.days.length - 1);
  return { dayIndex, time: settings.demoClock.time, simulated: true };
}

export function minutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function formatDate(iso: string, lang: 'en' | 'ar', withWeekday = true): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(lang === 'ar' ? 'ar-AE' : 'en-GB', {
    weekday: withWeekday ? 'long' : undefined,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    numberingSystem: 'latn',
  });
}

export function formatTime(hhmm: string, lang: 'en' | 'ar'): string {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(2000, 0, 1, h, m);
  return d.toLocaleTimeString(lang === 'ar' ? 'ar-AE' : 'en-GB', { hour: 'numeric', minute: '2-digit', hour12: lang === 'ar', numberingSystem: 'latn' });
}

/** Weekday index (0 = Sunday) of an event day. */
export function weekday(iso: string): number {
  return new Date(`${iso}T12:00:00`).getDay();
}
