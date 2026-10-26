import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { DFIE_DATASET } from '@/data/dfie';
import { answer } from '@/engine/respond';
import { loc } from '@/engine/text';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { useLang } from '@/i18n/LangProvider';
import { LOGOS } from '@/config/logos';
import { Icon } from '../ui/Icon';

/**
 * Looping hero animation. The answer shown is computed by the real engine on the
 * demo dataset, so the preview never claims more than the product does.
 */
export function HeroPreview() {
  const { lang } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const q = lang === 'ar' ? 'أين الجناح H2-15؟' : 'Where is stand H2-15?';
  const reply = useMemo(() => answer(q, { data: DFIE_DATASET, settings: { demoClock: { dayIndex: 0, time: '11:30' }, logQuestions: false }, mode: 'visitor', uiLang: lang }), [q, lang]);
  const ex = DFIE_DATASET.exhibitors.find((e) => e.stand === 'H2-15');
  const hall = DFIE_DATASET.halls.find((h) => h.id === ex?.hallId);
  const text = reply.blocks.find((b) => b.kind === 'text');
  const sentence = text && text.kind === 'text' ? text.text.split('. ')[0] + '.' : '';

  useEffect(() => {
    if (!root.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.5, defaults: { ease: 'power3.out' } });
      tl.set(['[data-p="q"]', '[data-p="typing"]', '[data-p="a"]', '[data-p="card"]', '[data-p="chips"] > *'], { opacity: 0, y: 12 })
        .to('[data-p="q"]', { opacity: 1, y: 0, duration: 0.5 }, 0.4)
        .to('[data-p="typing"]', { opacity: 1, y: 0, duration: 0.3 }, 1.0)
        .to('[data-p="typing"]', { opacity: 0, duration: 0.2 }, 2.1)
        .to('[data-p="a"]', { opacity: 1, y: 0, duration: 0.5 }, 2.2)
        .to('[data-p="card"]', { opacity: 1, y: 0, duration: 0.6 }, 2.5)
        .to('[data-p="chips"] > *', { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, 3.0)
        .to({}, { duration: 4 });
    }, root);
    return () => ctx.revert();
  }, [lang]);

  return (
    <div ref={root} className="glass-strong relative mx-auto w-full max-w-md rounded-[2rem] p-4 sm:p-5" style={{ ['--brand-primary' as string]: '56 189 248', ['--brand-accent' as string]: '167 139 250' }}>
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <img src={LOGOS.tech} alt="" width={40} height={40} className="rounded-xl ring-1 ring-white/15" />
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-white">{lang === 'ar' ? 'نوفا' : 'Nova'}</p>
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {loc(DFIE_DATASET.info.name, lang)}
          </p>
        </div>
        <span className="rounded-full bg-gold-400/15 px-2 py-0.5 text-[10px] font-semibold text-gold-300">{lang === 'ar' ? 'تجريبي' : 'DEMO'}</span>
      </div>

      <div className="mt-4 space-y-3" aria-hidden="true">
        <div data-p="q" className="flex justify-end">
          <p className="rounded-2xl rounded-ee-md bg-brand-primary px-4 py-2 text-sm font-medium text-midnight-950">{q}</p>
        </div>
        <div data-p="typing" className="flex">
          <div className="flex gap-1.5 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-2 w-2 animate-typing rounded-full bg-brand-primary" style={{ animationDelay: `${i * 0.16}s` }} />
            ))}
          </div>
        </div>
        <div data-p="a" className="rounded-2xl rounded-ss-md border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-relaxed text-slate-100">
          {sentence}
        </div>
        {ex && (
          <div data-p="card" className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display font-semibold text-white">{ex.name}</p>
                <p className="text-xs text-slate-400">
                  {loc(hall?.name, lang)} · {loc(hall?.theme, lang)}
                </p>
              </div>
              <span className="rounded-lg bg-brand-primary/15 px-2 py-1 font-mono text-xs font-bold text-brand-primary" dir="ltr">
                {ex.stand}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-slate-300">{loc(ex.description, lang)}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-primary/15 px-3 py-1.5 text-xs font-semibold text-brand-primary ring-1 ring-brand-primary/30">
              <Icon name="pin" size={13} /> {lang === 'ar' ? 'عرض على الخريطة' : 'Show on map'}
            </span>
          </div>
        )}
        <div data-p="chips" className="flex flex-wrap gap-2">
          {reply.suggestions.slice(0, 2).map((s) => (
            <span key={s} className="rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1.5 text-xs text-white">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
