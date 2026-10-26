import Anthropic from '@anthropic-ai/sdk';
import { PRESETS } from '../src/config/presets';
import { DATASETS } from '../src/data';
import { eventClock, formatTime } from '../src/engine/clock';
import type { AssistantMode } from '../src/types/assistant';
import type { Lang } from '../src/types/event';
import { ANSWER_SCHEMA, RateLimiter, sanitize, systemPrompt, userPrompt, type HistoryTurn } from './_lib/grounding';

/**
 * Optional AI answers for the event assistant.
 *
 * - The API key stays server-side (ANTHROPIC_API_KEY); the browser never sees it.
 * - Answers are grounded in the built-in dataset held here, never in data sent by the client.
 * - Output is schema-constrained JSON; ids are re-checked so cards only show real records.
 * - Any failure returns an error and the client falls back to its deterministic engine.
 */

const MODEL = process.env.AI_MODEL?.trim() || 'claude-opus-5-5';
const MAX_QUESTION = 500;
const limiter = new RateLimiter(Number(process.env.AI_RATE_PER_MINUTE) || 8, Number(process.env.AI_RATE_PER_HOUR) || 60);
const client = process.env.ANTHROPIC_API_KEY ? new Anthropic({ timeout: 20_000, maxRetries: 1 }) : null;

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } });

interface Body {
  message: string;
  lang: Lang;
  mode: AssistantMode;
  presetId: string;
  history: HistoryTurn[];
}

function parseBody(raw: unknown): Body | null {
  if (!raw || typeof raw !== 'object') return null;
  const b = raw as Record<string, unknown>;
  const message = typeof b.message === 'string' ? b.message.trim() : '';
  if (!message || message.length > MAX_QUESTION) return null;
  if (b.lang !== 'en' && b.lang !== 'ar') return null;
  if (b.mode !== 'visitor' && b.mode !== 'exhibitor' && b.mode !== 'organizer') return null;
  if (typeof b.presetId !== 'string' || !PRESETS.some((p) => p.id === b.presetId)) return null;
  const history = (Array.isArray(b.history) ? b.history : [])
    .slice(-6)
    .filter((h): h is HistoryTurn => !!h && typeof h === 'object' && (h.role === 'visitor' || h.role === 'assistant') && typeof h.text === 'string')
    .map((h) => ({ role: h.role, text: h.text.slice(0, 600) }));
  return { message, lang: b.lang, mode: b.mode, presetId: b.presetId, history };
}

function allowedOrigin(request: Request): boolean {
  const list = (process.env.AI_ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!list.length) return true;
  const origin = request.headers.get('origin');
  return !!origin && list.includes(origin);
}

export async function POST(request: Request): Promise<Response> {
  if (!client) return json(503, { error: 'ai_disabled' });
  if (!allowedOrigin(request)) return json(403, { error: 'forbidden_origin' });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const wait = limiter.check(ip);
  if (wait) return json(429, { error: 'rate_limited' }, { 'Retry-After': String(wait) });

  let body: Body | null = null;
  try {
    body = parseBody(await request.json());
  } catch {
    body = null;
  }
  if (!body) return json(400, { error: 'invalid_request' });

  const preset = PRESETS.find((p) => p.id === body.presetId)!;
  const data = DATASETS[preset.datasetId];
  const clock = eventClock(data, preset.settings);
  const day = data.info.days[clock.dayIndex];
  const clockText = `${day?.label?.en ?? `Day ${clock.dayIndex + 1}`} (${day?.date}), ${formatTime(clock.time, 'en')}${clock.simulated ? ' (simulated demo clock)' : ''}`;

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 2000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema', schema: ANSWER_SCHEMA } },
      system: [{ type: 'text', text: systemPrompt(data), cache_control: { type: 'ephemeral', ttl: '1h' } }],
      messages: [{ role: 'user', content: userPrompt(body.message, body.lang, clockText, body.history) }],
    });

    if (response.stop_reason === 'refusal' || response.stop_reason === 'max_tokens') return json(502, { error: 'ai_no_answer' });
    const text = response.content.find((b) => b.type === 'text');
    if (!text || text.type !== 'text') return json(502, { error: 'ai_no_answer' });
    const answer = sanitize(JSON.parse(text.text), data);
    if (!answer) return json(502, { error: 'ai_bad_output' });
    return json(200, answer);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json(503, { error: 'ai_busy' });
    if (error instanceof Anthropic.APIError) {
      console.error('AI assistant API error', error.status);
      return json(502, { error: 'ai_unavailable' });
    }
    console.error('AI assistant failure', error instanceof Error ? error.name : 'unknown');
    return json(502, { error: 'ai_unavailable' });
  }
}
