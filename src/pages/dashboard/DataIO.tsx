import { useState, type ChangeEvent } from 'react';
import { Panel } from '@/components/dashboard/KpiCard';
import { useDashboard } from '@/components/dashboard/useDashboard';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/components/ui/Toast';
import { configStore } from '@/services/configStore';
import { validateDataset } from '@/services/datasetValidation';
import type { EventDataset } from '@/types/event';

const MAX_IMPORT_BYTES = 2_000_000;

export default function DataIO() {
  const { config, presetId, tr } = useDashboard();
  const toast = useToast();
  const [errors, setErrors] = useState<string[]>([]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(config.data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${config.data.id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) return setErrors([tr('File is larger than 2 MB.', 'حجم الملف أكبر من 2 ميغابايت.')]);
    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      return setErrors([tr('This is not valid JSON.', 'هذا ليس ملف JSON صالحًا.')]);
    }
    const problems = validateDataset(parsed);
    setErrors(problems);
    if (problems.length) return;
    configStore.saveDataset(presetId, parsed as EventDataset);
    toast(tr('Dataset imported — the assistant now uses it', 'تم استيراد البيانات — يستخدمها المساعد الآن'));
  };

  const counts = (['exhibitors', 'speakers', 'sessions', 'halls', 'facilities', 'faqs', 'announcements'] as const).map((k) => [k, config.data[k].length] as const);

  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold sm:text-3xl">{tr('Data import / export', 'استيراد / تصدير البيانات')}</h1>
      <Panel title={tr('Current dataset', 'البيانات الحالية')}>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {counts.map(([k, n]) => (
            <div key={k} className="rounded-xl bg-white/5 px-3 py-2">
              <dt className="text-xs capitalize text-slate-400">{k}</dt>
              <dd className="font-display text-xl font-bold">{n}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-slate-500">
          {config.customData ? tr('Using an edited copy saved in this browser.', 'تُستخدم نسخة معدّلة محفوظة في هذا المتصفح.') : tr('Using the built-in demo dataset.', 'تُستخدم بيانات العرض المدمجة.')}
        </p>
      </Panel>

      <Panel title={tr('Export', 'تصدير')}>
        <p className="mb-4 text-sm text-slate-400">{tr('Download the full dataset as JSON — a template for your next event.', 'نزّل البيانات كاملة بصيغة JSON لتكون قالبًا لفعاليتك القادمة.')}</p>
        <Button variant="secondary" onClick={exportJson} icon={<Icon name="download" size={16} />}>
          {tr('Export JSON', 'تصدير JSON')}
        </Button>
      </Panel>

      <Panel title={tr('Import', 'استيراد')}>
        <p className="mb-4 text-sm text-slate-400">
          {tr(
            'Upload a JSON file in the same format. It is validated first: ids, stand numbers, halls, days, times, speakers and overlapping sessions are all checked before anything changes.',
            'ارفع ملف JSON بالصيغة نفسها. يُتحقق منه أولًا: المعرفات وأرقام الأجنحة والقاعات والأيام والأوقات والمتحدثون والجلسات المتداخلة قبل أي تغيير.',
          )}
        </p>
        <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/15">
          <Icon name="upload" size={16} />
          {tr('Choose JSON file', 'اختر ملف JSON')}
          <input type="file" accept="application/json,.json" className="sr-only" onChange={importJson} />
        </label>
        {errors.length > 0 && (
          <ul className="mt-4 list-disc space-y-1 ps-5 text-sm text-rose-300" role="alert">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title={tr('Reset', 'إعادة الضبط')}>
        <Button
          variant="danger"
          disabled={!config.customData}
          onClick={() => {
            if (!window.confirm(tr('Discard local edits and restore the built-in dataset?', 'تجاهل التعديلات المحلية واستعادة البيانات المدمجة؟'))) return;
            configStore.resetDataset(presetId);
            toast(tr('Built-in dataset restored', 'تمت استعادة البيانات المدمجة'));
          }}
          icon={<Icon name="restart" size={16} />}
        >
          {tr('Restore built-in data', 'استعادة البيانات المدمجة')}
        </Button>
      </Panel>
    </div>
  );
}
