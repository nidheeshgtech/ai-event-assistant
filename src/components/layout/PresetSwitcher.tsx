import { PRESETS } from '@/config/presets';
import { loc } from '@/engine/text';
import { useLang } from '@/i18n/LangProvider';
import { getConfig } from '@/services/configStore';
import { BrandMark } from '../ui/Brand';

/** Switch between the three white-label presets that share one assistant engine. */
export function PresetSwitcher({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { lang, t } = useLang();
  return (
    <div role="radiogroup" aria-label={t('preset.label')} className="flex gap-2 overflow-x-auto pb-1">
      {PRESETS.map((p) => {
        const c = getConfig(p.id);
        const on = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(p.id)}
            className={`flex min-w-[220px] flex-1 items-center gap-3 rounded-2xl border px-3 py-2.5 text-start transition ${on ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}
          >
            <BrandMark name={loc(c.data.info.name, lang)} logo={c.branding.logo} primary={c.branding.primary} accent={c.branding.accent} size={36} />
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 rtl:tracking-normal">{loc(p.label, lang)}</span>
              <span className="block truncate text-sm font-medium text-white">{loc(c.data.info.name, lang)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
