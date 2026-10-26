import { useLang } from '@/i18n/LangProvider';

/** Always-visible notice that the event and its data are fictional. */
export function DemoBanner() {
  const { t } = useLang();
  return (
    <div className="border-b border-gold-400/20 bg-gold-400/10 px-4 py-2 text-center text-xs text-gold-300" role="note">
      <strong className="font-semibold">{t('demo.badge')}.</strong> {t('demo.disclaimer')}
    </div>
  );
}
