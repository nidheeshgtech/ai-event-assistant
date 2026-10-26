import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { KpiCard, Panel } from '@/components/dashboard/KpiCard';
import { useDashboard } from '@/components/dashboard/useDashboard';
import { Badge } from '@/components/ui/Misc';
import { readQuestions } from '@/services/questionLog';
import { sampleAnalytics } from '@/services/sampleAnalytics';

const C = { primary: 'rgb(var(--brand-primary))', accent: 'rgb(var(--brand-accent))', grid: 'rgba(255,255,255,0.06)', axis: '#8a8a93' };
const tooltip = {
  contentStyle: { background: 'rgba(17,17,19,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff', fontSize: 12 },
  labelStyle: { color: '#cbd5e1' },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
};
const axis = { stroke: C.axis, fontSize: 11, tickLine: false, axisLine: false };

export function SampleTag() {
  const { tr } = useDashboard();
  return <Badge tone="gold">{tr('Sample data', 'بيانات عينة')}</Badge>;
}

export default function Overview() {
  const { config, presetId, tr, lang } = useDashboard();
  const s = useMemo(() => sampleAnalytics(config.data), [config.data]);
  const local = readQuestions(presetId);
  const localAnswered = local.filter((q) => q.answered).length;
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  const nf = (n: number) => n.toLocaleString(lang === 'ar' ? 'ar-AE' : 'en-GB', { numberingSystem: 'latn' } as Intl.NumberFormatOptions);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{tr('Chat usage analytics', 'تحليلات استخدام المحادثة')}</h1>
          <p className="mt-1 text-sm text-slate-400">{config.data.info.name[lang]}</p>
        </div>
        <SampleTag />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label={tr('Conversations (sample)', 'المحادثات (عينة)')} value={nf(s.conversations)} icon="chat" tone="blue" />
        <KpiCard label={tr('Questions (sample)', 'الأسئلة (عينة)')} value={nf(s.questions)} icon="sparkles" tone="purple" />
        <KpiCard label={tr('Answered from data (sample)', 'أُجيب من البيانات (عينة)')} value={pct(s.answerRate)} icon="check" tone="green" />
        <KpiCard label={tr('Asked in Arabic (sample)', 'بالعربية (عينة)')} value={pct(s.arabicShare)} icon="globe" tone="gold" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={tr('Questions per day', 'الأسئلة يوميًا')} action={<SampleTag />}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={s.daily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="day" {...axis} />
              <YAxis {...axis} width={44} />
              <Tooltip {...tooltip} />
              <Bar dataKey="questions" name={tr('Questions', 'الأسئلة')} fill={C.primary} radius={[8, 8, 0, 0]} />
              <Bar dataKey="conversations" name={tr('Conversations', 'المحادثات')} fill={C.accent} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title={tr('Busiest hours (average day)', 'أوقات الذروة (يوم متوسط)')} action={<SampleTag />}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={s.hourly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fill-h" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.accent} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="hour" {...axis} />
              <YAxis {...axis} width={44} />
              <Tooltip {...tooltip} />
              <Area type="monotone" dataKey="questions" name={tr('Questions', 'الأسئلة')} stroke={C.accent} strokeWidth={2} fill="url(#fill-h)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title={tr('By assistant mode', 'حسب وضع المساعد')} action={<SampleTag />}>
          <Bars rows={s.modes.map((m) => ({ label: m.name, value: m.value }))} />
        </Panel>
        <Panel title={tr('Top topics', 'أبرز المواضيع')} action={<SampleTag />}>
          <Bars rows={s.topics.map((m) => ({ label: m.name, value: m.value }))} />
        </Panel>
        <Panel title={tr('Your test questions', 'أسئلتك التجريبية')}>
          <p className="text-sm text-slate-400">{tr('Real questions asked in this browser (redacted, stored locally).', 'أسئلة حقيقية طُرحت في هذا المتصفح (منقّحة ومحفوظة محليًا).')}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 p-3">
              <dt className="text-xs text-slate-400">{tr('Asked', 'المطروحة')}</dt>
              <dd className="font-display text-2xl font-bold">{local.length}</dd>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <dt className="text-xs text-slate-400">{tr('Answered', 'المُجابة')}</dt>
              <dd className="font-display text-2xl font-bold">{local.length ? pct(localAnswered / local.length) : '—'}</dd>
            </div>
          </dl>
          <Link to={`/demo/ai-event-assistant/dashboard/questions?preset=${presetId}`} className="mt-4 inline-block text-sm text-electric-300 hover:underline">
            {tr('See popular and unanswered questions →', 'عرض الأسئلة الشائعة وغير المجابة ←')}
          </Link>
        </Panel>
      </div>
    </div>
  );
}

function Bars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-slate-200">{r.label}</span>
            <span className="tabular-nums text-slate-400">{r.value.toLocaleString('en-GB')}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
