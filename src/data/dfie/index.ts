import type { EventDataset } from '@/types/event';
import { DFIE_ANNOUNCEMENTS } from './announcements';
import { DFIE_CATEGORIES, DFIE_FACILITIES, DFIE_HALLS, DFIE_INFO, DFIE_STAGES } from './base';
import { DFIE_EXHIBITORS } from './exhibitors';
import { DFIE_FAQS } from './faqs';
import { DFIE_SESSIONS } from './sessions';
import { DFIE_SPEAKERS } from './speakers';

/** DEMO CONTENT — Dubai Future Innovation Expo 2026 (fictional). */
export const DFIE_DATASET: EventDataset = {
  id: 'dfie-2026',
  info: DFIE_INFO,
  halls: DFIE_HALLS,
  stages: DFIE_STAGES,
  categories: DFIE_CATEGORIES,
  exhibitors: DFIE_EXHIBITORS,
  speakers: DFIE_SPEAKERS,
  sessions: DFIE_SESSIONS,
  facilities: DFIE_FACILITIES,
  announcements: DFIE_ANNOUNCEMENTS,
  faqs: DFIE_FAQS,
};
