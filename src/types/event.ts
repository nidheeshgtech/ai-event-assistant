/**
 * Event dataset schema. Every answer the assistant gives is built from one of these
 * objects — the engine never invents exhibitors, sessions, dates or locations.
 */
export type Lang = 'en' | 'ar';

/** Text shown to visitors, in every supported language. */
export interface Localized {
  en: string;
  ar: string;
}

export interface EventDay {
  /** ISO date, e.g. "2026-11-17". */
  date: string;
  /** 24h "HH:MM". */
  open: string;
  close: string;
  label?: Localized;
}

export interface EventInfo {
  name: Localized;
  tagline: Localized;
  venue: Localized;
  city: Localized;
  days: EventDay[];
  /** General admission / registration notes. */
  admission: Localized;
  contactEmail: string;
  contactPhone?: string;
  /** Always true for built-in data; surfaced as a DEMO CONTENT label. */
  demo: boolean;
}

/**
 * Map position of a hall. The floorplan has four fixed slots around a central concourse:
 * 0 = top-left, 1 = top-right, 2 = bottom-left, 3 = bottom-right.
 */
export type HallSlot = 0 | 1 | 2 | 3;

export interface Hall {
  id: string; // "H1"
  number: number; // 1
  slot: HallSlot;
  name: Localized; // "Hall 1"
  theme: Localized; // "AI & Data"
  description: Localized;
  /** Stand slots drawn on the map, numbered 01..standCount (max 20, 5 per row). */
  standCount: number;
  /** Which entrance or landmark the hall is reached from — descriptive only, never a route. */
  access: Localized;
}

export interface Stage {
  id: string;
  hallId: string;
  name: Localized;
}

export interface Category {
  id: string;
  name: Localized;
  /** Lower-case search terms in English and Arabic that map to this category. */
  keywords: string[];
}

export interface Product {
  name: Localized;
  description: Localized;
}

export interface Exhibitor {
  id: string;
  name: string;
  /** Arabic spelling or transliteration, plus any other names visitors might type. */
  aliases: string[];
  /** Stand code "H2-15": hall number + two-digit stand slot. */
  stand: string;
  hallId: string;
  categoryIds: string[];
  country: Localized;
  description: Localized;
  products: Product[];
  /** Extra search terms (en + ar), lower case. */
  tags: string[];
  website?: string;
  brochureUrl?: string;
  enquiryEmail?: string;
  featured?: boolean;
}

export interface Speaker {
  id: string;
  name: string;
  nameAr: string;
  title: Localized;
  organization: string;
  bio: Localized;
  /** Category ids or free topic tags. */
  topics: string[];
}

export type SessionFormat = 'keynote' | 'panel' | 'talk' | 'workshop' | 'demo';

export interface Session {
  id: string;
  title: Localized;
  description: Localized;
  /** Index into EventInfo.days. */
  dayIndex: number;
  start: string; // "10:30"
  end: string; // "11:15"
  stageId: string;
  speakerIds: string[];
  /** Category ids (preferred) or free topic tags. */
  topics: string[];
  format: SessionFormat;
}

export type FacilityType =
  | 'restroom'
  | 'prayer'
  | 'food'
  | 'cafe'
  | 'info'
  | 'firstAid'
  | 'entrance'
  | 'parking'
  | 'atm'
  | 'cloakroom'
  | 'charging'
  | 'wifi'
  | 'accessibility'
  | 'taxi';

export interface Facility {
  id: string;
  type: FacilityType;
  name: Localized;
  /** Hall id, or "concourse" for the central walkway. */
  zone: string;
  /** Position inside the zone, 0..1 from the top-left (map placement only). */
  x: number;
  y: number;
  /** Plain-language location as published by the organiser. */
  location: Localized;
  hours?: Localized;
}

export interface Announcement {
  id: string;
  title: Localized;
  body: Localized;
  priority: 'info' | 'important';
  dayIndex?: number;
  time?: string;
}

export interface Faq {
  id: string;
  question: Localized;
  answer: Localized;
  /** Lower-case trigger terms (en + ar). */
  keywords: string[];
}

export interface EventDataset {
  id: string;
  info: EventInfo;
  halls: Hall[];
  stages: Stage[];
  categories: Category[];
  exhibitors: Exhibitor[];
  speakers: Speaker[];
  sessions: Session[];
  facilities: Facility[];
  announcements: Announcement[];
  faqs: Faq[];
}
