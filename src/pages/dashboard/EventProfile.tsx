import { useState } from 'react';
import { Panel } from '@/components/dashboard/KpiCard';
import { useDashboard } from '@/components/dashboard/useDashboard';
import { Button } from '@/components/ui/Button';
import { TextArea, TextField } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { configStore } from '@/services/configStore';
import { validateDataset } from '@/services/datasetValidation';
import { isEmail } from '@/services/validation';
import type { EventDataset, EventInfo, Hall, Localized } from '@/types/event';

/** Two inputs (English + Arabic) for one localized value. */
export function LocInput({ label, value, onChange, area = false, max = 200 }: { label: string; value: Localized; onChange: (v: Localized) => void; area?: boolean; max?: number }) {
  const Comp = area ? TextArea : TextField;
  return (
    <fieldset className="grid gap-3 sm:grid-cols-2">
      <legend className="mb-1.5 text-sm font-medium text-slate-200">{label}</legend>
      <Comp label="English" lang="en" dir="ltr" value={value.en} maxLength={max} onChange={(e: { target: { value: string } }) => onChange({ ...value, en: e.target.value })} />
      <Comp label="العربية" lang="ar" dir="rtl" value={value.ar} maxLength={max} onChange={(e: { target: { value: string } }) => onChange({ ...value, ar: e.target.value })} />
    </fieldset>
  );
}

export default function EventProfile() {
  const { config, presetId, tr } = useDashboard();
  const toast = useToast();
  const [info, setInfo] = useState<EventInfo>(structuredClone(config.data.info));
  const [halls, setHalls] = useState<Hall[]>(structuredClone(config.data.halls));
  const [errors, setErrors] = useState<string[]>([]);

  const setI = <K extends keyof EventInfo>(k: K, v: EventInfo[K]) => setInfo((x) => ({ ...x, [k]: v }));
  const setDay = (i: number, k: 'open' | 'close' | 'date', v: string) => setInfo((x) => ({ ...x, days: x.days.map((d, j) => (j === i ? { ...d, [k]: v } : d)) }));
  const setHall = (i: number, k: 'theme' | 'description' | 'access', v: Localized) => setHalls((hs) => hs.map((h, j) => (j === i ? { ...h, [k]: v } : h)));

  const save = () => {
    const next: EventDataset = { ...config.data, info, halls };
    const problems = validateDataset(next);
    if (!isEmail(info.contactEmail)) problems.unshift(tr('Contact email is not valid.', 'بريد التواصل غير صالح.'));
    setErrors(problems);
    if (problems.length) return;
    configStore.saveDataset(presetId, next);
    toast(tr('Event profile saved', 'تم حفظ ملف الفعالية'));
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold sm:text-3xl">{tr('Event profile', 'ملف الفعالية')}</h1>
      <Panel title={tr('Basics', 'المعلومات الأساسية')}>
        <div className="space-y-4">
          <LocInput label={tr('Event name', 'اسم الفعالية')} value={info.name} onChange={(v) => setI('name', v)} />
          <LocInput label={tr('Tagline', 'الشعار النصي')} value={info.tagline} onChange={(v) => setI('tagline', v)} />
          <LocInput label={tr('Venue', 'المكان')} value={info.venue} onChange={(v) => setI('venue', v)} />
          <LocInput label={tr('City', 'المدينة')} value={info.city} onChange={(v) => setI('city', v)} />
          <LocInput label={tr('Admission & registration', 'الدخول والتسجيل')} value={info.admission} onChange={(v) => setI('admission', v)} area max={600} />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label={tr('Contact email', 'بريد التواصل')} type="email" dir="ltr" value={info.contactEmail} onChange={(e) => setI('contactEmail', e.target.value)} maxLength={254} />
            <TextField label={tr('Contact phone', 'هاتف التواصل')} dir="ltr" value={info.contactPhone ?? ''} onChange={(e) => setI('contactPhone', e.target.value)} maxLength={40} />
          </div>
        </div>
      </Panel>

      <Panel title={tr('Days & opening hours', 'الأيام ومواعيد العمل')}>
        <div className="space-y-3">
          {info.days.map((d, i) => (
            <div key={i} className="grid grid-cols-3 gap-3">
              <TextField label={`${d.label?.en ?? `Day ${i + 1}`} · ${tr('date', 'التاريخ')}`} type="date" dir="ltr" value={d.date} onChange={(e) => setDay(i, 'date', e.target.value)} />
              <TextField label={tr('Opens', 'يفتح')} dir="ltr" inputMode="numeric" value={d.open} onChange={(e) => setDay(i, 'open', e.target.value)} maxLength={5} />
              <TextField label={tr('Closes', 'يغلق')} dir="ltr" inputMode="numeric" value={d.close} onChange={(e) => setDay(i, 'close', e.target.value)} maxLength={5} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title={tr('Halls', 'القاعات')}>
        <div className="space-y-6">
          {halls.map((h, i) => (
            <div key={h.id} className="space-y-3 rounded-2xl border border-white/10 p-4">
              <p className="font-semibold text-white">{h.name.en} · {h.name.ar}</p>
              <LocInput label={tr('Theme', 'الموضوع')} value={h.theme} onChange={(v) => setHall(i, 'theme', v)} />
              <LocInput label={tr('Description', 'الوصف')} value={h.description} onChange={(v) => setHall(i, 'description', v)} area max={600} />
              <LocInput label={tr('How to reach it (no walking routes)', 'كيفية الوصول (دون مسارات مشي)')} value={h.access} onChange={(v) => setHall(i, 'access', v)} area max={400} />
            </div>
          ))}
        </div>
      </Panel>

      <div className="sticky bottom-0 -mx-4 border-t border-white/10 bg-midnight-950/90 px-4 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
        {errors.length > 0 && (
          <ul className="mb-2 list-disc ps-5 text-xs text-rose-300" role="alert">
            {errors.slice(0, 5).map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        <Button onClick={save}>{tr('Save event profile', 'حفظ ملف الفعالية')}</Button>
      </div>
    </div>
  );
}
