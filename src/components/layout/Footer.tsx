import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { Logo } from '../ui/Brand';

export function Footer() {
  const { lang, t } = useLang();
  const ar = lang === 'ar';
  return (
    <footer className="relative border-t border-white/10 pb-10 pt-14 safe-bottom">
      <div className="section grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            {ar
              ? 'مساعد ذكي ثنائي اللغة للمعارض والمؤتمرات والمهرجانات، يجيب فقط من بيانات الفعالية.'
              : 'A bilingual AI assistant for exhibitions, conferences and festivals that answers only from the event’s own data.'}
          </p>
          <p className="mt-4 text-xs text-slate-500">{t('demo.disclaimer')}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{ar ? 'العرض المباشر' : 'Live demo'}</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link className="hover:text-white" to="/demo/ai-event-assistant?preset=tech">{ar ? 'معرض تقني' : 'Technology exhibition'}</Link></li>
            <li><Link className="hover:text-white" to="/demo/ai-event-assistant?preset=corporate">{ar ? 'مؤتمر مؤسسي' : 'Corporate conference'}</Link></li>
            <li><Link className="hover:text-white" to="/demo/ai-event-assistant?preset=manufacturing">{ar ? 'معرض صناعي' : 'Manufacturing exhibition'}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{ar ? 'المنتج' : 'Product'}</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link className="hover:text-white" to="/demo/ai-event-assistant/map">{t('nav.map')}</Link></li>
            <li><Link className="hover:text-white" to="/demo/ai-event-assistant/dashboard">{t('nav.dashboard')}</Link></li>
            <li><Link className="hover:text-white" to="/solutions/ai-event-assistant#request-demo">{t('nav.requestDemo')}</Link></li>
            <li><a className="hover:text-white" href="https://eventverse-peach.vercel.app/">{ar ? 'ألعاب EventVerse التفاعلية' : 'EventVerse interactive games'}</a></li>
          </ul>
        </div>
      </div>
      <div className="section mt-12">
        <div className="hairline" />
        <p className="mt-6 text-xs text-slate-500">© {new Date().getFullYear()} EventVerse Studio demo.</p>
      </div>
    </footer>
  );
}
