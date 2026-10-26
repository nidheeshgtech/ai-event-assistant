import { useState } from 'react';
import { Panel } from '@/components/dashboard/KpiCard';
import { useDashboard } from '@/components/dashboard/useDashboard';
import { Button } from '@/components/ui/Button';
import { SelectField, TextField, Toggle } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/components/ui/Toast';
import { env } from '@/config/env';
import { configStore } from '@/services/configStore';
import type { AssistantSettings } from '@/types/assistant';

export default function Settings() {
  const { config, presetId, tr, lang } = useDashboard();
  const toast = useToast();
  const [s, setS] = useState<AssistantSettings>(structuredClone(config.settings));
  const [error, setError] = useState('');

  const save = () => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.demoClock.time)) return setError(tr('Time must be HH:MM.', 'يجب أن يكون الوقت بصيغة HH:MM.'));
    setError('');
    configStore.saveSettings(presetId, s);
    toast(tr('Settings saved', 'تم حفظ الإعدادات'));
  };

  const aiState = !env.aiEnabled
    ? tr('Off — answers come from the structured engine only. Set VITE_AI_ENDPOINT and ANTHROPIC_API_KEY on the server to enable.', 'متوقف — الإجابات من المحرك المنظم فقط. اضبط VITE_AI_ENDPOINT و ANTHROPIC_API_KEY على الخادم للتفعيل.')
    : config.customData
      ? tr('Configured, but paused for this preset: the AI backend only knows the published dataset, and this browser has local edits.', 'مُعدّ لكنه متوقف لهذه الهوية: خادم الذكاء الاصطناعي يعرف البيانات المنشورة فقط، وهذا المتصفح يحتوي تعديلات محلية.')
      : tr('On — the engine answers first; only unanswered questions are sent to the server-side model.', 'مفعّل — يجيب المحرك أولًا، ولا يُرسل إلى النموذج على الخادم إلا الأسئلة غير المجابة.');

  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold sm:text-3xl">{tr('Assistant settings', 'إعدادات المساعد')}</h1>

      <Panel title={tr('Demo clock', 'ساعة العرض التجريبي')}>
        <p className="mb-4 text-sm text-slate-400">
          {tr(
            'Used for “today”, “now” and “tomorrow” whenever the real date is outside the event days, so the demo works any day. During the real event the actual date and time are used.',
            'تُستخدم لـ«اليوم» و«الآن» و«غدًا» عندما يكون التاريخ الفعلي خارج أيام الفعالية، ليعمل العرض في أي يوم. أثناء الفعالية الفعلية يُستخدم التاريخ والوقت الحقيقيان.',
          )}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <SelectField label={tr('Day', 'اليوم')} value={s.demoClock.dayIndex} onChange={(e) => setS({ ...s, demoClock: { ...s.demoClock, dayIndex: Number(e.target.value) } })}>
            {config.data.info.days.map((d, i) => (
              <option key={d.date} value={i}>
                {d.label?.[lang] ?? `Day ${i + 1}`} · {d.date}
              </option>
            ))}
          </SelectField>
          <TextField label={tr('Time (HH:MM)', 'الوقت (HH:MM)')} dir="ltr" value={s.demoClock.time} onChange={(e) => setS({ ...s, demoClock: { ...s.demoClock, time: e.target.value } })} maxLength={5} />
        </div>
      </Panel>

      <Panel title={tr('Privacy', 'الخصوصية')}>
        <Toggle
          checked={s.logQuestions}
          onChange={(v) => setS({ ...s, logQuestions: v })}
          label={tr('Log visitor questions for reports', 'تسجيل أسئلة الزوار للتقارير')}
          description={tr(
            'Stores the question text only (emails and phone numbers redacted), with no identity, to power popular/unanswered reports. Visitors see a notice in the chat.',
            'يحفظ نص السؤال فقط (مع حجب البريد والهاتف) دون أي هوية، لتقارير الأسئلة الشائعة وغير المجابة. يرى الزوار إشعارًا في المحادثة.',
          )}
        />
      </Panel>

      <Panel title={tr('AI model', 'نموذج الذكاء الاصطناعي')}>
        <p className="flex gap-2.5 text-sm text-slate-300">
          <Icon name={env.aiEnabled && !config.customData ? 'check' : 'info'} size={18} className="mt-0.5 shrink-0 text-electric-300" />
          {aiState}
        </p>
      </Panel>

      <div className="flex items-center gap-3">
        <Button onClick={save}>{tr('Save settings', 'حفظ الإعدادات')}</Button>
        {error && <p className="text-sm text-rose-300" role="alert">{error}</p>}
      </div>
    </div>
  );
}
