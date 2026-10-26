import { describe, expect, it } from 'vitest';
import { PRESETS } from '@/config/presets';
import { DATASETS } from '@/data';
import type { AssistantMode } from '@/types/assistant';
import { answer } from '../respond';

const now = new Date('2026-10-26T09:00:00');

// Every suggested-question chip must lead to a real answer for its own preset.
describe('branded suggested questions are answerable', () => {
  for (const p of PRESETS) {
    for (const mode of ['visitor', 'exhibitor', 'organizer'] as AssistantMode[]) {
      for (const q of p.branding.suggested[mode]) {
        for (const lang of ['en', 'ar'] as const) {
          it(`${p.id} · ${mode} · ${q[lang]}`, () => {
            const r = answer(q[lang], { data: DATASETS[p.datasetId], settings: p.settings, mode, uiLang: lang, now });
            expect(r.answered, `${r.intent}: ${JSON.stringify(r.blocks[0])}`).toBe(true);
          });
        }
      }
    }
  }
});
