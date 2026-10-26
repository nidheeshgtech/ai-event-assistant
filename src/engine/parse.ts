import type { FacilityType } from '@/types/event';
import { hasPhrase, normalize, stem, tokens } from './normalize';

export type DayRef =
  | { kind: 'relative'; offset: number } // today = 0, tomorrow = 1
  | { kind: 'index'; index: number } // "day 2"
  | { kind: 'last' }
  | { kind: 'weekday'; day: number } // 0 = Sunday
  | { kind: 'date'; day: number; month: number };

export type TimeRef = 'now' | 'next' | 'morning' | 'afternoon' | 'evening';

export interface ParsedQuery {
  raw: string;
  norm: string;
  tokens: string[];
  stand?: { hall: number; slot: number };
  hall?: number;
  day?: DayRef;
  time?: TimeRef;
  facility?: FacilityType;
  langSwitch?: 'en' | 'ar';
  ordinal?: number;
  wants: {
    speakers: boolean;
    sessions: boolean;
    exhibitors: boolean;
    directory: boolean;
    hours: boolean;
    announcements: boolean;
    eventInfo: boolean;
    location: boolean;
    map: boolean;
    more: boolean;
    explain: boolean;
    contact: boolean;
    /** "How do I contact the organiser?" */
    organiser: boolean;
    greeting: boolean;
    help: boolean;
  };
  /** Pronoun or demonstrative pointing at the previous answer ("their stand", "this product"). */
  refersBack: boolean;
}

const stemAll = (text: string) => text.split(' ').map(stem).join(' ');

/** Phrase match on the raw normalised text, or on stemmed words so "المواقف" finds "مواقف". */
function any(norm: string, phrases: string[]): boolean {
  const stemmed = stemAll(norm);
  return phrases.some((p) => hasPhrase(norm, p) || hasPhrase(stemmed, stemAll(normalize(p))));
}

const ORDINALS: Record<string, number> = {
  first: 1, '1st': 1, second: 2, '2nd': 2, third: 3, '3rd': 3, fourth: 4, '4th': 4, fifth: 5, '5th': 5,
  one: 1, two: 2, three: 3, four: 4,
  الاول: 1, الاولي: 1, الثاني: 2, الثانيه: 2, الثالث: 3, الثالثه: 3, الرابع: 4, الرابعه: 4, الخامس: 5, الخامسه: 5,
};

const WEEKDAYS: [string[], number][] = [
  [['sunday', 'الاحد'], 0],
  [['monday', 'الاثنين'], 1],
  [['tuesday', 'الثلاثاء'], 2],
  [['wednesday', 'الاربعاء'], 3],
  [['thursday', 'الخميس'], 4],
  [['friday', 'الجمعه'], 5],
  [['saturday', 'السبت'], 6],
];

const MONTHS: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
  aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
  يناير: 1, فبراير: 2, مارس: 3, ابريل: 4, مايو: 5, يونيو: 6, يوليو: 7, اغسطس: 8, سبتمبر: 9, اكتوبر: 10, نوفمبر: 11, ديسمبر: 12,
};

const FACILITY_WORDS: [FacilityType, string[]][] = [
  ['restroom', ['restroom', 'restrooms', 'toilet', 'toilets', 'washroom', 'washrooms', 'bathroom', 'bathrooms', 'wc', 'lavatory', 'ladies room', 'mens room', 'حمام', 'حمامات', 'دوره مياه', 'دورات المياه', 'دورات مياه', 'الحمام', 'الحمامات', 'تواليت']],
  ['prayer', ['prayer', 'prayer room', 'prayer rooms', 'pray', 'mosque', 'musalla', 'مصلي', 'مصليات', 'المصلي', 'صلاه', 'الصلاه', 'مسجد']],
  ['food', ['food', 'eat', 'lunch', 'dinner', 'restaurant', 'restaurants', 'food court', 'hungry', 'snack', 'مطعم', 'مطاعم', 'اكل', 'طعام', 'غداء', 'ساحه المطاعم']],
  ['cafe', ['coffee', 'cafe', 'café', 'tea', 'drink', 'drinks', 'قهوه', 'مقهي', 'كافيه', 'شاي']],
  ['firstAid', ['first aid', 'medical', 'doctor', 'paramedic', 'injury', 'injured', 'clinic', 'ambulance', 'emergency', 'اسعاف', 'اسعافات', 'الاسعافات الاوليه', 'طبيب', 'عياده', 'طوارئ']],
  ['info', ['information desk', 'info desk', 'help desk', 'helpdesk', 'reception', 'lost and found', 'lost & found', 'concierge', 'مكتب المعلومات', 'الاستعلامات', 'استعلامات', 'المفقودات']],
  ['entrance', ['entrance', 'entrances', 'exit', 'exits', 'gate', 'gates', 'way in', 'way out', 'مدخل', 'المدخل', 'مداخل', 'مخرج', 'بوابه', 'البوابه']],
  ['parking', ['parking', 'car park', 'park my car', 'valet', 'موقف', 'مواقف', 'باركينج', 'مواقف السيارات']],
  ['atm', ['atm', 'atms', 'cash', 'cash machine', 'صراف', 'صراف الي', 'الصراف']],
  ['cloakroom', ['cloakroom', 'luggage', 'bags', 'coat check', 'left luggage', 'الامتعه', 'حفظ الامتعه', 'امتعه', 'شنط']],
  ['charging', ['charging', 'charge my phone', 'charger', 'phone charging', 'battery', 'power bank', 'شحن', 'شاحن', 'بطاريه']],
  ['wifi', ['wifi', 'wi-fi', 'wi fi', 'internet', 'wireless', 'network', 'واي فاي', 'الواي فاي', 'انترنت', 'الانترنت']],
  ['accessibility', ['wheelchair', 'accessible', 'accessibility', 'disabled', 'disability', 'people of determination', 'كرسي متحرك', 'اصحاب الهمم', 'ذوي الاعاقه', 'ذوي الهمم']],
  ['taxi', ['taxi', 'cab', 'uber', 'careem', 'ride', 'pick up', 'pickup', 'تاكسي', 'سياره اجره', 'سيارات الاجره']],
];

export function parse(raw: string): ParsedQuery {
  const norm = normalize(raw);
  const q: ParsedQuery = {
    raw,
    norm,
    tokens: tokens(raw),
    wants: {
      speakers: any(norm, ['speaker', 'speakers', 'speaking', 'presenter', 'presenters', 'presenting', 'keynote speaker', 'who is talking', 'who is presenting', 'متحدث', 'المتحدث', 'المتحدثين', 'المتحدثون', 'متحدثين', 'يتحدث', 'متحدثه', 'محاضر', 'المحاضرين']),
      sessions: any(norm, ['session', 'sessions', 'talk', 'talks', 'event', 'events', 'happening', 'agenda', 'schedule', 'programme', 'program', 'keynote', 'keynotes', 'panel', 'panels', 'workshop', 'workshops', 'conference', 'seminar', 'lecture', 'presentation', 'presentations', 'on stage', 'جلسه', 'جلسات', 'الجلسات', 'فعاليه', 'فعاليات', 'الفعاليات', 'برنامج', 'جدول', 'محاضره', 'محاضرات', 'ورشه', 'ورش', 'نقاش', 'حلقه نقاش', 'كلمه رئيسيه']),
      exhibitors: any(norm, ['partner', 'partners', 'sponsor', 'sponsors', 'شريك', 'شركاء', 'الشركاء', 'راعي', 'رعاه', 'الرعاه', 'exhibitor', 'exhibitors', 'company', 'companies', 'firm', 'firms', 'vendor', 'vendors', 'supplier', 'suppliers', 'brand', 'brands', 'booth', 'booths', 'who sells', 'who offers', 'who makes', 'offers', 'offer', 'sells', 'provides', 'عارض', 'العارض', 'العارضين', 'العارضون', 'عارضين', 'شركه', 'شركات', 'الشركات', 'الشركه', 'مورد', 'موردين', 'يقدم', 'تقدم', 'توفر', 'يبيع']),
      directory: any(norm, ['directory', 'all exhibitors', 'exhibitor list', 'list of exhibitors', 'full list', 'every exhibitor', 'دليل العارضين', 'كل العارضين', 'جميع العارضين', 'قائمه العارضين', 'الدليل']),
      hours: any(norm, ['open', 'opens', 'opening', 'close', 'closes', 'closing', 'hours', 'opening hours', 'what time', 'until when', 'timings', 'timing', 'يفتح', 'يغلق', 'تفتح', 'تغلق', 'اغلاق', 'الاغلاق', 'افتتاح', 'مواعيد', 'ساعات العمل', 'ساعات', 'متي يفتح', 'متي يغلق', 'الدوام']),
      announcements: any(norm, ['announcement', 'announcements', 'news', 'update', 'updates', 'alert', 'alerts', 'important', 'notice', 'اعلان', 'اعلانات', 'الاعلانات', 'اخبار', 'تنبيه', 'تنبيهات', 'تحديثات', 'مستجدات']),
      eventInfo: any(norm, ['about the event', 'about this event', 'what is this event', 'which event', 'event details', 'venue', 'where is the event', 'event dates', 'when is the event', 'how long', 'admission', 'ticket', 'tickets', 'registration', 'عن المعرض', 'عن الحدث', 'ما هو المعرض', 'مكان المعرض', 'موعد المعرض', 'تذكره', 'تذاكر', 'التسجيل']),
      location: any(norm, ['where', 'where is', 'where are', 'located', 'location', 'find them', 'find it', 'how do i get', 'how to get', 'directions', 'way to', 'stand number', 'which stand', 'which hall', 'اين', 'وين', 'موقع', 'مكان', 'كيف اصل', 'رقم الجناح', 'اي قاعه']),
      map: any(norm, ['map', 'floorplan', 'floor plan', 'show on map', 'on the map', 'highlight', 'خريطه', 'الخريطه', 'المخطط', 'على الخريطه']),
      more: any(norm, ['more', 'show more', 'see more', 'others', 'other ones', 'next page', 'المزيد', 'اكثر', 'غيرهم', 'باقي']),
      explain: any(norm, ['explain', 'describe', 'tell me about', 'what is', 'what does', 'what do', 'details', 'more about', 'اشرح', 'وضح', 'عرفني', 'ما هي', 'ما هو', 'تفاصيل', 'معلومات عن']),
      contact: any(norm, ['contact', 'brochure', 'enquiry', 'enquire', 'inquiry', 'email', 'website', 'get in touch', 'catalogue', 'catalog', 'تواصل', 'كتيب', 'بروشور', 'استفسار', 'البريد', 'الموقع الالكتروني']),
      organiser: any(norm, ['organiser', 'organizer', 'organisers', 'organizers', 'organising team', 'event team', 'المنظم', 'المنظمين', 'الجهه المنظمه', 'اللجنه المنظمه', 'فريق المعرض']) &&
        any(norm, ['contact', 'reach', 'get in touch', 'call', 'email', 'phone', 'speak to', 'talk to', 'تواصل', 'اتواصل', 'التواصل', 'اتصل', 'الاتصال', 'اكلم', 'رقم', 'بريد']),
      greeting: /^(hi|hello|hey|salam|marhaba|good (morning|afternoon|evening)|مرحبا|اهلا|السلام عليكم|هلا|صباح الخير|مساء الخير)\b/.test(norm),
      help: any(norm, ['help', 'what can you do', 'how does this work', 'what can i ask', 'options', 'menu', 'مساعده', 'ماذا تستطيع', 'ماذا يمكنك', 'كيف تعمل', 'ساعدني']),
    },
    refersBack: any(norm, ['it', 'its', 'their', 'they', 'them', 'this', 'that', 'there', 'he', 'she', 'his', 'her', 'this company', 'this product', 'that company', 'that session', 'this session', 'the company', 'the session', 'هذا', 'هذه', 'ذلك', 'تلك', 'هم', 'هي', 'هو', 'منتجهم', 'جناحهم', 'موقعهم', 'هذا المنتج', 'هذه الشركه']),
  };

  // Stand codes: "H2-15", "stand 2-15", "جناح H2-15".
  const stand = /\bh\s?(\d)\s?-\s?(\d{1,2})\b/.exec(norm) ?? /(?:stand|booth|جناح|الجناح)\s*(?:no|number|رقم)?\s*(\d)\s?-\s?(\d{1,2})\b/.exec(norm);
  if (stand) q.stand = { hall: Number(stand[1]), slot: Number(stand[2]) };

  // Hall numbers: "hall 3", "hall three", "القاعه 3", "القاعه الثالثه", "h3".
  const hallM =
    /(?:hall|القاعه|قاعه)\s*(?:no|number|رقم)?\s*(\d|one|two|three|four|first|second|third|fourth|الاولي|الاول|الثانيه|الثاني|الثالثه|الثالث|الرابعه|الرابع)\b/.exec(norm) ??
    /\bh(\d)\b/.exec(norm);
  if (hallM && !q.stand) q.hall = /^\d$/.test(hallM[1]) ? Number(hallM[1]) : ORDINALS[hallM[1]];

  // Day references. "اليوم الثاني" is "day two", not "today".
  const dayIdx =
    /\bday\s*(\d)\b/.exec(norm) ??
    /\b(first|second|third|1st|2nd|3rd)\s+day\b/.exec(norm) ??
    /اليوم\s+(الاول|الثاني|الثالث|الرابع)/.exec(norm) ??
    /يوم\s+(الاول|الثاني|الثالث|الرابع)/.exec(norm);
  if (dayIdx) q.day = { kind: 'index', index: (/^\d$/.test(dayIdx[1]) ? Number(dayIdx[1]) : ORDINALS[dayIdx[1]]) - 1 };
  else if (any(norm, ['last day', 'final day', 'closing day', 'اليوم الاخير', 'اخر يوم'])) q.day = { kind: 'last' };
  else if (any(norm, ['day after tomorrow', 'بعد غد', 'بعد بكره'])) q.day = { kind: 'relative', offset: 2 };
  else if (any(norm, ['tomorrow', 'tmrw', 'غدا', 'بكره', 'الغد', 'باكر'])) q.day = { kind: 'relative', offset: 1 };
  else if (any(norm, ['yesterday', 'امس', 'البارحه'])) q.day = { kind: 'relative', offset: -1 };
  else if (any(norm, ['today', 'tonight', 'this morning', 'this afternoon', 'this evening', 'اليوم', 'الليله'])) q.day = { kind: 'relative', offset: 0 };
  else {
    for (const [names, day] of WEEKDAYS) if (any(norm, names)) q.day = { kind: 'weekday', day };
    const date = /\b(\d{1,2})\s*(?:st|nd|rd|th)?\s+([a-z؀-ۿ]+)/.exec(norm);
    if (date && MONTHS[date[2]]) q.day = { kind: 'date', day: Number(date[1]), month: MONTHS[date[2]] };
  }

  if (any(norm, ['now', 'right now', 'currently', 'at the moment', 'happening now', 'الان', 'حاليا', 'الحين'])) q.time = 'now';
  else if (any(norm, ['next', 'upcoming', 'coming up', 'later', 'soon', 'التالي', 'التاليه', 'القادم', 'القادمه', 'لاحقا', 'بعد قليل'])) q.time = 'next';
  else if (any(norm, ['morning', 'صباح', 'الصباح', 'صباحا'])) q.time = 'morning';
  else if (any(norm, ['afternoon', 'بعد الظهر', 'الظهر', 'العصر'])) q.time = 'afternoon';
  else if (any(norm, ['evening', 'tonight', 'مساء', 'المساء', 'مساءا'])) q.time = 'evening';

  for (const [type, words] of FACILITY_WORDS) {
    if (any(norm, words)) {
      q.facility = type;
      break;
    }
  }

  if (any(norm, ['in arabic', 'arabic please', 'to arabic', 'arabic version', 'speak arabic', 'بالعربي', 'بالعربيه', 'باللغه العربيه', 'عربي'])) q.langSwitch = 'ar';
  else if (any(norm, ['in english', 'english please', 'to english', 'speak english', 'بالانجليزي', 'بالانجليزيه', 'باللغه الانجليزيه', 'انجليزي'])) q.langSwitch = 'en';

  const ord = /\b(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th)\s+(one|result|company|exhibitor|session|speaker)\b/.exec(norm) ?? /(?:رقم\s*)?(الاول|الثاني|الثالث|الرابع|الخامس)\b/.exec(norm);
  if (ord && !dayIdx && !hallM) q.ordinal = ORDINALS[ord[1]];

  return q;
}
