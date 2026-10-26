import type { AssistantMode, Intent } from '@/types/assistant';
import type { Lang } from '@/types/event';
import { readJSON, writeJSON } from './storage';

/**
 * Anonymous question log for the "popular" and "unanswered" reports.
 * Stores no identity, only the redacted question text, and stays in this browser in demo mode.
 */
export interface LoggedQuestion {
  presetId: string;
  q: string;
  intent: Intent;
  answered: boolean;
  lang: Lang;
  mode: AssistantMode;
  at: number;
}

const KEY = 'question-log';
const MAX = 400;

/** Remove anything that looks like contact details or an ID before storing. */
export function redact(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]')
    .replace(/\+?\d[\d\s().-]{6,}\d/g, '[number]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
}

export function logQuestion(entry: Omit<LoggedQuestion, 'q' | 'at'> & { q: string }): void {
  const list = readJSON<LoggedQuestion[]>(KEY, []);
  list.push({ ...entry, q: redact(entry.q), at: Date.now() });
  writeJSON(KEY, list.slice(-MAX));
}

export function readQuestions(presetId: string): LoggedQuestion[] {
  return readJSON<LoggedQuestion[]>(KEY, []).filter((x) => x.presetId === presetId);
}

export function clearQuestions(presetId: string): void {
  writeJSON(
    KEY,
    readJSON<LoggedQuestion[]>(KEY, []).filter((x) => x.presetId !== presetId),
  );
}
