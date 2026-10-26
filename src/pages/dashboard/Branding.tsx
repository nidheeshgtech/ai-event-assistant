import { useState, type ChangeEvent } from 'react';
import { ChatPanel } from '@/components/assistant/ChatPanel';
import { Panel } from '@/components/dashboard/KpiCard';
import { useDashboard } from '@/components/dashboard/useDashboard';
import { BrandMark } from '@/components/ui/Brand';
import { Button } from '@/components/ui/Button';
import { SelectField, TextArea } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { isHexColor } from '@/services/color';
import { configStore } from '@/services/configStore';
import type { AssistantBranding, AssistantMode } from '@/types/assistant';
import type { Lang, Localized } from '@/types/event';
import { LocInput } from './EventProfile';

const MAX_LOGO_BYTES = 2_000_000;

/** Resize an uploaded raster logo to 256px and return a PNG data URI. SVG is rejected (can carry scripts). */
async function readLogo(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('type');
  if (file.size > MAX_LOGO_BYTES) throw new Error('size');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const scale = Math.min(1, 256 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

const MODES: { id: AssistantMode; en: string; ar: string }[] = [
  { id: 'visitor', en: 'Visitor mode', ar: 'وضع الزوار' },
  { id: 'exhibitor', en: 'Exhibitor mode', ar: 'وضع العارضين' },
  { id: 'organizer', en: 'Organizer mode', ar: 'وضع المنظم' },
];

export default function Branding() {
  const { config, presetId, tr, lang } = useDashboard();
  const toast = useToast();
  const [b, setB] = useState<AssistantBranding>(structuredClone(config.branding));
  const [error, setError] = useState('');
  const set = <K extends keyof AssistantBranding>(k: K, v: AssistantBranding[K]) => setB((x) => ({ ...x, [k]: v }));

  const onLogo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      set('logo', await readLogo(file));
    } catch (err) {
      toast((err as Error).message === 'size' ? tr('Logo must be under 2 MB.', 'يجب أن يكون الشعار أقل من 2 ميغابايت.') : tr('Use a PNG, JPG or WebP image.', 'استخدم صورة PNG أو JPG أو WebP.'), 'error');
    }
  };

  const setSuggested = (mode: AssistantMode, l: Lang, text: string) => {
    const lines = text.split('\n').slice(0, 6);
    const cur = b.suggested[mode];
    const n = Math.max(lines.length, cur.length);
    const next: Localized[] = Array.from({ length: n }, (_, i) => ({ en: cur[i]?.en ?? '', ar: cur[i]?.ar ?? '', [l]: lines[i] ?? '' }) as Localized);
    set('suggested', { ...b.suggested, [mode]: next });
  };

  const save = () => {
    if (!isHexColor(b.primary) || !isHexColor(b.accent)) return setError(tr('Colours must be hex values like #38bdf8.', 'يجب أن تكون الألوان بصيغة hex مثل ‎#38bdf8.'));
    if (!b.languages.length) return setError(tr('Enable at least one language.', 'فعّل لغة واحدة على الأقل.'));
    if (!b.assistantName.en.trim() || !b.assistantName.ar.trim()) return setError(tr('Assistant name is required in both languages.', 'اسم المساعد مطلوب باللغتين.'));
    const cleanSuggested = Object.fromEntries(
      Object.entries(b.suggested).map(([m, list]) => [m, list.map((q) => ({ en: q.en.trim().slice(0, 120), ar: q.ar.trim().slice(0, 120) })).filter((q) => q.en || q.ar)]),
    ) as AssistantBranding['suggested'];
    const defaultLang = b.languages.includes(b.defaultLang) ? b.defaultLang : b.languages[0];
    setError('');
    configStore.saveBranding(presetId, { ...b, suggested: cleanSuggested, defaultLang });
    toast(tr('Branding saved', 'تم حفظ الهوية'));
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
      <div className="space-y-5">
        <h1 className="text-2xl font-bold sm:text-3xl">{tr('Branding & languages', 'الهوية واللغات')}</h1>

        <Panel title={tr('Identity', 'الهوية')}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <BrandMark name={config.data.info.name[lang]} logo={b.logo} primary={b.primary} accent={b.accent} size={64} />
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex h-9 cursor-pointer items-center rounded-full px-4 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/10">
                  {tr('Upload logo', 'رفع الشعار')}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onLogo} />
                </label>
                {b.logo && (
                  <Button variant="ghost" size="sm" onClick={() => set('logo', '')}>
                    {tr('Use monogram', 'استخدام الأحرف الأولى')}
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500">{tr('PNG, JPG or WebP, resized to 256px. SVG uploads are not accepted.', 'PNG أو JPG أو WebP، تُصغَّر إلى 256 بكسل. لا تُقبل ملفات SVG.')}</p>
            <LocInput label={tr('Assistant display name', 'اسم المساعد')} value={b.assistantName} onChange={(v) => set('assistantName', v)} max={40} />
            <LocInput label={tr('Welcome message', 'رسالة الترحيب')} value={b.welcome} onChange={(v) => set('welcome', v)} area max={300} />
            <div className="grid grid-cols-2 gap-3">
              {(['primary', 'accent'] as const).map((k) => (
                <div key={k}>
                  <label htmlFor={`c-${k}`} className="mb-1.5 block text-sm font-medium text-slate-200">
                    {k === 'primary' ? tr('Primary colour', 'اللون الأساسي') : tr('Accent colour', 'اللون الثانوي')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="color" aria-label={k} value={isHexColor(b[k]) ? b[k] : '#000000'} onChange={(e) => set(k, e.target.value)} className="h-11 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent" />
                    <input id={`c-${k}`} dir="ltr" value={b[k]} onChange={(e) => set(k, e.target.value.trim())} maxLength={7} className="h-11 w-full rounded-xl border border-white/10 bg-midnight-950/60 px-3 font-mono text-sm text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title={tr('Languages & widget', 'اللغات والأداة')}>
          <div className="grid gap-4 sm:grid-cols-3">
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-slate-200">{tr('Languages', 'اللغات')}</legend>
              {(['en', 'ar'] as Lang[]).map((l) => (
                <label key={l} className="flex items-center gap-2 py-1 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={b.languages.includes(l)}
                    onChange={(e) => set('languages', e.target.checked ? [...new Set([...b.languages, l])] : b.languages.filter((x) => x !== l))}
                    className="h-4 w-4"
                  />
                  {l === 'en' ? 'English' : 'العربية'}
                </label>
              ))}
            </fieldset>
            <SelectField label={tr('Default language', 'اللغة الافتراضية')} value={b.defaultLang} onChange={(e) => set('defaultLang', e.target.value as Lang)}>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </SelectField>
            <SelectField label={tr('Widget placement', 'موضع الأداة')} value={b.widgetPosition} onChange={(e) => set('widgetPosition', e.target.value as AssistantBranding['widgetPosition'])}>
              <option value="bottom-right">{tr('Bottom right', 'أسفل اليمين')}</option>
              <option value="bottom-left">{tr('Bottom left', 'أسفل اليسار')}</option>
            </SelectField>
          </div>
        </Panel>

        <Panel title={tr('Suggested questions', 'الأسئلة المقترحة')}>
          <p className="mb-4 text-xs text-slate-400">{tr('One question per line, up to 6 per mode. Line 1 in English pairs with line 1 in Arabic.', 'سؤال واحد في كل سطر، حتى 6 لكل وضع. السطر الأول بالإنجليزية يقابل السطر الأول بالعربية.')}</p>
          <div className="space-y-5">
            {MODES.map((m) => (
              <fieldset key={m.id} className="grid gap-3 sm:grid-cols-2">
                <legend className="mb-1.5 text-sm font-semibold text-white">{tr(m.en, m.ar)}</legend>
                <TextArea label="English" dir="ltr" value={b.suggested[m.id].map((q) => q.en).join('\n')} onChange={(e) => setSuggested(m.id, 'en', e.target.value)} />
                <TextArea label="العربية" dir="rtl" value={b.suggested[m.id].map((q) => q.ar).join('\n')} onChange={(e) => setSuggested(m.id, 'ar', e.target.value)} />
              </fieldset>
            ))}
          </div>
        </Panel>

        <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-white/10 bg-midnight-950/90 px-4 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
          <Button onClick={save}>{tr('Save branding', 'حفظ الهوية')}</Button>
          <Button
            variant="ghost"
            onClick={() => {
              configStore.resetAll(presetId);
              location.reload();
            }}
          >
            {tr('Reset preset to defaults', 'إعادة الهوية إلى الإعدادات الأصلية')}
          </Button>
          {error && (
            <p className="text-sm text-rose-300" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="xl:sticky xl:top-20 xl:h-[calc(100dvh-7rem)]">
        <p className="mb-2 text-xs text-slate-400">{tr('Live preview (saved settings)', 'معاينة مباشرة (الإعدادات المحفوظة)')}</p>
        <div className="h-[620px] overflow-hidden rounded-3xl border border-white/10 bg-midnight-950/80 xl:h-[calc(100%-1.5rem)]">
          <ChatPanel presetId={presetId} variant="widget" />
        </div>
      </div>
    </div>
  );
}
