import type { EventDataset } from '@/types/event';
import { CONFERENCE_DATASET } from './conference';
import { DFIE_DATASET } from './dfie';
import { MANUFACTURING_DATASET } from './manufacturing';

/** Built-in demo datasets. All content is fictional and marked as DEMO CONTENT in the UI. */
export const DATASETS: Record<string, EventDataset> = {
  [DFIE_DATASET.id]: DFIE_DATASET,
  [CONFERENCE_DATASET.id]: CONFERENCE_DATASET,
  [MANUFACTURING_DATASET.id]: MANUFACTURING_DATASET,
};
