import { useId } from 'react';
import { Link } from 'react-router-dom';
import { readableOn } from '@/services/color';

/** EventVerse Studio wordmark (matches the main EventVerse site). */
export function Logo({ className = '', to = '/solutions/ai-event-assistant' }: { className?: string; to?: string }) {
  const gid = `ev-logo-${useId().replace(/:/g, '')}`;
  return (
    <Link to={to} className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="EventVerse Studio">
      <svg width="32" height="32" viewBox="0 0 64 64" aria-hidden="true" className="transition-transform duration-500 group-hover:rotate-45">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffe7a3" />
            <stop offset=".5" stopColor="#f9d36b" />
            <stop offset="1" stopColor="#4cc3ff" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill="#18181b" stroke="rgba(255,255,255,.12)" />
        <path d="M32 10l5.5 14.5L52 30l-14.5 5.5L32 50l-5.5-14.5L12 30l14.5-5.5z" fill={`url(#${gid})`} />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight text-white" dir="ltr">
        Event<span className="text-gold">Verse</span>
        <span className="ms-1.5 hidden text-xs font-medium uppercase tracking-[0.2em] text-slate-400 sm:inline">Studio</span>
      </span>
    </Link>
  );
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'AI'
  );
}

/** Client/event logo, or a monogram in the brand colours when none is set. */
export function BrandMark({ name, logo, primary, accent, size = 40 }: { name: string; logo?: string; primary: string; accent: string; size?: number }) {
  if (logo) {
    const svg = logo.startsWith('data:image/svg+xml');
    return svg ? (
      <img src={logo} alt="" width={size} height={size} className="shrink-0 rounded-xl ring-1 ring-white/15" style={{ width: size, height: size }} />
    ) : (
      <span className="inline-grid shrink-0 place-items-center overflow-hidden rounded-xl bg-white/95 p-1" style={{ width: size, height: size }}>
        <img src={logo} alt="" className="max-h-full max-w-full object-contain" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="inline-grid shrink-0 place-items-center rounded-xl font-display font-bold ring-1 ring-white/20"
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, ${primary}, ${accent})`, color: readableOn(primary) }}
    >
      {initials(name)}
    </span>
  );
}
