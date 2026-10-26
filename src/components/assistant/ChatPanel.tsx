import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { MAX_QUESTION_LENGTH } from '@/engine/respond';
import { loc } from '@/engine/text';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { useLang } from '@/i18n/LangProvider';
import { themeVars } from '@/services/color';
import { useConfig } from '@/services/configStore';
import type { AssistantMode, AssistantReply, ReplyBlock } from '@/types/assistant';
import type { Lang } from '@/types/event';
import { BrandMark } from '../ui/Brand';
import { Icon, type IconName } from '../ui/Icon';
import { DemoBadge } from '../ui/Misc';
import { AnnouncementList, CardProvider, ExhibitorList, FacilityList, HallCard, HoursTable, SessionList, SpeakerList } from './Cards';
import { useAssistant, type ChatMessage } from './useAssistant';
import { STRINGS } from '@/i18n/strings';

const MODES: { id: AssistantMode; icon: IconName }[] = [
  { id: 'visitor', icon: 'users' },
  { id: 'exhibitor', icon: 'store' },
  { id: 'organizer', icon: 'megaphone' },
];

interface Props {
  presetId: string;
  variant: 'widget' | 'page';
  onClose?: () => void;
}

export function ChatPanel({ presetId, variant, onClose }: Props) {
  const { lang, setLang, t } = useLang();
  const [mode, setMode] = useState<AssistantMode>('visitor');
  const { messages, typing, send, reset, config } = useAssistant(presetId, mode, variant);
  const { branding, data, settings } = config;
  const [draft, setDraft] = useState('');
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const compact = variant === 'widget';
  const tooLong = draft.length > MAX_QUESTION_LENGTH;
  const name = loc(branding.assistantName, lang);
  const otherLang: Lang = lang === 'en' ? 'ar' : 'en';
  const canSwitch = branding.languages.includes(otherLang);

  // Keep the newest message in view.
  useLayoutEffect(() => {
    const el = logRef.current;
    if (!el) return;
    const last = el.querySelector<HTMLElement>('[data-msg]:last-of-type');
    if (last && last.dataset.role === 'assistant' && last.offsetHeight > el.clientHeight * 0.7) {
      el.scrollTo({ top: last.offsetTop - 12, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    } else el.scrollTo({ top: el.scrollHeight, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [messages.length, typing]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!draft.trim() || tooLong || typing) return;
    void send(draft);
    setDraft('');
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const ask = (q: string) => {
    if (typing) return;
    void send(q);
    if (!compact) inputRef.current?.focus();
  };

  const welcomeChips = branding.suggested[mode].map((q) => loc(q, lang));
  const last = messages[messages.length - 1];

  return (
    <section
      className={`flex h-full min-h-0 flex-col ${compact ? '' : 'glass-strong rounded-[1.75rem]'}`}
      style={themeVars(branding.primary, branding.accent) as React.CSSProperties}
      aria-label={name}
    >
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <BrandMark name={loc(data.info.name, lang)} logo={branding.logo} primary={branding.primary} accent={branding.accent} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-display text-base font-semibold text-white">{name}</h2>
            {!compact && <DemoBadge />}
          </div>
          <p className="flex items-center gap-1.5 truncate text-xs text-slate-400">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
            {t('assistant.online')}
          </p>
        </div>
        {canSwitch && (
          <button
            type="button"
            onClick={() => setLang(otherLang)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-slate-200 ring-1 ring-white/15 hover:bg-white/10"
            aria-label={t('lang.switchLabel')}
            lang={otherLang}
          >
            <Icon name="globe" size={15} />
            {t('lang.switch')}
          </button>
        )}
        <button type="button" onClick={reset} className="grid h-9 w-9 place-items-center rounded-full text-slate-300 hover:bg-white/10" aria-label={t('assistant.clear')} title={t('assistant.clear')}>
          <Icon name="restart" size={17} />
        </button>
        {compact && (
          <>
            <Link to={`/demo/ai-event-assistant?preset=${presetId}`} className="hidden h-9 w-9 place-items-center rounded-full text-slate-300 hover:bg-white/10 sm:grid" aria-label={t('assistant.fullPage')} title={t('assistant.fullPage')}>
              <Icon name="expand" size={16} />
            </Link>
            {onClose && (
              <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-slate-300 hover:bg-white/10" aria-label={t('assistant.close')}>
                <Icon name="close" size={18} />
              </button>
            )}
          </>
        )}
      </header>

      {/* Modes */}
      <div role="tablist" aria-label={t('assistant.modes')} className="flex gap-1 border-b border-white/10 px-3 py-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-semibold transition ${
              mode === m.id ? 'bg-brand-primary text-[color:var(--brand-on-primary)] shadow-glow' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Icon name={m.icon} size={14} />
            {t(`assistant.mode.${m.id}`)}
          </button>
        ))}
      </div>

      {/* Conversation */}
      <div ref={logRef} role="log" aria-live="polite" aria-label={t('assistant.messages')} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4">
        <Bubble role="assistant">
          <p className="text-[14px] leading-relaxed">{loc(branding.welcome, lang)}</p>
          {compact && <DemoBadge className="mt-2.5" />}
        </Bubble>
        {messages.length === 0 && <Chips label={t('assistant.suggested')} items={welcomeChips} onPick={ask} />}

        {messages.map((m) => (
          <MessageView key={m.id} m={m} presetId={presetId} compact={compact} />
        ))}
        {typing && <TypingIndicator label={t('assistant.typing')} />}
        {!typing && last?.reply && last.reply.suggestions.length > 0 && (
          <div dir={last.reply.lang === 'ar' ? 'rtl' : 'ltr'}>
            <Chips label={STRINGS[last.reply.lang]['assistant.suggested']} items={last.reply.suggestions} onPick={ask} />
          </div>
        )}
      </div>

      {/* Composer */}
      <form onSubmit={submit} className="border-t border-white/10 p-3 safe-bottom">
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-midnight-950/70 p-1.5 focus-within:border-brand-accent/60 focus-within:ring-2 focus-within:ring-brand-accent/25">
          <label htmlFor={`q-${variant}`} className="sr-only">
            {t('assistant.placeholder')}
          </label>
          <textarea
            id={`q-${variant}`}
            ref={inputRef}
            rows={1}
            dir="auto"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder={t('assistant.placeholder')}
            aria-invalid={tooLong}
            aria-describedby={tooLong ? `q-err-${variant}` : undefined}
            autoComplete="off"
            className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-2.5 py-2 text-[16px] text-white placeholder:text-slate-500 focus:outline-none sm:text-[15px]"
          />
          <button
            type="submit"
            disabled={!draft.trim() || tooLong || typing}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-primary text-[color:var(--brand-on-primary)] transition hover:brightness-110 disabled:opacity-40"
            aria-label={t('assistant.send')}
          >
            <Icon name="send" size={18} className="rtl:-scale-x-100" />
          </button>
        </div>
        {tooLong ? (
          <p id={`q-err-${variant}`} role="alert" className="mt-1.5 px-1 text-xs text-rose-300">
            {t('assistant.tooLong')}
          </p>
        ) : (
          <p className="mt-1.5 px-1 text-[11px] leading-snug text-slate-500">{settings.logQuestions ? t('assistant.privacy') : t('demo.disclaimer')}</p>
        )}
      </form>
    </section>
  );
}

function Bubble({ role, children, dir }: { role: ChatMessage['role']; children: React.ReactNode; dir?: 'ltr' | 'rtl' }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;
    gsap.fromTo(ref.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' });
    const cards = ref.current.querySelectorAll('[data-card]');
    if (cards.length) gsap.fromTo(cards, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.05, delay: 0.1 });
  }, []);
  return (
    <div ref={ref} data-msg data-role={role} dir={dir} className={`flex ${role === 'visitor' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={
          role === 'visitor'
            ? 'max-w-[85%] rounded-2xl rounded-ee-md bg-brand-primary px-4 py-2.5 text-[14px] text-[color:var(--brand-on-primary)] shadow-glow'
            : 'w-full max-w-full rounded-2xl rounded-ss-md border border-white/10 bg-white/[0.06] px-4 py-3 text-slate-100'
        }
      >
        {children}
      </div>
    </div>
  );
}

function MessageView({ m, presetId, compact }: { m: ChatMessage; presetId: string; compact: boolean }) {
  const config = useConfig(presetId);
  if (m.role === 'visitor')
    return (
      <Bubble role="visitor">
        <p dir="auto" className="whitespace-pre-wrap break-words">
          {m.text}
        </p>
      </Bubble>
    );
  const reply = m.reply!;
  return (
    <Bubble role="assistant" dir={reply.lang === 'ar' ? 'rtl' : 'ltr'}>
      <CardProvider value={{ data: config.data, settings: config.settings, presetId, lang: reply.lang, compact }}>
        <ReplyView reply={reply} />
      </CardProvider>
    </Bubble>
  );
}

function ReplyView({ reply }: { reply: AssistantReply }) {
  const s = STRINGS[reply.lang];
  return (
    <div className="space-y-3" lang={reply.lang}>
      {reply.source === 'ai' && (
        <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-accent/15 px-2.5 py-1 text-[11px] font-semibold text-brand-accent">
          <Icon name="sparkles" size={12} /> {s['assistant.aiBadge']}
        </p>
      )}
      {reply.blocks.map((b, i) => (
        <Block key={i} b={b} fallbackText={s['assistant.aiFallback']} />
      ))}
    </div>
  );
}

function Block({ b, fallbackText }: { b: ReplyBlock; fallbackText: string }) {
  switch (b.kind) {
    case 'text':
      return <p className="whitespace-pre-line text-[14px] leading-relaxed">{b.text}</p>;
    case 'notice':
      return (
        <p className={`flex gap-2 rounded-xl px-3 py-2 text-xs ${b.tone === 'warning' ? 'bg-rose-400/10 text-rose-200' : 'bg-gold-400/10 text-gold-300'}`}>
          <Icon name="info" size={14} className="mt-px shrink-0" />
          {b.text === 'ai-fallback' ? fallbackText : b.text}
        </p>
      );
    case 'exhibitors':
      return <ExhibitorList ids={b.ids} total={b.total} />;
    case 'speakers':
      return <SpeakerList ids={b.ids} />;
    case 'sessions':
      return <SessionList ids={b.ids} />;
    case 'hall':
      return <HallCard id={b.id} />;
    case 'facilities':
      return <FacilityList ids={b.ids} />;
    case 'announcements':
      return <AnnouncementList ids={b.ids} />;
    case 'hours':
      return <HoursTable dayIndexes={b.dayIndexes} />;
  }
}

function Chips({ label, items, onPick }: { label: string; items: string[]; onPick: (q: string) => void }) {
  return (
    <div>
      <p className="sr-only">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {items.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => onPick(q)}
              className="rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3.5 py-2 text-start text-[13px] font-medium text-white transition hover:border-brand-primary/60 hover:bg-brand-primary/20"
            >
              {q}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex" role="status" aria-label={label}>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-ss-md border border-white/10 bg-white/[0.06] px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2 w-2 animate-typing rounded-full bg-brand-primary" style={{ animationDelay: `${i * 0.16}s` }} />
        ))}
      </div>
    </div>
  );
}
