import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRESETS } from '@/config/presets';
import { configStore, useActivePresetId } from '@/services/configStore';

/** Active preset, kept in sync with the `?preset=` query parameter so demo links are shareable. */
export function usePreset(): [string, (id: string) => void] {
  const [params, setParams] = useSearchParams();
  const active = useActivePresetId();
  const fromUrl = params.get('preset');

  useEffect(() => {
    if (fromUrl && PRESETS.some((p) => p.id === fromUrl)) configStore.setActive(fromUrl);
  }, [fromUrl]);

  const select = (id: string) => {
    configStore.setActive(id);
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        next.set('preset', id);
        ['stand', 'hall', 'facility'].forEach((k) => next.delete(k));
        return next;
      },
      { replace: true },
    );
  };

  const id = fromUrl && PRESETS.some((p) => p.id === fromUrl) ? fromUrl : active;
  return [id, select];
}
