import { useMemo, useState } from 'react';
import { Panel } from '@/components/dashboard/KpiCard';
import { useDashboard } from '@/components/dashboard/useDashboard';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/components/ui/Toast';
import { normalize } from '@/engine/normalize';
import { clearQuestions, readQuestions, type LoggedQuestion } from '@/services/questionLog';
import { sampleAnalytics } from '@/services/sampleAnalytics';
import { SampleTag } from './Overview';

function group(list: LoggedQuestion[]) {
  const map = new Map<string, { q: string; count: number; lang: string; last: number }>();
  for (const x of list) {
    const key = normalize(x.q);
    const cur = map.get(key);
    if (cur) {
      cur.count++;
      cur.last = Math.max(cur.last, x.at);
    } else map.set(key, { q: x.q, count: 1, lang: x.lang, last: x.at });
  }
  return [...map.values()].sort((a, b) => b.count - a.count || b.last - a.last);
}

function csvCell(v: string) {
  // Neutralise spreadsheet formulas and quote everything.
  const safe = /^[=+\-@]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

export default function Questions() {
  const { config, presetId, tr } = useDashboard();
  const toast = useToast();
  const [version, setVersion] = useState(0);
  const local = useMemo(() => readQuestions(presetId), [presetId, version]);
  const popular = group(local).slice(0, 15);
  const unanswered = group(local.filter((q) => !q.answered)).slice(0, 15);
  const sample = useMemo(() => sampleAnalytics(config.data), [config.data]);

  const exportCsv = () => {
    const rows = [['asked_at', 'language', 'mode', 'intent', 'answered', 'question'], ...local.map((q) => [new Date(q.at).toISOString(), q.lang, q.mode, q.intent, String(q.answered), q.q])];
    const blob = new Blob([rows.map((r) => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${config.data.id}-questions.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const List = ({ rows, empty }: { rows: { q: string; count: number }[]; empty: string }) =>
    rows.length ? (
      <ol className="divide-y divide-white/5">
        {rows.map((r, i) => (
          <li key={r.q + i} className="flex items-center justify-between gap-4 py-2.5 text-sm">
            <span className="min-w-0 text-slate-200" dir="auto">
              {r.q}
            </span>
            <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-xs tabular-nums text-slate-300">{r.count}</span>
          </li>
        ))}
      </ol>
    ) : (
      <p className="py-6 text-center text-sm text-slate-500">{empty}</p>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{tr('Visitor questions', 'أسئلة الزوار')}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            {tr(
              'Questions are stored without names or accounts; emails and phone numbers are redacted before saving. Unanswered questions show where the event data needs more detail.',
              'تُحفظ الأسئلة دون أسماء أو حسابات، وتُحجب عناوين البريد وأرقام الهواتف قبل الحفظ. تكشف الأسئلة غير المجابة أين تحتاج بيانات الفعالية إلى تفاصيل أكثر.',
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={exportCsv} disabled={!local.length} icon={<Icon name="download" size={15} />}>
            CSV
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={!local.length}
            onClick={() => {
              if (!window.confirm(tr('Delete the question log for this event in this browser?', 'حذف سجل الأسئلة لهذه الفعالية في هذا المتصفح؟'))) return;
              clearQuestions(presetId);
              setVersion((v) => v + 1);
              toast(tr('Question log cleared', 'تم مسح سجل الأسئلة'));
            }}
            icon={<Icon name="trash" size={15} />}
          >
            {tr('Clear', 'مسح')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={tr('Popular questions — this browser', 'الأسئلة الشائعة — هذا المتصفح')}>
          <List rows={popular} empty={tr('Ask the assistant a few questions to see them here.', 'اطرح بعض الأسئلة على المساعد لتظهر هنا.')} />
        </Panel>
        <Panel title={tr('Unanswered questions — this browser', 'أسئلة غير مجابة — هذا المتصفح')}>
          <List rows={unanswered} empty={tr('No unanswered questions yet.', 'لا توجد أسئلة غير مجابة بعد.')} />
        </Panel>
        <Panel title={tr('Popular questions — example event', 'الأسئلة الشائعة — فعالية نموذجية')} action={<SampleTag />}>
          <List rows={sample.popular} empty="" />
        </Panel>
        <Panel title={tr('Unanswered questions — example event', 'أسئلة غير مجابة — فعالية نموذجية')} action={<SampleTag />}>
          <List rows={sample.unanswered} empty="" />
          <p className="mt-3 text-xs text-slate-500">{tr('Tip: add an FAQ for each of these to close the gap.', 'نصيحة: أضف سؤالًا شائعًا لكل منها لسد الفجوة.')}</p>
        </Panel>
      </div>
    </div>
  );
}
