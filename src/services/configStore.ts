import { useSyncExternalStore } from 'react';
import { DEFAULT_PRESET, PRESETS } from '@/config/presets';
import { DATASETS } from '@/data';
import type { AssistantBranding, AssistantSettings, BrandPreset } from '@/types/assistant';
import type { EventDataset } from '@/types/event';
import { readJSON, writeJSON } from './storage';

/**
 * Organiser edits for one preset. Demo mode keeps them in this browser;
 * production would persist them server-side behind admin authentication.
 */
interface Overrides {
  branding?: AssistantBranding;
  settings?: AssistantSettings;
  dataset?: EventDataset;
}

export interface AssistantConfig {
  preset: BrandPreset;
  branding: AssistantBranding;
  settings: AssistantSettings;
  data: EventDataset;
  /** True when the dataset differs from the built-in one (the AI backend only knows built-ins). */
  customData: boolean;
}

const listeners = new Set<() => void>();
const snapshots = new Map<string, AssistantConfig>();
let active = readJSON<string>('active-preset', DEFAULT_PRESET);
if (!PRESETS.some((p) => p.id === active)) active = DEFAULT_PRESET;

function emit() {
  snapshots.clear();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const key = (presetId: string) => `config:${presetId}`;

export function getPreset(id: string): BrandPreset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}

export function getConfig(presetId: string): AssistantConfig {
  const hit = snapshots.get(presetId);
  if (hit) return hit;
  const preset = getPreset(presetId);
  const o = readJSON<Overrides>(key(preset.id), {});
  const config: AssistantConfig = {
    preset,
    branding: { ...preset.branding, ...o.branding, suggested: { ...preset.branding.suggested, ...o.branding?.suggested } },
    settings: { ...preset.settings, ...o.settings },
    data: o.dataset ?? DATASETS[preset.datasetId],
    customData: Boolean(o.dataset),
  };
  snapshots.set(presetId, config);
  return config;
}

function update(presetId: string, patch: Overrides) {
  const current = readJSON<Overrides>(key(presetId), {});
  writeJSON(key(presetId), { ...current, ...patch });
  emit();
}

export const configStore = {
  saveBranding: (presetId: string, branding: AssistantBranding) => update(presetId, { branding }),
  saveSettings: (presetId: string, settings: AssistantSettings) => update(presetId, { settings }),
  saveDataset: (presetId: string, dataset: EventDataset) => update(presetId, { dataset }),
  resetDataset: (presetId: string) => {
    const current = readJSON<Overrides>(key(presetId), {});
    delete current.dataset;
    writeJSON(key(presetId), current);
    emit();
  },
  resetAll: (presetId: string) => {
    writeJSON(key(presetId), {});
    emit();
  },
  setActive: (presetId: string) => {
    if (presetId === active || !PRESETS.some((p) => p.id === presetId)) return;
    active = presetId;
    writeJSON('active-preset', presetId);
    emit();
  },
};

export function useActivePresetId(): string {
  return useSyncExternalStore(subscribe, () => active);
}

export function useConfig(presetId?: string): AssistantConfig {
  const activeId = useActivePresetId();
  const id = presetId ?? activeId;
  return useSyncExternalStore(subscribe, () => getConfig(id));
}
