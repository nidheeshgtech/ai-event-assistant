import { env } from '@/config/env';
import type { AssistantMode } from '@/types/assistant';
import type { Lang } from '@/types/event';

export interface AiAnswer {
  answered: boolean;
  answer: string;
  exhibitorIds: string[];
  sessionIds: string[];
  speakerIds: string[];
  hallIds: string[];
  facilityIds: string[];
}

export interface AiRequest {
  message: string;
  lang: Lang;
  mode: AssistantMode;
  presetId: string;
  history: { role: 'visitor' | 'assistant'; text: string }[];
}

/** Identical questions within a session reuse the first answer instead of calling the model again. */
const cache = new Map<string, AiAnswer>();

/** Ask the server-side AI endpoint. Resolves to null on any failure so the caller can fall back. */
export async function askAi(req: AiRequest, signal?: AbortSignal): Promise<AiAnswer | null> {
  if (!env.aiEnabled) return null;
  const key = `${req.presetId}|${req.mode}|${req.lang}|${req.message.trim().toLowerCase()}`;
  const hit = cache.get(key);
  if (hit) return hit;
  try {
    const res = await fetch(env.aiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: signal ?? AbortSignal.timeout(25_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as AiAnswer;
    if (typeof data?.answer !== 'string') return null;
    cache.set(key, data);
    return data;
  } catch {
    return null;
  }
}
