import type { HTMLAttributes, ReactNode } from 'react';
import { useLang } from '@/i18n/LangProvider';

export function GlassCard({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`glass rounded-3xl ${className}`} {...rest}>
      {children}
    </div>
  );
}

type Tone = 'gold' | 'blue' | 'green' | 'rose' | 'slate' | 'purple';
const tones: Record<Tone, string> = {
  gold: 'bg-gold-400/15 text-gold-300 ring-gold-400/30',
  blue: 'bg-electric-400/15 text-electric-300 ring-electric-400/30',
  green: 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/30',
  rose: 'bg-rose-400/15 text-rose-300 ring-rose-400/30',
  slate: 'bg-white/10 text-slate-300 ring-white/15',
  purple: 'bg-white/10 text-zinc-200 ring-white/20',
};

export function Badge({ tone = 'slate', children, className = '' }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1 rtl:tracking-normal ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** Persistent marker on anything that is fictional demo data. */
export function DemoBadge({ className = '' }: { className?: string }) {
  const { t } = useLang();
  return (
    <Badge tone="gold" className={className}>
      <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
      {t('demo.badge')}
    </Badge>
  );
}

export function Spinner({ label }: { label?: string }) {
  const { t } = useLang();
  return (
    <div role="status" className="flex items-center justify-center gap-3 text-slate-300">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-brand-primary" aria-hidden="true" />
      <span className="text-sm">{label ?? t('common.loading')}…</span>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Spinner />
    </div>
  );
}
