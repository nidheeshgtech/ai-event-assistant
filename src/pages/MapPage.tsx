import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AssistantWidget } from '@/components/assistant/AssistantWidget';
import { CardProvider, ExhibitorList, FACILITY_ICON, FacilityList, HallCard } from '@/components/assistant/Cards';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { PresetSwitcher } from '@/components/layout/PresetSwitcher';
import { TopBar } from '@/components/layout/TopBar';
import { FloorPlan } from '@/components/map/FloorPlan';
import { Icon } from '@/components/ui/Icon';
import { DemoBadge, GlassCard } from '@/components/ui/Misc';
import { normalize } from '@/engine/normalize';
import { loc } from '@/engine/text';
import { usePreset } from '@/hooks/usePreset';
import { useLang } from '@/i18n/LangProvider';
import { themeVars } from '@/services/color';
import { useConfig } from '@/services/configStore';

type Result = { kind: 'stand'; code: string; label: string; sub: string } | { kind: 'facility'; id: string; label: string; sub: string };

export default function MapPage() {
  const [presetId, setPreset] = usePreset();
  const config = useConfig(presetId);
  const { data, settings, branding } = config;
  const { lang, t } = useLang();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');

  const stand = params.get('stand')?.toUpperCase() || undefined;
  const hall = params.get('hall') || undefined;
  const facilities = useMemo(() => (params.get('facility') ?? '').split(',').filter(Boolean), [params]);

  useEffect(() => {
    document.title = `${t('map.title')} · ${loc(data.info.name, lang)}`;
  }, [data.info.name, lang, t]);

  const select = (q: { stand?: string; hall?: string; facility?: string[] }) => {
    const next = new URLSearchParams({ preset: presetId });
    if (q.stand) next.set('stand', q.stand);
    if (q.hall) next.set('hall', q.hall);
    if (q.facility?.length) next.set('facility', q.facility.join(','));
    setParams(next, { replace: true });
  };

  // Search across stand codes, exhibitor names/aliases/categories and facilities.
  const results = useMemo<Result[]>(() => {
    const n = normalize(query);
    if (n.length < 2) return [];
    const out: Result[] = [];
    const code = /^h?\s?(\d)\s?-?\s?(\d{1,2})$/.exec(n);
    for (const e of data.exhibitors) {
      const cats = e.categoryIds.map((id) => data.categories.find((c) => c.id === id)).filter(Boolean);
      const hay = normalize([e.name, ...e.aliases, ...e.tags, ...cats.flatMap((c) => [c!.name.en, c!.name.ar])].join(' '));
      const codeHit = code && e.stand.toUpperCase() === `H${code[1]}-${code[2].padStart(2, '0')}`;
      if (codeHit || hay.includes(n)) out.push({ kind: 'stand', code: e.stand, label: e.name, sub: `${e.stand} · ${loc(data.halls.find((h) => h.id === e.hallId)?.name, lang)}` });
    }
    if (code && !out.length) {
      const c = `H${code[1]}-${code[2].padStart(2, '0')}`;
      if (data.halls.some((h) => h.number === Number(code[1]) && Number(code[2]) >= 1 && Number(code[2]) <= h.standCount)) out.push({ kind: 'stand', code: c, label: c, sub: t('map.empty') });
    }
    for (const f of data.facilities) {
      if (normalize(`${f.name.en} ${f.name.ar} ${f.type}`).includes(n)) out.push({ kind: 'facility', id: f.id, label: loc(f.name, lang), sub: loc(f.location, lang) });
    }
    return out.slice(0, 8);
  }, [query, data, lang, t]);

  const matches = useMemo(() => new Set(results.filter((r): r is Extract<Result, { kind: 'stand' }> => r.kind === 'stand').map((r) => r.code)), [results]);
  const exhibitor = stand ? data.exhibitors.find((e) => e.stand.toUpperCase() === stand) : undefined;
  const standHall = stand ? data.halls.find((h) => h.number === Number(stand.slice(1, stand.indexOf('-')))) : undefined;
  const activeHall = hall ? data.halls.find((h) => h.id === hall) : undefined;
  const hallExhibitors = activeHall ? data.exhibitors.filter((e) => e.hallId === activeHall.id).sort((a, b) => a.stand.localeCompare(b.stand)) : [];

  return (
    <div className="min-h-[100dvh]" style={themeVars(branding.primary, branding.accent) as React.CSSProperties}>
      <DemoBanner />
      <TopBar preserveQuery={`?preset=${presetId}`} />
      <main className="section pb-28 pt-4">
        <PresetSwitcher value={presetId} onChange={setPreset} />

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <DemoBadge />
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{t('map.title')}</h1>
            <p className="mt-1 text-sm text-slate-400">{loc(data.info.name, lang)}</p>
          </div>
          <div className="relative w-full sm:w-96">
            <label htmlFor="map-search" className="sr-only">
              {t('map.search')}
            </label>
            <Icon name="search" size={18} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="map-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('map.searchPlaceholder')}
              maxLength={80}
              autoComplete="off"
              aria-controls="map-results"
              className="h-12 w-full rounded-2xl border border-white/10 bg-midnight-950/70 pe-4 ps-11 text-[16px] text-white placeholder:text-slate-500 focus:border-brand-accent/60 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 sm:text-sm"
            />
            {query.trim().length >= 2 && (
              <ul id="map-results" className="glass-strong absolute inset-x-0 top-14 z-20 max-h-80 overflow-y-auto rounded-2xl p-1.5" role="listbox" aria-label={t('map.search')}>
                {results.length === 0 && <li className="px-3 py-3 text-sm text-slate-400">{t('map.noResults')}</li>}
                {results.map((r) => (
                  <li key={r.kind === 'stand' ? `s-${r.code}-${r.label}` : `f-${r.id}`} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onClick={() => {
                        select(r.kind === 'stand' ? { stand: r.code } : { facility: [r.id] });
                        setQuery('');
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start hover:bg-white/10"
                    >
                      <Icon name={r.kind === 'stand' ? 'store' : FACILITY_ICON[data.facilities.find((f) => f.id === r.id)!.type]} size={18} className="shrink-0 text-brand-accent" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-white" dir="auto">
                          {r.label}
                        </span>
                        <span className="block truncate text-xs text-slate-400">{r.sub}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <FloorPlan
              data={data}
              selectedStand={stand}
              selectedHall={hall}
              selectedFacilities={facilities}
              matches={matches}
              onSelectStand={(code) => select({ stand: code })}
              onSelectHall={(id) => select({ hall: id })}
              onSelectFacility={(id) => select({ facility: [id] })}
            />
            <p className="mt-2 flex items-start gap-2 text-xs text-slate-500">
              <Icon name="info" size={14} className="mt-px shrink-0" /> {t('map.note')} {t('map.instructions')}
            </p>
          </div>

          <aside className="space-y-4" aria-live="polite">
            <CardProvider value={{ data, settings, presetId, lang, compact: true }}>
              {stand && (
                <GlassCard className="p-4">
                  {exhibitor ? (
                    <ExhibitorList ids={[exhibitor.id]} total={1} />
                  ) : (
                    <>
                      <p className="font-mono text-lg font-bold text-white" dir="ltr">{stand}</p>
                      <p className="mt-1 text-sm text-slate-400">{t('map.standEmpty')}</p>
                      {standHall && <p className="mt-1 text-sm text-slate-300">{loc(standHall.name, lang)} · {loc(standHall.theme, lang)}</p>}
                    </>
                  )}
                </GlassCard>
              )}
              {activeHall && (
                <>
                  <HallCard id={activeHall.id} />
                  <GlassCard className="p-4">
                    <h2 className="text-sm font-semibold">{t('map.list')}</h2>
                    <ul className="mt-2 divide-y divide-white/5">
                      {hallExhibitors.map((e) => (
                        <li key={e.id}>
                          <button type="button" onClick={() => select({ stand: e.stand })} className="flex w-full items-center justify-between gap-3 py-2 text-start text-sm hover:text-white">
                            <span className="truncate text-slate-200" dir="auto">{e.name}</span>
                            <span className="font-mono text-xs text-brand-primary" dir="ltr">{e.stand}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </>
              )}
              {facilities.length > 0 && <FacilityList ids={facilities} />}
            </CardProvider>

            {!stand && !activeHall && !facilities.length && (
              <GlassCard className="p-5">
                <h2 className="text-sm font-semibold">{t('map.hallDetails')}</h2>
                <ul className="mt-3 grid gap-2">
                  {data.halls.map((h) => (
                    <li key={h.id}>
                      <button type="button" onClick={() => select({ hall: h.id })} className="flex w-full items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 text-start hover:bg-white/10">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-primary/20 font-display font-bold text-brand-primary" dir="ltr">{h.number}</span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-white">{loc(h.name, lang)}</span>
                          <span className="block truncate text-xs text-slate-400">{loc(h.theme, lang)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400 rtl:tracking-normal">{t('map.legend')}</h3>
                <ul className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><span className="h-3.5 w-5 rounded border border-brand-accent/40 bg-brand-accent/20" />{t('card.exhibitors')}</li>
                  <li className="flex items-center gap-2"><span className="h-3.5 w-5 rounded border border-dashed border-white/20" />{t('map.empty')}</li>
                  <li className="flex items-center gap-2"><span className="h-3.5 w-5 rounded bg-brand-primary" />{t('map.selected')}</li>
                  <li className="flex items-center gap-2"><span className="h-3.5 w-5 rounded border border-brand-accent/45 bg-brand-accent/10" />{t('card.stages')}</li>
                </ul>
              </GlassCard>
            )}
            {(stand || activeHall || facilities.length > 0) && (
              <button type="button" onClick={() => select({})} className="w-full rounded-xl border border-white/10 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5">
                {t('map.clear')}
              </button>
            )}
          </aside>
        </div>
      </main>
      <AssistantWidget presetId={presetId} />
    </div>
  );
}
