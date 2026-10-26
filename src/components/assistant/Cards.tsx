import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { eventClock, formatDate, formatTime, minutes, type EventClock } from '@/engine/clock';
import { loc } from '@/engine/text';
import { PAGE } from '@/engine/respond';
import { STRINGS, type StringKey } from '@/i18n/strings';
import type { AssistantSettings } from '@/types/assistant';
import type { EventDataset, Exhibitor, FacilityType, Lang, Session, Speaker } from '@/types/event';
import { Icon, type IconName } from '../ui/Icon';
import { useToast } from '../ui/Toast';

interface CardEnv {
  data: EventDataset;
  settings: AssistantSettings;
  presetId: string;
  /** Language of the reply (may differ from the UI when a visitor writes in Arabic). */
  lang: Lang;
  /** Compact cards for the narrow floating widget. */
  compact: boolean;
}

const Ctx = createContext<CardEnv | null>(null);

export function CardProvider({ value, children }: { value: CardEnv; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function useCards() {
  const env = useContext(Ctx)!;
  const clock = useMemo<EventClock>(() => eventClock(env.data, env.settings), [env.data, env.settings]);
  const t = (key: StringKey, vars?: Record<string, string | number>) => {
    let s: string = STRINGS[env.lang][key];
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
    return s;
  };
  return { ...env, clock, t };
}

export function mapHref(presetId: string, q: { stand?: string; hall?: string; facility?: string[] }): string {
  const p = new URLSearchParams({ preset: presetId });
  if (q.stand) p.set('stand', q.stand);
  if (q.hall) p.set('hall', q.hall);
  if (q.facility?.length) p.set('facility', q.facility.join(','));
  return `/demo/ai-event-assistant/map?${p.toString()}`;
}

const chip = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition';

function MapButton({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className={`${chip} bg-brand-primary/15 text-brand-primary ring-1 ring-brand-primary/30 hover:bg-brand-primary/25`}>
      <Icon name="pin" size={14} />
      {label}
    </Link>
  );
}

/** Demo records point at `.example` addresses; say so instead of opening a dead link. */
function ActionLink({ href, icon, label }: { href: string; icon: IconName; label: string }) {
  const toast = useToast();
  const { t } = useCards();
  const demo = /\.example(\/|$|\?)|@[\w-]+\.example$/.test(href.replace(/^mailto:/, ''));
  return (
    <a
      href={href}
      target={href.startsWith('mailto:') ? undefined : '_blank'}
      rel="noopener noreferrer"
      onClick={(e) => {
        if (!demo) return;
        e.preventDefault();
        toast(`${t('demo.badge')}: ${label} → ${href.replace(/^mailto:/, '')}`, 'info');
      }}
      className={`${chip} bg-white/5 text-slate-200 ring-1 ring-white/10 hover:bg-white/10`}
    >
      <Icon name={icon} size={14} />
      {label}
    </a>
  );
}

function ShowAll({ total, open, onToggle }: { total: number; open: boolean; onToggle: () => void }) {
  const { t } = useCards();
  if (total <= PAGE) return null;
  return (
    <button type="button" onClick={onToggle} className="mt-2 w-full rounded-xl border border-white/10 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5">
      {open ? t('card.showLess') : t('card.showAll', { n: total })}
    </button>
  );
}

// ---------- exhibitors ----------

function ExhibitorCard({ e, detailed }: { e: Exhibitor; detailed: boolean }) {
  const { data, lang, presetId, t } = useCards();
  const hall = data.halls.find((h) => h.id === e.hallId);
  const cats = e.categoryIds.map((id) => data.categories.find((c) => c.id === id)).filter(Boolean);
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5" data-card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate font-display text-[15px] font-semibold text-white" dir="auto">
            {e.name}
          </h4>
          <p className="mt-0.5 text-xs text-slate-400">
            {loc(hall?.name, lang)} · {loc(hall?.theme, lang)} · {loc(e.country, lang)}
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-brand-primary/15 px-2 py-1 font-mono text-xs font-bold text-brand-primary" dir="ltr" title={t('card.stand')}>
          {e.stand}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {e.featured && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/15 px-2 py-0.5 text-[11px] font-semibold text-gold-300">
            <Icon name="star" size={11} /> {t('card.featured')}
          </span>
        )}
        {cats.map((c) => (
          <span key={c!.id} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-300 ring-1 ring-white/10">
            {loc(c!.name, lang)}
          </span>
        ))}
      </div>
      <p className={`mt-2 text-[13px] leading-relaxed text-slate-300 ${detailed ? '' : 'line-clamp-2'}`}>{loc(e.description, lang)}</p>
      {detailed && e.products.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 rtl:tracking-normal">{t('card.products')}</p>
          <ul className="mt-1.5 space-y-1.5">
            {e.products.map((p) => (
              <li key={p.name.en} className="rounded-xl bg-white/[0.04] px-3 py-2">
                <p className="text-[13px] font-semibold text-white">{loc(p.name, lang)}</p>
                <p className="text-xs text-slate-400">{loc(p.description, lang)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <MapButton to={mapHref(presetId, { stand: e.stand })} label={t('card.showOnMap')} />
        {detailed && e.brochureUrl && <ActionLink href={e.brochureUrl} icon="file" label={t('card.brochure')} />}
        {detailed && e.enquiryEmail && <ActionLink href={`mailto:${e.enquiryEmail}`} icon="mail" label={t('card.enquire')} />}
        {detailed && e.website && <ActionLink href={e.website} icon="link" label={t('card.website')} />}
      </div>
    </article>
  );
}

export function ExhibitorList({ ids, total }: { ids: string[]; total: number }) {
  const { data, compact } = useCards();
  const [open, setOpen] = useState(false);
  const list = ids.map((id) => data.exhibitors.find((e) => e.id === id)).filter(Boolean) as Exhibitor[];
  const shown = open ? list : list.slice(0, PAGE);
  return (
    <div>
      <div className={`grid gap-2.5 ${compact ? '' : 'sm:grid-cols-2'}`}>
        {shown.map((e) => (
          <ExhibitorCard key={e.id} e={e} detailed={list.length === 1} />
        ))}
      </div>
      <ShowAll total={Math.max(total, list.length)} open={open} onToggle={() => setOpen((o) => !o)} />
    </div>
  );
}

// ---------- speakers ----------

function initials(name: string) {
  return name
    .replace(/^(dr|prof|eng)\.?\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
}

function SpeakerCard({ s, detailed }: { s: Speaker; detailed: boolean }) {
  const { lang, data } = useCards();
  const topics = s.topics.map((id) => data.categories.find((c) => c.id === id)).filter(Boolean);
  const name = lang === 'ar' ? s.nameAr : s.name;
  return (
    <article className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5" data-card>
      <span
        aria-hidden="true"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-primary to-brand-accent font-display text-sm font-bold text-midnight-950"
        dir="ltr"
      >
        {initials(s.name)}
      </span>
      <div className="min-w-0">
        <h4 className="font-display text-[15px] font-semibold text-white">{name}</h4>
        <p className="text-xs text-slate-400">
          {loc(s.title, lang)} · <span dir="auto">{s.organization}</span>
        </p>
        {detailed && <p className="mt-2 text-[13px] leading-relaxed text-slate-300">{loc(s.bio, lang)}</p>}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {topics.map((c) => (
            <span key={c!.id} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-300 ring-1 ring-white/10">
              {loc(c!.name, lang)}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function SpeakerList({ ids }: { ids: string[] }) {
  const { data, compact } = useCards();
  const [open, setOpen] = useState(false);
  const list = ids.map((id) => data.speakers.find((s) => s.id === id)).filter(Boolean) as Speaker[];
  const shown = open ? list : list.slice(0, PAGE);
  return (
    <div>
      <div className={`grid gap-2.5 ${compact ? '' : 'sm:grid-cols-2'}`}>
        {shown.map((s) => (
          <SpeakerCard key={s.id} s={s} detailed={list.length === 1} />
        ))}
      </div>
      <ShowAll total={list.length} open={open} onToggle={() => setOpen((o) => !o)} />
    </div>
  );
}

// ---------- sessions ----------

function status(s: Session, clock: EventClock): 'live' | 'ended' | null {
  const now = clock.dayIndex * 1440 + minutes(clock.time);
  const a = s.dayIndex * 1440 + minutes(s.start);
  const b = s.dayIndex * 1440 + minutes(s.end);
  if (now >= a && now < b) return 'live';
  if (now >= b) return 'ended';
  return null;
}

const FORMAT: Record<Session['format'], [string, string]> = {
  keynote: ['Keynote', 'كلمة رئيسية'],
  panel: ['Panel', 'حلقة نقاش'],
  talk: ['Talk', 'محاضرة'],
  workshop: ['Workshop', 'ورشة عمل'],
  demo: ['Live demo', 'عرض مباشر'],
};

function SessionCard({ s }: { s: Session }) {
  const { data, lang, clock, presetId, t } = useCards();
  const stage = data.stages.find((x) => x.id === s.stageId);
  const hall = data.halls.find((h) => h.id === stage?.hallId);
  const day = data.info.days[s.dayIndex];
  const speakers = s.speakerIds.map((id) => data.speakers.find((x) => x.id === id)).filter(Boolean) as Speaker[];
  const st = status(s, clock);
  return (
    <article className={`rounded-2xl border p-3.5 ${st === 'live' ? 'border-emerald-400/40 bg-emerald-400/[0.06]' : 'border-white/10 bg-white/[0.04]'} ${st === 'ended' ? 'opacity-70' : ''}`} data-card>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-brand-primary">
          {loc(day?.label, lang)} · {day && formatDate(day.date, lang, false)}
        </span>
        <span className="font-mono text-slate-300" dir="ltr">
          {formatTime(s.start, lang)}–{formatTime(s.end, lang)}
        </span>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-300 ring-1 ring-white/10">{FORMAT[s.format][lang === 'ar' ? 1 : 0]}</span>
        {st === 'live' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> {t('card.now')}
          </span>
        )}
        {st === 'ended' && <span className="text-[11px] text-slate-500">{t('card.ended')}</span>}
      </div>
      <h4 className="mt-1.5 font-display text-[15px] font-semibold leading-snug text-white">{loc(s.title, lang)}</h4>
      <p className="mt-1 text-xs text-slate-400">
        {loc(stage?.name, lang)} · {loc(hall?.name, lang)}
        {speakers.length > 0 && <> · {speakers.map((x) => (lang === 'ar' ? x.nameAr : x.name)).join(lang === 'ar' ? '، ' : ', ')}</>}
      </p>
      {hall && (
        <div className="mt-2.5">
          <MapButton to={mapHref(presetId, { hall: hall.id })} label={t('card.showOnMap')} />
        </div>
      )}
    </article>
  );
}

export function SessionList({ ids }: { ids: string[] }) {
  const { data } = useCards();
  const [open, setOpen] = useState(false);
  const list = ids.map((id) => data.sessions.find((s) => s.id === id)).filter(Boolean) as Session[];
  const shown = open ? list : list.slice(0, PAGE);
  return (
    <div>
      <div className="grid gap-2.5">
        {shown.map((s) => (
          <SessionCard key={s.id} s={s} />
        ))}
      </div>
      <ShowAll total={list.length} open={open} onToggle={() => setOpen((o) => !o)} />
    </div>
  );
}

// ---------- halls, facilities, hours, announcements ----------

export function HallCard({ id }: { id: string }) {
  const { data, lang, presetId, t } = useCards();
  const h = data.halls.find((x) => x.id === id);
  if (!h) return null;
  const exhibitors = data.exhibitors.filter((e) => e.hallId === h.id).length;
  const stages = data.stages.filter((s) => s.hallId === h.id);
  const facilities = data.facilities.filter((f) => f.zone === h.id);
  return (
    <article className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand-primary/10 to-transparent p-4" data-card>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-primary/20 font-display text-lg font-bold text-brand-primary" dir="ltr">
          {h.number}
        </span>
        <div>
          <h4 className="font-display text-base font-semibold text-white">{loc(h.name, lang)}</h4>
          <p className="text-xs text-slate-300">{loc(h.theme, lang)}</p>
        </div>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-slate-300">{loc(h.description, lang)}</p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-white/[0.04] px-3 py-2">
          <dt className="text-slate-400">{t('card.exhibitors')}</dt>
          <dd className="font-display text-lg font-bold text-white">{exhibitors}</dd>
        </div>
        <div className="rounded-xl bg-white/[0.04] px-3 py-2">
          <dt className="text-slate-400">{t('card.stages')}</dt>
          <dd className="text-[13px] font-semibold text-white">{stages.map((s) => loc(s.name, lang)).join(', ') || '—'}</dd>
        </div>
      </dl>
      {facilities.length > 0 && (
        <p className="mt-2 text-xs text-slate-400">
          {t('card.facilities')}: {facilities.map((f) => loc(f.name, lang)).join(', ')}
        </p>
      )}
      <div className="mt-3">
        <MapButton to={mapHref(presetId, { hall: h.id })} label={t('card.showOnMap')} />
      </div>
    </article>
  );
}

export const FACILITY_ICON: Record<FacilityType, IconName> = {
  restroom: 'restroom',
  prayer: 'moon',
  food: 'utensils',
  cafe: 'coffee',
  info: 'info',
  firstAid: 'cross',
  entrance: 'door',
  parking: 'car',
  atm: 'card',
  cloakroom: 'bag',
  charging: 'bolt',
  wifi: 'wifi',
  accessibility: 'wheelchair',
  taxi: 'car',
};

export function FacilityList({ ids }: { ids: string[] }) {
  const { data, lang, presetId, t } = useCards();
  const list = ids.map((id) => data.facilities.find((f) => f.id === id)).filter(Boolean);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2" data-card>
      <ul className="divide-y divide-white/5">
        {list.map((f) => (
          <li key={f!.id} className="flex gap-3 px-2 py-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-accent/15 text-brand-accent">
              <Icon name={FACILITY_ICON[f!.type]} size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white">{loc(f!.name, lang)}</p>
              <p className="text-xs text-slate-400">{loc(f!.location, lang)}</p>
              {f!.hours && <p className="mt-0.5 text-[11px] text-slate-500">{loc(f!.hours, lang)}</p>}
            </div>
          </li>
        ))}
      </ul>
      <div className="px-2 pb-1.5 pt-1">
        <MapButton to={mapHref(presetId, { facility: ids })} label={t('card.showOnMap')} />
      </div>
    </div>
  );
}

export function HoursTable({ dayIndexes }: { dayIndexes: number[] }) {
  const { data, lang, clock, t } = useCards();
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10" data-card>
      <table className="w-full text-start text-xs">
        <caption className="sr-only">{t('card.opening')}</caption>
        <thead className="bg-white/5 text-slate-400">
          <tr>
            <th className="px-3 py-2 text-start font-medium">{t('card.opening')}</th>
            <th className="px-3 py-2 text-start font-medium">{t('card.open')}</th>
            <th className="px-3 py-2 text-start font-medium">{t('card.close')}</th>
          </tr>
        </thead>
        <tbody>
          {dayIndexes.map((i) => {
            const d = data.info.days[i];
            const today = i === clock.dayIndex;
            return (
              <tr key={d.date} className={`border-t border-white/5 ${today ? 'bg-brand-primary/10' : ''}`}>
                <td className="px-3 py-2 text-slate-200">
                  <span className="font-semibold">{loc(d.label, lang)}</span> · {formatDate(d.date, lang, false)}
                </td>
                <td className="px-3 py-2 font-mono text-slate-200" dir="ltr">{formatTime(d.open, lang)}</td>
                <td className="px-3 py-2 font-mono text-slate-200" dir="ltr">{formatTime(d.close, lang)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function AnnouncementList({ ids }: { ids: string[] }) {
  const { data, lang, t } = useCards();
  const list = ids.map((id) => data.announcements.find((a) => a.id === id)).filter(Boolean);
  return (
    <ul className="grid gap-2.5">
      {list.map((a) => (
        <li key={a!.id} className={`rounded-2xl border p-3.5 ${a!.priority === 'important' ? 'border-gold-400/40 bg-gold-400/[0.07]' : 'border-white/10 bg-white/[0.04]'}`} data-card>
          <div className="flex items-center gap-2">
            <Icon name="megaphone" size={15} className={a!.priority === 'important' ? 'text-gold-300' : 'text-slate-400'} />
            {a!.priority === 'important' && <span className="text-[11px] font-semibold uppercase text-gold-300">{t('card.important')}</span>}
            {a!.dayIndex !== undefined && (
              <span className="text-[11px] text-slate-400">
                {loc(data.info.days[a!.dayIndex]?.label, lang)}
                {a!.time ? ` · ${formatTime(a!.time, lang)}` : ''}
              </span>
            )}
          </div>
          <h4 className="mt-1 text-[14px] font-semibold text-white">{loc(a!.title, lang)}</h4>
          <p className="mt-0.5 text-[13px] leading-relaxed text-slate-300">{loc(a!.body, lang)}</p>
        </li>
      ))}
    </ul>
  );
}
