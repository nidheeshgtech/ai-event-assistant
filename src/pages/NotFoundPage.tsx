import { useLang } from '@/i18n/LangProvider';
import { ButtonLink } from '@/components/ui/Button';

export default function NotFoundPage() {
  const { t } = useLang();
  return (
    <main className="grid min-h-[100dvh] place-items-center px-4 text-center">
      <div>
        <p className="font-display text-6xl font-bold text-gold">404</p>
        <h1 className="mt-4 text-2xl font-bold">{t('common.notFound')}</h1>
        <ButtonLink to="/solutions/ai-event-assistant" className="mt-8">
          {t('common.home')}
        </ButtonLink>
      </div>
    </main>
  );
}
