import { usePreset } from '@/hooks/usePreset';
import { useLang } from '@/i18n/LangProvider';
import { useConfig } from '@/services/configStore';

/** Shared state for dashboard screens: active preset, its config and a tiny bilingual helper. */
export function useDashboard() {
  const [presetId, setPreset] = usePreset();
  const config = useConfig(presetId);
  const { lang } = useLang();
  const tr = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  return { presetId, setPreset, config, lang, tr };
}
