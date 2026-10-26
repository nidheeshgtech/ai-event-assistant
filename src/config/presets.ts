import type { AssistantMode, BrandPreset } from '@/types/assistant';
import type { Localized } from '@/types/event';
import { LOGOS } from './logos';

const q = (en: string, ar: string): Localized => ({ en, ar });

const VISITOR = [
  q('What events are happening today?', 'ما الفعاليات المقامة اليوم؟'),
  q('Which speakers are presenting tomorrow?', 'من المتحدثون غدًا؟'),
  q('Where are the restrooms?', 'أين دورات المياه؟'),
  q('What time does the exhibition close?', 'متى يغلق المعرض؟'),
];
const ORGANIZER = [
  q('Any announcements?', 'هل توجد إعلانات؟'),
  q('Where is the information desk?', 'أين مكتب المعلومات؟'),
  q('Is parking free?', 'هل المواقف مجانية؟'),
  q('How do I contact the organiser?', 'كيف أتواصل مع المنظم؟'),
];

const suggested = (visitor: Localized[], exhibitor: Localized[], organizer = ORGANIZER): Record<AssistantMode, Localized[]> => ({ visitor, exhibitor, organizer });

/**
 * Three white-label presets on one engine. Each pairs a fictional dataset with
 * branding an agency would set for its client.
 */
export const PRESETS: BrandPreset[] = [
  {
    id: 'tech',
    label: q('Technology Exhibition', 'معرض تقني'),
    kind: q('Dubai Future Innovation Expo 2026', 'معرض دبي لابتكارات المستقبل 2026'),
    datasetId: 'dfie-2026',
    branding: {
      assistantName: q('Nova', 'نوفا'),
      welcome: q(
        'Welcome to Dubai Future Innovation Expo 2026! I can find exhibitors, sessions, speakers and facilities for you.',
        'أهلًا بك في معرض دبي لابتكارات المستقبل 2026! يمكنني مساعدتك في العثور على العارضين والجلسات والمتحدثين والخدمات.',
      ),
      logo: LOGOS.tech,
      primary: '#38bdf8',
      accent: '#a78bfa',
      languages: ['en', 'ar'],
      defaultLang: 'en',
      widgetPosition: 'bottom-right',
      suggested: suggested(
        [q('Where is Hall 3?', 'أين القاعة 3؟'), q('What events are happening today?', 'ما الفعاليات المقامة اليوم؟'), q('Recommend sessions about artificial intelligence', 'اقترح جلسات عن الذكاء الاصطناعي'), q('Where are the restrooms?', 'أين دورات المياه؟')],
        [q('Show AI companies', 'اعرض شركات الذكاء الاصطناعي'), q('Find robotics exhibitors', 'ابحث عن عارضي الروبوتات'), q('Which company offers automation technology?', 'أي شركة تقدم تقنيات الأتمتة؟'), q('Where is stand H2-15?', 'أين الجناح H2-15؟')],
      ),
    },
    settings: { demoClock: { dayIndex: 0, time: '11:30' }, logQuestions: true },
  },
  {
    id: 'corporate',
    label: q('Corporate Conference', 'مؤتمر مؤسسي'),
    kind: q('Gulf Leadership & Digital Transformation Summit 2026', 'قمة الخليج للقيادة والتحول الرقمي 2026'),
    datasetId: 'gls-2026',
    branding: {
      assistantName: q('Summit Concierge', 'مساعد القمة'),
      welcome: q(
        'Good day, and welcome to the Gulf Leadership & Digital Transformation Summit. Ask me about the agenda, speakers, partners or venue services.',
        'أهلًا بكم في قمة الخليج للقيادة والتحول الرقمي. اسألني عن جدول الأعمال أو المتحدثين أو الشركاء أو خدمات المكان.',
      ),
      logo: LOGOS.corporate,
      primary: '#f9d36b',
      accent: '#4cc3ff',
      languages: ['en', 'ar'],
      defaultLang: 'en',
      widgetPosition: 'bottom-right',
      suggested: suggested(VISITOR, [
        q('Show the exhibitor directory', 'اعرض دليل العارضين'),
        q('Show AI companies', 'اعرض شركات الذكاء الاصطناعي'),
        q('Which company offers cybersecurity?', 'أي شركة تقدم الأمن السيبراني؟'),
        q('Who are the partners in the Partner Showcase?', 'من الشركاء في معرض الشركاء؟'),
      ]),
    },
    settings: { demoClock: { dayIndex: 0, time: '11:30' }, logQuestions: true },
  },
  {
    id: 'manufacturing',
    label: q('Manufacturing Exhibition', 'معرض صناعي'),
    kind: q('Industrial Manufacturing Exhibition 2026', 'معرض التصنيع الصناعي 2026'),
    datasetId: 'imx-2026',
    branding: {
      assistantName: q('Forge', 'فورج'),
      welcome: q(
        'Welcome to the Industrial Manufacturing Exhibition. Tell me what you are sourcing and I will point you to the right suppliers and stands.',
        'أهلًا بك في معرض التصنيع الصناعي. أخبرني بما تبحث عنه وسأرشدك إلى الموردين والأجنحة المناسبة.',
      ),
      logo: LOGOS.manufacturing,
      primary: '#fb923c',
      accent: '#34d399',
      languages: ['en', 'ar'],
      defaultLang: 'en',
      widgetPosition: 'bottom-left',
      suggested: suggested(VISITOR, [
        q('Find robotics exhibitors', 'ابحث عن عارضي الروبوتات'),
        q('Which company offers automation technology?', 'أي شركة تقدم تقنيات الأتمتة؟'),
        q('Show CNC machine suppliers', 'اعرض موردي آلات CNC'),
        q('Show the exhibitor directory', 'اعرض دليل العارضين'),
      ]),
    },
    settings: { demoClock: { dayIndex: 0, time: '11:30' }, logQuestions: true },
  },
];

export const DEFAULT_PRESET = PRESETS[0].id;
