import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { loc } from '@/engine/text';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { useLang } from '@/i18n/LangProvider';
import { themeVars } from '@/services/color';
import { useConfig } from '@/services/configStore';
import { readSession, writeSession } from '@/services/storage';
import { BrandMark } from '../ui/Brand';
import { Icon } from '../ui/Icon';
import { ChatPanel } from './ChatPanel';

/**
 * Floating assistant launcher, as an organiser would embed it on an event website.
 * Full-screen sheet on phones, a docked card on larger screens.
 */
export function AssistantWidget({ presetId }: { presetId: string }) {
  const { branding, data } = useConfig(presetId);
  const { lang, t } = useLang();
  const [open, setOpen] = useState(() => readSession('widget-open') === '1');
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const left = branding.widgetPosition === 'bottom-left';

  const location = useLocation();

  useEffect(() => writeSession('widget-open', open ? '1' : '0'), [open]);

  // On phones the panel covers the page, so a "Show on map" link must reveal the map.
  useEffect(() => {
    if (window.matchMedia('(max-width: 639px)').matches) setOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (panel && !prefersReducedMotion()) {
      gsap.fromTo(panel, { opacity: 0, y: 24, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: 'power3.out' });
    }
    panel?.querySelector<HTMLTextAreaElement>('textarea')?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    // Lock page scroll only when the panel covers the screen (phones).
    const sheet = window.matchMedia('(max-width: 639px)').matches;
    if (sheet) document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  };

  const name = loc(branding.assistantName, lang);

  return (
    <div style={themeVars(branding.primary, branding.accent) as React.CSSProperties}>
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label={name}
          className={`fixed inset-0 z-[60] flex flex-col bg-midnight-950/95 backdrop-blur-xl sm:inset-auto sm:bottom-5 sm:h-[min(680px,calc(100dvh-2.5rem))] sm:w-[400px] sm:overflow-hidden sm:rounded-[1.75rem] sm:border sm:border-white/12 sm:shadow-glass ${
            left ? 'sm:left-5' : 'sm:right-5'
          }`}
        >
          <ChatPanel presetId={presetId} variant="widget" onClose={close} />
        </div>
      )}

      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('assistant.open')}
          className={`group fixed bottom-5 z-[60] flex items-center gap-3 rounded-full bg-midnight-900/90 p-1.5 pe-5 shadow-glow ring-1 ring-brand-primary/40 backdrop-blur-xl transition hover:-translate-y-0.5 ${
            left ? 'left-5' : 'right-5'
          }`}
        >
          <span className="relative">
            <span className="absolute inset-0 animate-pulse-ring rounded-xl bg-brand-primary/50" aria-hidden="true" />
            <span className="relative block">
              <BrandMark name={loc(data.info.name, lang)} logo={branding.logo} primary={branding.primary} accent={branding.accent} size={44} />
            </span>
          </span>
          <span className="text-start">
            <span className="block font-display text-sm font-semibold text-white">{name}</span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Icon name="chat" size={12} /> {t('assistant.open')}
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
