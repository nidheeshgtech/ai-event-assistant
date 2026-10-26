import { lazy, Suspense, useEffect } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { useDashboard } from '@/components/dashboard/useDashboard';
import { PresetSwitcher } from '@/components/layout/PresetSwitcher';
import { LangToggle } from '@/components/layout/TopBar';
import { Logo } from '@/components/ui/Brand';
import { Icon, type IconName } from '@/components/ui/Icon';
import { GlassCard, PageLoader } from '@/components/ui/Misc';
import { env } from '@/config/env';
import { themeVars } from '@/services/color';

const Overview = lazy(() => import('./Overview'));
const EventProfile = lazy(() => import('./EventProfile'));
const Branding = lazy(() => import('./Branding'));
const Collections = lazy(() => import('./Collections'));
const Settings = lazy(() => import('./Settings'));
const Questions = lazy(() => import('./Questions'));
const DataIO = lazy(() => import('./DataIO'));

const BASE = '/demo/ai-event-assistant/dashboard';

const NAV: { to: string; en: string; ar: string; icon: IconName; end?: boolean }[] = [
  { to: '', en: 'Overview', ar: 'نظرة عامة', icon: 'chart', end: true },
  { to: 'questions', en: 'Questions', ar: 'الأسئلة', icon: 'chat' },
  { to: 'event', en: 'Event profile', ar: 'ملف الفعالية', icon: 'calendar' },
  { to: 'branding', en: 'Branding & languages', ar: 'الهوية واللغات', icon: 'palette' },
  { to: 'exhibitors', en: 'Exhibitors', ar: 'العارضون', icon: 'store' },
  { to: 'speakers', en: 'Speakers', ar: 'المتحدثون', icon: 'users' },
  { to: 'sessions', en: 'Sessions', ar: 'الجلسات', icon: 'clock' },
  { to: 'faqs', en: 'FAQs', ar: 'الأسئلة الشائعة', icon: 'info' },
  { to: 'announcements', en: 'Announcements', ar: 'الإعلانات', icon: 'megaphone' },
  { to: 'settings', en: 'Assistant settings', ar: 'إعدادات المساعد', icon: 'settings' },
  { to: 'data', en: 'Import / export', ar: 'استيراد / تصدير', icon: 'database' },
];

/**
 * Demo: open to everyone, edits stay in this browser.
 * Production builds set VITE_ADMIN_AUTH=required and must sit behind real authentication
 * (see README) — this screen then refuses to render the editor client-side.
 */
function AdminGate({ children }: { children: React.ReactNode }) {
  const { tr } = useDashboard();
  if (env.adminAuthRequired) {
    return (
      <div className="grid min-h-[100dvh] place-items-center p-6">
        <GlassCard className="max-w-md p-7 text-center">
          <Icon name="lock" size={28} className="mx-auto text-gold-300" />
          <h1 className="mt-4 text-xl font-bold">{tr('Sign-in required', 'يلزم تسجيل الدخول')}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {tr(
              'This deployment requires an authenticated organiser account. Connect the admin API and identity provider described in the README to enable the dashboard.',
              'يتطلب هذا الإصدار حساب منظم موثقًا. اربط واجهة الإدارة ومزود الهوية الموضحين في ملف README لتفعيل لوحة التحكم.',
            )}
          </p>
          <Link to="/solutions/ai-event-assistant" className="mt-6 inline-block text-sm text-electric-300 hover:underline">
            {tr('Back to product page', 'العودة إلى صفحة المنتج')}
          </Link>
        </GlassCard>
      </div>
    );
  }
  return <>{children}</>;
}

export default function DashboardLayout() {
  const { presetId, setPreset, config, tr } = useDashboard();
  const { pathname } = useLocation();
  const q = `?preset=${presetId}`;

  useEffect(() => {
    document.title = `${tr('Dashboard', 'لوحة التحكم')} · AI Event Assistant`;
  }, [tr]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`;

  const nav = (mobile: boolean) =>
    NAV.map((n) => (
      <NavLink key={n.to} to={`${BASE}${n.to ? `/${n.to}` : ''}${q}`} end={n.end} className={linkClass}>
        <Icon name={n.icon} size={mobile ? 16 : 18} />
        {tr(n.en, n.ar)}
      </NavLink>
    ));

  return (
    <AdminGate>
      <div className="min-h-[100dvh] lg:grid lg:grid-cols-[256px_1fr]" style={themeVars(config.branding.primary, config.branding.accent) as React.CSSProperties}>
        <aside className="sticky top-0 hidden h-[100dvh] flex-col overflow-y-auto border-e border-white/10 bg-midnight-950/60 p-5 backdrop-blur-xl lg:flex">
          <Logo />
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 rtl:tracking-normal">AI Event Assistant</p>
          <nav className="mt-8 flex flex-col gap-1" aria-label={tr('Dashboard', 'لوحة التحكم')}>
            {nav(false)}
          </nav>
          <div className="mt-auto space-y-3 pt-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs">
              <p className="flex items-center gap-2 font-semibold text-white">
                <span className="h-2 w-2 rounded-full bg-gold-400" />
                {tr('Local demo mode', 'وضع العرض المحلي')}
              </p>
              <p className="mt-1 text-slate-400">{tr('Edits are saved in this browser only.', 'تُحفظ التعديلات في هذا المتصفح فقط.')}</p>
            </div>
            <Link to={`/demo/ai-event-assistant${q}`} className="flex items-center gap-2 px-1 text-xs text-slate-400 hover:text-white">
              <Icon name="arrowLeft" size={14} className="rtl:-scale-x-100" /> {tr('Back to assistant', 'العودة إلى المساعد')}
            </Link>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-midnight-950/80 backdrop-blur-xl safe-top">
            <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-8">
              <div className="lg:hidden">
                <Logo />
              </div>
              <p className="hidden truncate text-sm text-slate-400 lg:block">{tr('Organiser dashboard', 'لوحة تحكم المنظم')}</p>
              <div className="flex items-center gap-2">
                <LangToggle />
                <Link to={`/demo/ai-event-assistant${q}`} className="hidden h-9 items-center gap-1.5 rounded-full px-3 text-sm text-slate-200 ring-1 ring-white/15 hover:bg-white/10 sm:inline-flex">
                  <Icon name="chat" size={15} /> {tr('Open assistant', 'افتح المساعد')}
                </Link>
              </div>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden" aria-label={tr('Dashboard', 'لوحة التحكم')}>
              {nav(true)}
            </nav>
          </header>

          <div className="border-b border-gold-400/20 bg-gold-400/10 px-4 py-2.5 text-center text-xs text-gold-300 sm:px-8" role="note">
            <strong className="font-semibold">{tr('Demo mode.', 'وضع العرض.')}</strong>{' '}
            {tr(
              'Analytics marked SAMPLE are illustrative. Event data is fictional. Changes are stored only in this browser; production requires authenticated admin access.',
              'التحليلات المعلّمة بـ«عينة» توضيحية، وبيانات الفعالية افتراضية. تُخزَّن التغييرات في هذا المتصفح فقط، وتتطلب النسخة الإنتاجية دخولًا إداريًا موثقًا.',
            )}
          </div>

          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8">
            <PresetSwitcher value={presetId} onChange={setPreset} />
            <div className="mt-6" key={`${presetId}-${pathname}`}>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route index element={<Overview />} />
                  <Route path="questions" element={<Questions />} />
                  <Route path="event" element={<EventProfile />} />
                  <Route path="branding" element={<Branding />} />
                  <Route path="exhibitors" element={<Collections kind="exhibitors" />} />
                  <Route path="speakers" element={<Collections kind="speakers" />} />
                  <Route path="sessions" element={<Collections kind="sessions" />} />
                  <Route path="faqs" element={<Collections kind="faqs" />} />
                  <Route path="announcements" element={<Collections kind="announcements" />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="data" element={<DataIO />} />
                </Routes>
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </AdminGate>
  );
}
