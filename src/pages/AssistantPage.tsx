import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChatPanel } from '@/components/assistant/ChatPanel';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { PresetSwitcher } from '@/components/layout/PresetSwitcher';
import { TopBar } from '@/components/layout/TopBar';
import { Icon } from '@/components/ui/Icon';
import { DemoBadge, GlassCard } from '@/components/ui/Misc';
import { eventClock, formatDate, formatTime } from '@/engine/clock';
import { loc } from '@/engine/text';
import { usePreset } from '@/hooks/usePreset';
import { useLang } from '@/i18n/LangProvider';
import { themeVars } from '@/services/color';
import { useConfig } from '@/services/configStore';
import { env } from '@/config/env';

/** Full-page assistant, as it would run on a kiosk or the event app. */
export default function AssistantPage() {
  const [presetId, setPreset] = usePreset();
  const config = useConfig(presetId);
  const { lang } = useLang();
  const ar = lang === 'ar';
  const { data, settings } = config;
  const clock = eventClock(data, settings);
  const first = data.info.days[0];
  const last = data.info.days[data.info.days.length - 1];
  const important = data.announcements.filter((a) => a.priority === 'important');

  useEffect(() => {
    document.title = `${loc(config.branding.assistantName, lang)} · ${loc(data.info.name, lang)}`;
  }, [config.branding.assistantName, data.info.name, lang]);

  return (
    <div className="min-h-[100dvh]" style={themeVars(config.branding.primary, config.branding.accent) as React.CSSProperties}>
      <DemoBanner />
      <TopBar preserveQuery={`?preset=${presetId}`} />
      <main className="section pb-16 pt-4">
        <PresetSwitcher value={presetId} onChange={setPreset} />
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="h-[calc(100dvh-13rem)] min-h-[560px]">
            <ChatPanel presetId={presetId} variant="page" />
          </div>

          <aside className="space-y-4">
            <GlassCard className="p-5">
              <DemoBadge />
              <h1 className="mt-3 text-xl font-bold leading-tight">{loc(data.info.name, lang)}</h1>
              <p className="mt-1.5 text-sm text-slate-300">{loc(data.info.tagline, lang)}</p>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex gap-2.5">
                  <dt className="sr-only">{ar ? 'التواريخ' : 'Dates'}</dt>
                  <Icon name="calendar" size={17} className="mt-0.5 shrink-0 text-brand-primary" />
                  <dd className="text-slate-200">
                    {formatDate(first.date, lang, false)} – {formatDate(last.date, lang, false)}
                  </dd>
                </div>
                <div className="flex gap-2.5">
                  <dt className="sr-only">{ar ? 'المكان' : 'Venue'}</dt>
                  <Icon name="pin" size={17} className="mt-0.5 shrink-0 text-brand-primary" />
                  <dd className="text-slate-200">
                    {loc(data.info.venue, lang)}, {loc(data.info.city, lang)}
                  </dd>
                </div>
                <div className="flex gap-2.5">
                  <dt className="sr-only">{ar ? 'ساعة العرض' : 'Demo clock'}</dt>
                  <Icon name="clock" size={17} className="mt-0.5 shrink-0 text-brand-primary" />
                  <dd className="text-slate-200">
                    {clock.simulated ? (ar ? 'ساعة العرض التجريبي: ' : 'Demo clock: ') : ''}
                    {loc(data.info.days[clock.dayIndex]?.label, lang)}, {formatTime(clock.time, lang)}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                {[
                  [data.exhibitors.length, ar ? 'عارض' : 'Exhibitors'],
                  [data.speakers.length, ar ? 'متحدث' : 'Speakers'],
                  [data.sessions.length, ar ? 'جلسة' : 'Sessions'],
                ].map(([n, label]) => (
                  <div key={String(label)} className="rounded-xl bg-white/5 py-2.5">
                    <p className="font-display text-xl font-bold text-white">{n}</p>
                    <p className="text-[11px] text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {important.length > 0 && (
              <GlassCard className="p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Icon name="megaphone" size={16} className="text-gold-300" /> {ar ? 'إعلانات مهمة' : 'Important announcements'}
                </h2>
                <ul className="mt-3 space-y-3">
                  {important.map((a) => (
                    <li key={a.id} className="text-sm">
                      <p className="font-medium text-white">{loc(a.title, lang)}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{loc(a.body, lang)}</p>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            <GlassCard className="p-5">
              <h2 className="text-sm font-semibold">{ar ? 'جرّب أيضًا' : 'Also try'}</h2>
              <div className="mt-3 grid gap-2">
                <Link to={`/demo/ai-event-assistant/map?preset=${presetId}`} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10">
                  <Icon name="map" size={18} className="text-brand-accent" /> {ar ? 'خريطة الفعالية التفاعلية' : 'Interactive event map'}
                </Link>
                <Link to={`/demo/ai-event-assistant/dashboard?preset=${presetId}`} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10">
                  <Icon name="chart" size={18} className="text-brand-accent" /> {ar ? 'لوحة تحكم المنظم' : 'Organiser dashboard'}
                </Link>
              </div>
              <p className="mt-4 flex gap-2 text-[11px] leading-relaxed text-slate-500">
                <Icon name="shield" size={14} className="mt-px shrink-0" />
                {env.aiEnabled
                  ? ar
                    ? 'يجيب المحرك المنظم أولًا، ويُستخدم الذكاء الاصطناعي على الخادم فقط للأسئلة غير المغطاة، مع الالتزام ببيانات الفعالية.'
                    : 'The structured engine answers first; server-side AI is used only for questions it cannot cover, grounded in the event data.'
                  : ar
                    ? 'يعمل هذا العرض دون مفاتيح ذكاء اصطناعي مدفوعة: كل إجابة مبنية على البحث المنظم في بيانات الفعالية.'
                    : 'This demo runs without paid AI keys: every answer comes from a structured search of the event data.'}
              </p>
            </GlassCard>
          </aside>
        </div>
      </main>
    </div>
  );
}
