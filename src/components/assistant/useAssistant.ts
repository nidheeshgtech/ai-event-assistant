import { useCallback, useEffect, useRef, useState } from 'react';
import { answer, MAX_QUESTION_LENGTH } from '@/engine/respond';
import { loc } from '@/engine/text';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { useLang } from '@/i18n/LangProvider';
import { askAi } from '@/services/aiClient';
import { useConfig } from '@/services/configStore';
import { logQuestion } from '@/services/questionLog';
import { readSession, writeSession } from '@/services/storage';
import type { AssistantMode, AssistantReply, ConversationContext, ReplyBlock } from '@/types/assistant';
import { env } from '@/config/env';

export interface ChatMessage {
  id: string;
  role: 'visitor' | 'assistant';
  text: string;
  reply?: AssistantReply;
}

interface Stored {
  messages: ChatMessage[];
  context: ConversationContext;
}

let seq = 0;
const nextId = () => `${Date.now().toString(36)}-${++seq}`;

/** Plain-text version of a reply, used as AI conversation history. */
function replyText(r: AssistantReply): string {
  return r.blocks
    .filter((b): b is Extract<ReplyBlock, { kind: 'text' }> => b.kind === 'text')
    .map((b) => b.text)
    .join(' ')
    .slice(0, 600);
}

/**
 * Chat state for one preset. Answers come from the structured engine; when an AI endpoint
 * is configured, only questions the engine cannot answer are sent to the model.
 */
export function useAssistant(presetId: string, mode: AssistantMode, variant: 'widget' | 'page' = 'page') {
  const config = useConfig(presetId);
  const { lang, setLang } = useLang();
  const storeKey = `chat:${variant}:${presetId}`;
  const [state, setState] = useState<Stored>(() => {
    try {
      return JSON.parse(readSession(storeKey) ?? '') as Stored;
    } catch {
      return { messages: [], context: {} };
    }
  });
  const [typing, setTyping] = useState(false);
  const busy = useRef(false);

  // Switching preset swaps in that preset's conversation.
  useEffect(() => {
    try {
      setState(JSON.parse(readSession(storeKey) ?? '') as Stored);
    } catch {
      setState({ messages: [], context: {} });
    }
  }, [storeKey]);

  useEffect(() => {
    writeSession(storeKey, JSON.stringify({ messages: state.messages.slice(-40), context: state.context }));
  }, [state, storeKey]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busy.current) return;
      if (text.length > MAX_QUESTION_LENGTH) return;
      busy.current = true;
      const visitor: ChatMessage = { id: nextId(), role: 'visitor', text };
      setState((s) => ({ ...s, messages: [...s.messages, visitor] }));
      setTyping(true);
      const started = Date.now();

      const suggested = {
        en: config.branding.suggested[mode].map((q) => loc(q, 'en')),
        ar: config.branding.suggested[mode].map((q) => loc(q, 'ar')),
      };
      let reply = answer(text, { data: config.data, settings: config.settings, mode, uiLang: lang, context: state.context, suggested });

      // Only unanswered or free-form questions go to the model, and only for built-in data the server knows.
      const tryAi = env.aiEnabled && !config.customData && (!reply.answered || reply.intent === 'unknown');
      if (tryAi) {
        const history = state.messages.slice(-6).map((m) => ({ role: m.role, text: m.role === 'visitor' ? m.text : m.reply ? replyText(m.reply) : m.text }));
        const ai = await askAi({ message: text, lang: reply.lang, mode, presetId, history });
        if (ai) {
          const blocks: ReplyBlock[] = [{ kind: 'text', text: ai.answer }];
          if (ai.exhibitorIds.length) blocks.push({ kind: 'exhibitors', ids: ai.exhibitorIds, total: ai.exhibitorIds.length });
          if (ai.sessionIds.length) blocks.push({ kind: 'sessions', ids: ai.sessionIds });
          if (ai.speakerIds.length) blocks.push({ kind: 'speakers', ids: ai.speakerIds });
          if (ai.hallIds[0]) blocks.push({ kind: 'hall', id: ai.hallIds[0] });
          if (ai.facilityIds.length) blocks.push({ kind: 'facilities', ids: ai.facilityIds });
          reply = {
            ...reply,
            blocks,
            answered: ai.answered,
            source: 'ai',
            context: { intent: reply.intent, exhibitorIds: ai.exhibitorIds, sessionIds: ai.sessionIds, speakerIds: ai.speakerIds, hallId: ai.hallIds[0] },
          };
        } else {
          reply = { ...reply, blocks: [...reply.blocks, { kind: 'notice', tone: 'warning', text: 'ai-fallback' }] };
        }
      }

      if (config.settings.logQuestions) {
        logQuestion({ presetId, q: text, intent: reply.intent, answered: reply.answered, lang: reply.lang, mode });
      }

      // A short, natural pause so the typing indicator reads as a reply being composed.
      const minDelay = prefersReducedMotion() ? 0 : Math.min(450 + text.length * 6, 900);
      const wait = minDelay - (Date.now() - started);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));

      setState((s) => ({ messages: [...s.messages, { id: nextId(), role: 'assistant', text: '', reply }], context: reply.context }));
      setTyping(false);
      busy.current = false;
      if (reply.switchLang && reply.switchLang !== lang && config.branding.languages.includes(reply.switchLang)) setLang(reply.switchLang);
    },
    [config, lang, mode, presetId, setLang, state],
  );

  const reset = useCallback(() => setState({ messages: [], context: {} }), []);

  return { messages: state.messages, typing, send, reset, config };
}
