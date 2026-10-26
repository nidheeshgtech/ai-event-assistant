import type { ReactNode } from 'react';
import { Icon, type IconName } from '../ui/Icon';

interface Props {
  label: string;
  value: string | number;
  icon: IconName;
  hint?: ReactNode;
  tone?: 'gold' | 'blue' | 'purple' | 'green' | 'rose';
}

const toneClass = {
  gold: 'bg-gold-400/15 text-gold-300',
  blue: 'bg-electric-400/15 text-electric-300',
  purple: 'bg-plum-500/20 text-violet-200',
  green: 'bg-emerald-400/15 text-emerald-300',
  rose: 'bg-rose-400/15 text-rose-300',
};

export function KpiCard({ label, value, icon, hint, tone = 'gold' }: Props) {
  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${toneClass[tone]}`}>
          <Icon name={icon} size={16} />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold tabular-nums text-white sm:text-3xl">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function Panel({ title, action, children, className = '' }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`glass rounded-2xl p-4 sm:p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
