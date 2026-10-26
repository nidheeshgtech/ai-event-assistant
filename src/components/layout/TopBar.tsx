import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import type { StringKey } from '@/i18n/strings';
import { Logo } from '../ui/Brand';
import { buttonClass } from '../ui/Button';
import { Icon, type IconName } from '../ui/Icon';

const LINKS: { to: string; key: StringKey; icon: IconName; end?: boolean }[] = [
  { to: '/solutions/ai-event-assistant', key: 'nav.product', icon: 'sparkles' },
  { to: '/demo/ai-event-assistant', key: 'nav.demo', icon: 'chat', end: true },
  { to: '/demo/ai-event-assistant/map', key: 'nav.map', icon: 'map' },
  { to: '/demo/ai-event-assistant/dashboard', key: 'nav.dashboard', icon: 'chart' },
];

export function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  const other = lang === 'en' ? 'ar' : 'en';
  return (
    <button
      type="button"
      onClick={() => setLang(other)}
      aria-label={t('lang.switchLabel')}
      lang={other}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-slate-200 ring-1 ring-white/15 hover:bg-white/10 ${className}`}
    >
      <Icon name="globe" size={16} />
      {t('lang.switch')}
    </button>
  );
}

export function TopBar({ preserveQuery = '' }: { preserveQuery?: string }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const cls = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 safe-top ${scrolled || open ? 'border-b border-white/10 bg-midnight-950/80 backdrop-blur-xl' : 'bg-transparent'}`}>
      <nav className="section flex h-16 items-center justify-between gap-3" aria-label="Main">
        <Logo />
        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink to={`${l.to}${preserveQuery}`} end={l.end} className={cls}>
                {t(l.key)}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <LangToggle />
          <Link to="/solutions/ai-event-assistant#request-demo" className={buttonClass('primary', 'sm', 'hidden lg:inline-flex')}>
            {t('nav.requestDemo')}
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/10 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t('nav.closeMenu') : t('nav.menu')}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-menu" className="section pb-6 lg:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink to={`${l.to}${preserveQuery}`} end={l.end} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3.5 font-display text-lg text-white hover:bg-white/5">
                  <Icon name={l.icon} size={20} className="text-slate-400" />
                  {t(l.key)}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link to="/solutions/ai-event-assistant#request-demo" onClick={() => setOpen(false)} className={buttonClass('primary', 'lg', 'mt-4 w-full')}>
            {t('nav.requestDemo')}
          </Link>
        </div>
      )}
    </header>
  );
}
