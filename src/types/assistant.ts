import type { Lang, Localized } from './event';

/** Visitor = event info; Exhibitor = companies & products; Organizer = support & announcements. */
export type AssistantMode = 'visitor' | 'exhibitor' | 'organizer';

export type Intent =
  | 'greeting'
  | 'help'
  | 'event_info'
  | 'hours'
  | 'hall'
  | 'stand'
  | 'exhibitor_detail'
  | 'exhibitor_search'
  | 'directory'
  | 'speaker_detail'
  | 'speaker_search'
  | 'session_detail'
  | 'session_search'
  | 'facility'
  | 'announcements'
  | 'faq'
  | 'language'
  | 'unknown';

/** A piece of a reply. Cards reference dataset ids so they always render real records. */
export type ReplyBlock =
  | { kind: 'text'; text: string }
  | { kind: 'exhibitors'; ids: string[]; total: number }
  | { kind: 'speakers'; ids: string[] }
  | { kind: 'sessions'; ids: string[] }
  | { kind: 'hall'; id: string }
  | { kind: 'facilities'; ids: string[] }
  | { kind: 'announcements'; ids: string[] }
  | { kind: 'hours'; dayIndexes: number[] }
  | { kind: 'notice'; tone: 'info' | 'warning'; text: string };

/** Whatever the last answer was about, so "where is their stand?" works. */
export interface ConversationContext {
  intent?: Intent;
  exhibitorIds?: string[];
  speakerIds?: string[];
  sessionIds?: string[];
  hallId?: string;
  categoryId?: string;
  dayIndex?: number;
  /** Search terms of the last result list, for "show more". */
  offset?: number;
}

export interface AssistantReply {
  intent: Intent;
  lang: Lang;
  blocks: ReplyBlock[];
  suggestions: string[];
  /** False when the dataset had no answer — feeds the "unanswered questions" report. */
  answered: boolean;
  context: ConversationContext;
  source: 'engine' | 'ai';
  /** Set when the visitor asked to continue in another language. */
  switchLang?: Lang;
}

export type WidgetPosition = 'bottom-right' | 'bottom-left';

export interface AssistantBranding {
  assistantName: Localized;
  welcome: Localized;
  /** Square logo as a data URI (SVG built-ins, or uploaded PNG/JPG/WebP). Empty = monogram. */
  logo: string;
  primary: string;
  accent: string;
  languages: Lang[];
  defaultLang: Lang;
  widgetPosition: WidgetPosition;
  suggested: Record<AssistantMode, Localized[]>;
}

export interface AssistantSettings {
  /**
   * Clock used for "today" / "now" when the real date is outside the event days.
   * Keeps the demo meaningful any time it is shown.
   */
  demoClock: { dayIndex: number; time: string };
  /** Log visitor questions (redacted) for the popular/unanswered reports. */
  logQuestions: boolean;
}

export interface BrandPreset {
  id: string;
  label: Localized;
  kind: Localized;
  datasetId: string;
  branding: AssistantBranding;
  settings: AssistantSettings;
}
