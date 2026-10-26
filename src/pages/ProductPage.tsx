import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { AssistantWidget } from '@/components/assistant/AssistantWidget';
import { ChatPanel } from '@/components/assistant/ChatPanel';
import { HeroPreview } from '@/components/landing/HeroPreview';
import { RequestDemo } from '@/components/landing/RequestDemo';
import { Footer } from '@/components/layout/Footer';
import { PresetSwitcher } from '@/components/layout/PresetSwitcher';
import { TopBar } from '@/components/layout/TopBar';
import { Icon, type IconName } from '@/components/ui/Icon';
import { DemoBadge } from '@/components/ui/Misc';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { usePreset } from '@/hooks/usePreset';
import { useReveal } from '@/hooks/useReveal';
import { useLang } from '@/i18n/LangProvider';
import type { Lang } from '@/types/event';

type L = [string, string];
const pick = (l: L, lang: Lang) => (lang === 'ar' ? l[1] : l[0]);

const MODES: { icon: IconName; title: L; copy: L; items: L[] }[] = [
  {
    icon: 'users',
    title: ['Visitor Assistant', 'مساعد الزوار'],
    copy: ['Everything a visitor asks at the information desk — answered instantly on their phone.', 'كل ما يسأله الزائر في مكتب المعلومات، بإجابة فورية على هاتفه.'],
    items: [
      ['Programme, sessions and speakers', 'البرنامج والجلسات والمتحدثون'],
      ['Hall locations and facilities', 'مواقع القاعات والخدمات'],
      ['Personal session recommendations', 'توصيات جلسات مخصصة'],
      ['Opening hours and FAQs', 'مواعيد العمل والأسئلة الشائعة'],
    ],
  },
  {
    icon: 'store',
    title: ['Exhibitor Assistant', 'مساعد العارضين'],
    copy: ['Helps buyers find the right companies and products, then sends them to the stand.', 'يساعد المشترين على إيجاد الشركات والمنتجات المناسبة ثم يرشدهم إلى الجناح.'],
    items: [
      ['Search by company, product or category', 'البحث حسب الشركة أو المنتج أو الفئة'],
      ['Rich exhibitor profiles and stand numbers', 'ملفات عارضين غنية وأرقام الأجنحة'],
      ['Highlight the stand on the floorplan', 'إبراز الجناح على المخطط'],
      ['Brochure and enquiry links', 'روابط الكتيبات والاستفسارات'],
    ],
  },
  {
    icon: 'megaphone',
    title: ['Organizer Assistant', 'مساعد المنظم'],
    copy: ['Takes pressure off your team and shows you what visitors really want to know.', 'يخفف الضغط عن فريقك ويُظهر لك ما يريد الزوار معرفته فعلًا.'],
    items: [
      ['Answers common questions 24/7', 'يجيب عن الأسئلة الشائعة على مدار الساعة'],
      ['Surfaces important announcements', 'يُبرز الإعلانات المهمة'],
      ['Popular and unanswered question reports', 'تقارير الأسئلة الأكثر شيوعًا وغير المجابة'],
      ['Support and contact information', 'معلومات الدعم والتواصل'],
    ],
  },
];

const AUDIENCE: { icon: IconName; title: L; copy: L }[] = [
  { icon: 'building', title: ['Event organisers', 'منظمو الفعاليات'], copy: ['Fewer queues at the information desk and a better visitor experience.', 'طوابير أقل عند مكتب المعلومات وتجربة أفضل للزوار.'] },
  { icon: 'sparkles', title: ['Event agencies', 'وكالات الفعاليات'], copy: ['A white-label product you can brand and resell to every client.', 'منتج بعلامة بيضاء يمكنك تخصيصه وبيعه لكل عميل.'] },
  { icon: 'store', title: ['Exhibitors & sponsors', 'العارضون والرعاة'], copy: ['More qualified visitors at the stand, measurable interest in products.', 'زوار مؤهلون أكثر عند الجناح واهتمام قابل للقياس بالمنتجات.'] },
  { icon: 'pin', title: ['Venues', 'أماكن الفعاليات'], copy: ['Facilities, prayer rooms, parking and access — always up to date.', 'الخدمات والمصليات والمواقف والمداخل، محدثة دائمًا.'] },
];

const STEPS: { icon: IconName; title: L; copy: L }[] = [
  { icon: 'upload', title: ['Import your event data', 'استورد بيانات فعاليتك'], copy: ['Exhibitors, sessions, speakers, halls and FAQs from JSON or your existing lists.', 'العارضون والجلسات والمتحدثون والقاعات والأسئلة الشائعة من JSON أو قوائمك الحالية.'] },
  { icon: 'palette', title: ['Brand it', 'أضف هويتك'], copy: ['Logo, colours, assistant name, welcome message and suggested questions.', 'الشعار والألوان واسم المساعد ورسالة الترحيب والأسئلة المقترحة.'] },
  { icon: 'qr', title: ['Go live everywhere', 'انطلق في كل مكان'], copy: ['Website widget, QR codes on signage, event app or a touch-screen kiosk.', 'أداة على الموقع ورموز QR على اللافتات وتطبيق الفعالية أو شاشة استعلام.'] },
  { icon: 'chart', title: ['Learn from every question', 'تعلّم من كل سؤال'], copy: ['See popular and unanswered questions and improve the data during the show.', 'اطّلع على الأسئلة الشائعة وغير المجابة وحسّن البيانات أثناء الفعالية.'] },
];

const FEATURES: { icon: IconName; title: L; copy: L }[] = [
  { icon: 'shield', title: ['Grounded answers only', 'إجابات مستندة إلى البيانات فقط'], copy: ['Every answer comes from your event data. If it isn’t there, the assistant says so instead of guessing.', 'كل إجابة مأخوذة من بيانات فعاليتك، وإن لم تتوفر المعلومة يقول المساعد ذلك بدل التخمين.'] },
  { icon: 'globe', title: ['Native English & Arabic', 'عربي وإنجليزي أصيل'], copy: ['Full RTL layout, Arabic typography and Arabic search — not a bolted-on translation.', 'واجهة كاملة من اليمين لليسار وخطوط عربية وبحث بالعربية، وليست ترجمة مضافة.'] },
  { icon: 'map', title: ['Interactive floorplan', 'مخطط تفاعلي'], copy: ['Tap “Show on map” to highlight any stand, hall or facility. Zoom and pan on mobile.', 'اضغط «عرض على الخريطة» لإبراز أي جناح أو قاعة أو خدمة، مع التكبير والتحريك على الجوال.'] },
  { icon: 'layers', title: ['Rich result cards', 'بطاقات نتائج غنية'], copy: ['Exhibitor, speaker and session cards with stand numbers, times and live status.', 'بطاقات للعارضين والمتحدثين والجلسات مع أرقام الأجنحة والأوقات والحالة المباشرة.'] },
  { icon: 'chat', title: ['Follow-up questions', 'أسئلة المتابعة'], copy: ['“Where is their stand?”, “What about tomorrow?” — the assistant keeps the context.', '«أين جناحهم؟» و«ماذا عن الغد؟»، يحتفظ المساعد بسياق المحادثة.'] },
  { icon: 'chart', title: ['Question analytics', 'تحليلات الأسئلة'], copy: ['Usage, top questions and gaps in your data, in the organiser dashboard.', 'الاستخدام وأكثر الأسئلة شيوعًا والفجوات في بياناتك ضمن لوحة المنظم.'] },
  { icon: 'bolt', title: ['Works without AI keys', 'يعمل دون مفاتيح ذكاء اصطناعي'], copy: ['A fast structured engine answers out of the box. Plug in a secure server-side AI model when you want it.', 'محرك منظم سريع يجيب مباشرة، ويمكن ربط نموذج ذكاء اصطناعي آمن على الخادم عند الحاجة.'] },
  { icon: 'lock', title: ['Privacy by design', 'الخصوصية أولًا'], copy: ['No visitor accounts, redacted question logs and no personal data stored without a purpose.', 'لا حسابات للزوار، وسجلات أسئلة منقّحة، ولا تخزين لبيانات شخصية دون غرض.'] },
];

const FAQ: { q: L; a: L }[] = [
  {
    q: ['Does it need a paid AI model?', 'هل يحتاج إلى نموذج ذكاء اصطناعي مدفوع؟'],
    a: ['No. The built-in engine answers from structured search of your data. An optional server-side AI model can handle free-form questions, with the API key kept on the server.', 'لا. يجيب المحرك المدمج عبر البحث المنظم في بياناتك. ويمكن إضافة نموذج ذكاء اصطناعي اختياري على الخادم للأسئلة الحرة مع إبقاء المفتاح على الخادم.'],
  },
  {
    q: ['Can it make things up?', 'هل يمكن أن يختلق معلومات؟'],
    a: ['The assistant only shows exhibitors, sessions and locations that exist in your dataset. AI answers are checked against the data before any card is shown.', 'يعرض المساعد فقط العارضين والجلسات والمواقع الموجودة في بياناتك، وتُطابق إجابات الذكاء الاصطناعي مع البيانات قبل عرض أي بطاقة.'],
  },
  {
    q: ['How do we load our exhibitors and programme?', 'كيف نحمّل العارضين والبرنامج؟'],
    a: ['Import a JSON file in the dashboard, or edit records directly. Production deployments can sync from your registration or exhibitor portal.', 'استورد ملف JSON من لوحة التحكم أو عدّل السجلات مباشرة. ويمكن في النسخة الإنتاجية المزامنة مع نظام التسجيل أو بوابة العارضين.'],
  },
  {
    q: ['Can our agency resell it under our brand?', 'هل يمكن لوكالتنا بيعه بعلامتنا؟'],
    a: ['Yes. Logo, colours, assistant name, languages, suggested questions and widget placement are all configurable per client.', 'نعم. الشعار والألوان واسم المساعد واللغات والأسئلة المقترحة وموضع الأداة كلها قابلة للتخصيص لكل عميل.'],
  },
];

export default function ProductPage() {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const [presetId, setPreset] = usePreset();
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  useEffect(() => {
    document.title = ar ? 'مساعد الفعاليات الذكي — EventVerse Studio' : 'AI Event Assistant — EventVerse Studio';
  }, [ar]);

  useEffect(() => {
    if (prefersReducedMotion() || !root.current) return;
    const ctx = gsap.context(() => {
      const show = { y: 0, opacity: 1 };
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .fromTo('[data-hero="badge"]', { y: 16, opacity: 0 }, { ...show, duration: 0.6 })
        .fromTo('[data-hero="line"]', { y: 40, opacity: 0 }, { ...show, duration: 0.9, stagger: 0.12 }, '-=0.3')
        .fromTo('[data-hero="copy"]', { y: 20, opacity: 0 }, { ...show, duration: 0.7 }, '-=0.5')
        .fromTo('[data-hero="cta"] > *', { y: 16, opacity: 0 }, { ...show, duration: 0.6, stagger: 0.08 }, '-=0.4')
        .fromTo('[data-hero="preview"]', { y: 50, opacity: 0 }, { ...show, duration: 1 }, 0.2);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root}>
      <TopBar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pb-20 pt-10 sm:pt-16 lg:pb-28">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] max-w-[100vw] -translate-x-1/2 rounded-full bg-brand-primary/10 blur-[120px]" aria-hidden="true" />
          <div className="section relative grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
            <div className="text-center lg:text-start">
              <span data-hero="badge" className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-slate-200">
                <Icon name="sparkles" size={14} className="text-electric-300" />
                {ar ? 'منتج EventVerse Studio الثاني' : 'EventVerse Studio · Product 02'}
              </span>
              <h1 className="mt-6 text-[2.4rem] font-bold leading-[1.08] sm:text-6xl lg:text-[4rem]">
                <span data-hero="line" className="block">{ar ? 'مساعد ذكي' : 'An AI concierge'}</span>
                <span data-hero="line" className="block">
                  {ar ? 'لكل ' : 'for every '}
                  <span className="text-gold animate-shimmer">{ar ? 'زائر.' : 'visitor.'}</span>
                </span>
              </h1>
              <p data-hero="copy" className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg lg:mx-0">
                {ar
                  ? 'مساعد الفعاليات الذكي يجيب الزوار عن العارضين والجلسات والمتحدثين والقاعات والخدمات بالعربية والإنجليزية، اعتمادًا على بيانات فعاليتك فقط.'
                  : 'AI Event Assistant answers visitors’ questions about exhibitors, sessions, speakers, halls and facilities — in English and Arabic, using only your event’s own data.'}
              </p>
              <div data-hero="cta" className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link to={`/demo/ai-event-assistant?preset=${presetId}`} className="bg-brand-gradient inline-flex h-14 items-center gap-2 rounded-full px-7 font-display text-base font-semibold shadow-glow transition hover:brightness-110 sm:text-lg">
                  <Icon name="chat" size={18} /> {ar ? 'جرّب العرض المباشر' : 'Try the live demo'}
                </Link>
                <a href="#request-demo" className="glass inline-flex h-14 items-center gap-2 rounded-full px-7 font-display font-semibold text-white transition hover:bg-white/10">
                  {ar ? 'اطلب عرضًا' : 'Request a demo'} <Icon name="arrowRight" size={18} className="rtl:-scale-x-100" />
                </a>
              </div>
              <dl className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-4 lg:mx-0">
                {[
                  ['EN · AR', ar ? 'لغتان كاملتان' : 'Full bilingual'],
                  ['3', ar ? 'أوضاع للمساعد' : 'Assistant modes'],
                  ['0', ar ? 'مفاتيح مدفوعة مطلوبة' : 'Paid AI keys needed'],
                ].map(([v, l]) => (
                  <div key={l} className="flex flex-col text-center lg:text-start">
                    <dt className="order-2 text-xs text-slate-400">{l}</dt>
                    <dd className="font-display text-2xl font-bold text-white sm:text-3xl" dir="ltr">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div data-hero="preview">
              <HeroPreview />
            </div>
          </div>
        </section>

        {/* What it does */}
        <section className="section py-20" id="what">
          <div data-reveal className="max-w-2xl">
            <p className="eyebrow">{ar ? 'ما الذي يقدمه' : 'What it does'}</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">{ar ? 'ثلاثة مساعدين في محرك واحد' : 'Three assistants, one engine'}</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {MODES.map((m) => (
              <article key={m.title[0]} data-reveal className="glass rounded-3xl p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-primary/15 text-brand-primary">
                  <Icon name={m.icon} size={24} />
                </span>
                <h3 className="mt-5 text-xl font-semibold">{pick(m.title, lang)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{pick(m.copy, lang)}</p>
                <ul className="mt-5 space-y-2.5 text-sm text-slate-200">
                  {m.items.map((i) => (
                    <li key={i[0]} className="flex gap-2.5">
                      <Icon name="check" size={16} className="mt-0.5 shrink-0 text-emerald-300" />
                      {pick(i, lang)}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Who it's for */}
        <section className="section py-20">
          <div data-reveal className="max-w-2xl">
            <p className="eyebrow">{ar ? 'لمن صُمّم' : 'Who it’s for'}</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{ar ? 'لكل من يصنع تجربة الفعالية' : 'For everyone who shapes the event experience'}</h2>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCE.map((a) => (
              <li key={a.title[0]} data-reveal className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <Icon name={a.icon} size={22} className="text-electric-300" />
                <h3 className="mt-4 text-lg font-semibold">{pick(a.title, lang)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{pick(a.copy, lang)}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="section py-20" id="how">
          <div data-reveal className="text-center">
            <p className="eyebrow">{ar ? 'طريقة العمل' : 'How it works'}</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">{ar ? 'من جدول بيانات إلى مساعد مباشر' : 'From spreadsheet to live assistant'}</h2>
          </div>
          <ol className="mt-14 grid gap-8 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title[0]} data-reveal className="relative text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-primary/25 to-brand-accent/20 text-white ring-1 ring-white/15">
                  <Icon name={s.icon} size={26} />
                </span>
                <p className="mt-4 font-mono text-xs text-slate-500">0{i + 1}</p>
                <h3 className="mt-1 text-lg font-semibold">{pick(s.title, lang)}</h3>
                <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-slate-400">{pick(s.copy, lang)}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Features */}
        <section className="section py-20" id="features">
          <div data-reveal className="max-w-2xl">
            <p className="eyebrow">{ar ? 'المزايا والفوائد' : 'Features & benefits'}</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">{ar ? 'منتج تجاري حقيقي، لا مجرد روبوت دردشة' : 'A real event product, not a generic chatbot'}</h2>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <li key={f.title[0]} data-reveal className="glass rounded-3xl p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-400/15 text-gold-300">
                  <Icon name={f.icon} size={20} />
                </span>
                <h3 className="mt-4 text-base font-semibold">{pick(f.title, lang)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{pick(f.copy, lang)}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Customisation + live demo */}
        <section className="section py-20" id="demo">
          <div data-reveal className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-end">
            <div>
              <p className="eyebrow">{ar ? 'التخصيص والعرض المباشر' : 'Customisation · Live demo'}</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">{ar ? 'هوية واحدة لكل عميل' : 'Your client’s brand, every time'}</h2>
              <p className="mt-4 text-slate-300">
                {ar
                  ? 'بدّل بين ثلاث هويات افتراضية تعمل على المحرك نفسه: الشعار والألوان واسم المساعد والبيانات والأسئلة المقترحة وموضع الأداة. جرّب المساعد مباشرة أدناه.'
                  : 'Switch between three fictional client presets running on the same engine — logo, colours, assistant name, dataset, suggested questions and widget placement. Try the assistant right here.'}
              </p>
            </div>
            <PresetSwitcher value={presetId} onChange={setPreset} />
          </div>
          <div data-reveal className="mt-8 h-[680px] max-h-[85dvh]">
            <ChatPanel presetId={presetId} variant="page" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <DemoBadge />
            <Link to={`/demo/ai-event-assistant/map?preset=${presetId}`} className="inline-flex items-center gap-1.5 text-electric-300 hover:underline">
              <Icon name="map" size={16} /> {ar ? 'افتح خريطة الفعالية' : 'Open the event map'}
            </Link>
            <Link to={`/demo/ai-event-assistant/dashboard?preset=${presetId}`} className="inline-flex items-center gap-1.5 text-electric-300 hover:underline">
              <Icon name="chart" size={16} /> {ar ? 'افتح لوحة التحكم' : 'Open the dashboard'}
            </Link>
          </div>
        </section>

        <RequestDemo />

        {/* FAQ */}
        <section className="section pb-24" id="faq">
          <h2 data-reveal className="text-3xl font-bold sm:text-4xl">{ar ? 'أسئلة شائعة' : 'Frequently asked questions'}</h2>
          <div className="mt-8 divide-y divide-white/10 rounded-3xl border border-white/10">
            {FAQ.map((f) => (
              <details key={f.q[0]} data-reveal className="group px-5 py-4 sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-white">
                  {pick(f.q, lang)}
                  <Icon name="plus" size={18} className="shrink-0 transition group-open:rotate-45" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{pick(f.a, lang)}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <AssistantWidget presetId={presetId} />
    </div>
  );
}
