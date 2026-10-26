import type { AssistantMode, AssistantReply, AssistantSettings, ConversationContext, Intent, ReplyBlock } from '@/types/assistant';
import type { EventDataset, Exhibitor, FacilityType, Hall, Lang, Session, Speaker } from '@/types/event';
import { eventClock, formatDate, formatTime, minutes, weekday, type EventClock } from './clock';
import { detectLang, normalize, stem, tokens } from './normalize';
import { parse, type DayRef, type ParsedQuery } from './parse';
import { contentTokens, getIndex, matchCategories, matchNames, rank, type EngineIndex } from './search';
import { count, joinList, loc, t } from './text';

export const MAX_QUESTION_LENGTH = 500;
/** How many cards a list shows before "show more". */
export const PAGE = 6;

export interface EngineOptions {
  data: EventDataset;
  settings: AssistantSettings;
  mode: AssistantMode;
  uiLang: Lang;
  context?: ConversationContext;
  now?: Date;
  /** Branded suggested questions for the current mode; replace the generic defaults. */
  suggested?: Record<Lang, string[]>;
}

/** Words that only steer language, numbering or politeness — never search terms. */
const NOISE = new Set(
  tokens(
    'arabic english speak language please kindly speaking presenting presented happening held taking place going on hall stand booth exhibition expo event venue first second third fourth fifth last one ones result results ' +
      'help assist assistance مساعده ساعدني ' +
      'time open opens opening close closes closing hours until timing timings ' +
      'المقامه مقامه تقام يقام الجاريه جاريه ' +
      'يفتح يغلق تفتح تغلق اغلاق الاغلاق افتتاح مواعيد ساعات الدوام متي ' +
      'عربي العربي بالعربي بالعربيه العربيه انجليزي بالانجليزي الانجليزيه لغه باللغه معرض المعرض قاعه القاعه جناح الاول الثاني الثالث الرابع الاخير',
  ),
);

interface Ctx {
  q: ParsedQuery;
  lang: Lang;
  data: EventDataset;
  idx: EngineIndex;
  clock: EventClock;
  mode: AssistantMode;
  suggested?: Record<Lang, string[]>;
  prev: ConversationContext;
  content: string[];
  cats: string[];
}

interface Draft {
  intent: Intent;
  blocks: ReplyBlock[];
  answered?: boolean;
  context?: ConversationContext;
  suggestions?: string[];
  switchLang?: Lang;
}

const pad2 = (n: number) => String(n).padStart(2, '0');
const sortSessions = (a: Session, b: Session) => a.dayIndex - b.dayIndex || minutes(a.start) - minutes(b.start);

// ---------- lookups ----------

const hallOf = (d: EventDataset, id: string) => d.halls.find((h) => h.id === id);
const hallByNumber = (d: EventDataset, n: number) => d.halls.find((h) => h.number === n);
const stageOf = (d: EventDataset, id: string) => d.stages.find((s) => s.id === id);
const exhibitor = (d: EventDataset, id: string) => d.exhibitors.find((e) => e.id === id);
const speaker = (d: EventDataset, id: string) => d.speakers.find((s) => s.id === id);
const session = (d: EventDataset, id: string) => d.sessions.find((s) => s.id === id);
const category = (d: EventDataset, id: string) => d.categories.find((c) => c.id === id);

function dayName(c: Ctx, i: number): string {
  const day = c.data.info.days[i];
  if (!day) return '';
  return `${loc(day.label, c.lang) || t(c.lang, `Day ${i + 1}`, `اليوم ${i + 1}`)} (${formatDate(day.date, c.lang)})`;
}

function sessionHall(c: Ctx, s: Session): Hall | undefined {
  const st = stageOf(c.data, s.stageId);
  return st ? hallOf(c.data, st.hallId) : undefined;
}

function resolveDay(c: Ctx, ref: DayRef): number {
  const days = c.data.info.days;
  switch (ref.kind) {
    case 'relative':
      return c.clock.dayIndex + ref.offset;
    case 'index':
      return ref.index;
    case 'last':
      return days.length - 1;
    case 'weekday':
      return days.findIndex((d) => weekday(d.date) === ref.day);
    case 'date':
      return days.findIndex((d) => {
        const [, m, dd] = d.date.split('-').map(Number);
        return m === ref.month && dd === ref.day;
      });
  }
}

/** Notice shown whenever "today / now" was answered from the simulated demo clock. */
function clockNotice(c: Ctx): ReplyBlock[] {
  if (!c.clock.simulated) return [];
  return [
    {
      kind: 'notice',
      tone: 'info',
      text: t(
        c.lang,
        `Demo clock: ${dayName(c, c.clock.dayIndex)}, ${formatTime(c.clock.time, 'en')}. Today's real date is outside the event days.`,
        `ساعة العرض التجريبي: ${dayName(c, c.clock.dayIndex)}، الساعة ${formatTime(c.clock.time, 'ar')}. التاريخ الفعلي خارج أيام الفعالية.`,
      ),
    },
  ];
}

/** The visitor's own words that were actually searched for (unstemmed, for display). */
function shownTerms(c: Ctx): string {
  const words = normalize(c.q.raw).split(' ').filter((w) => c.content.includes(stem(w)));
  return words.join(' ') || c.content.join(' ');
}

const usesClock = (q: ParsedQuery) => (q.day?.kind === 'relative') || q.time === 'now' || q.time === 'next';

// ---------- answers ----------

function exhibitorLine(c: Ctx, e: Exhibitor): string {
  const h = hallOf(c.data, e.hallId);
  return t(
    c.lang,
    `${e.name} is at stand ${e.stand} in ${loc(h?.name, 'en')} (${loc(h?.theme, 'en')}).`,
    `تقع ${e.name} في الجناح ${e.stand} في ${loc(h?.name, 'ar')} (${loc(h?.theme, 'ar')}).`,
  );
}

function exhibitorDetail(c: Ctx, list: Exhibitor[]): Draft {
  if (list.length > 1) {
    return {
      intent: 'exhibitor_search',
      blocks: [
        { kind: 'text', text: t(c.lang, `I found ${list.length} exhibitors with that name:`, `وجدت ${count(list.length, 'ar', ['', ''], ['عارضًا واحدًا', 'عارضَين', 'عارضين', 'عارضًا'])} بهذا الاسم:`) },
        { kind: 'exhibitors', ids: list.map((e) => e.id), total: list.length },
      ],
      context: { intent: 'exhibitor_search', exhibitorIds: list.map((e) => e.id) },
    };
  }
  const e = list[0];
  const products = e.products.map((p) => loc(p.name, c.lang));
  const text = [
    exhibitorLine(c, e),
    loc(e.description, c.lang),
    products.length ? t(c.lang, `Products: ${joinList(products, 'en')}.`, `المنتجات: ${joinList(products, 'ar')}.`) : '',
  ]
    .filter(Boolean)
    .join(' ');
  const cat = e.categoryIds[0] ? category(c.data, e.categoryIds[0]) : undefined;
  return {
    intent: 'exhibitor_detail',
    blocks: [
      { kind: 'text', text },
      { kind: 'exhibitors', ids: [e.id], total: 1 },
    ],
    context: { intent: 'exhibitor_detail', exhibitorIds: [e.id], hallId: e.hallId, categoryId: cat?.id },
    suggestions: [
      cat && t(c.lang, `Other ${loc(cat.name, 'en')} exhibitors`, `عارضون آخرون في ${loc(cat.name, 'ar')}`),
      cat && c.data.sessions.some((s) => s.topics.includes(cat.id)) && t(c.lang, `Sessions about ${loc(cat.name, 'en')}`, `جلسات عن ${loc(cat.name, 'ar')}`),
      c.lang === 'en' ? 'Explain this in Arabic' : 'Explain this in English',
    ].filter(Boolean) as string[],
  };
}

function speakerDetail(c: Ctx, list: Speaker[]): Draft {
  const sessions = c.data.sessions.filter((s) => s.speakerIds.some((id) => list.some((sp) => sp.id === id))).sort(sortSessions);
  const sp = list[0];
  const text =
    list.length === 1
      ? [
          t(c.lang, `${sp.name} — ${loc(sp.title, 'en')}, ${sp.organization}.`, `${sp.nameAr} — ${loc(sp.title, 'ar')}، ${sp.organization}.`),
          loc(sp.bio, c.lang),
          sessions.length
            ? t(c.lang, `Speaking in ${count(sessions.length, 'en', ['session', 'sessions'], ['', '', '', ''])}:`, `يشارك في ${count(sessions.length, 'ar', ['', ''], ['جلسة واحدة', 'جلستين', 'جلسات', 'جلسة'])}:`)
            : t(c.lang, 'No sessions are listed for this speaker yet.', 'لا توجد جلسات مدرجة لهذا المتحدث بعد.'),
        ].join(' ')
      : t(c.lang, `I found ${list.length} speakers with that name:`, `وجدت ${list.length} متحدثين بهذا الاسم:`);
  return {
    intent: 'speaker_detail',
    blocks: [
      { kind: 'text', text },
      { kind: 'speakers', ids: list.map((s) => s.id) },
      ...(sessions.length ? [{ kind: 'sessions', ids: sessions.map((s) => s.id) } as ReplyBlock] : []),
    ],
    context: { intent: 'speaker_detail', speakerIds: list.map((s) => s.id), sessionIds: sessions.map((s) => s.id) },
    suggestions: [
      t(c.lang, 'Which speakers are presenting tomorrow?', 'من المتحدثون غدًا؟'),
      t(c.lang, 'Recommend sessions about artificial intelligence', 'اقترح جلسات عن الذكاء الاصطناعي'),
    ],
  };
}

function sessionDetail(c: Ctx, list: Session[]): Draft {
  const s = list[0];
  const hall = sessionHall(c, s);
  const names = s.speakerIds.map((id) => speaker(c.data, id)).filter(Boolean).map((sp) => (c.lang === 'ar' ? sp!.nameAr : sp!.name));
  const text =
    list.length === 1
      ? [
          `“${loc(s.title, c.lang)}” — ${dayName(c, s.dayIndex)}, ${formatTime(s.start, c.lang)}–${formatTime(s.end, c.lang)}, ${loc(stageOf(c.data, s.stageId)?.name, c.lang)} (${loc(hall?.name, c.lang)}).`,
          names.length ? t(c.lang, `With ${joinList(names, 'en')}.`, `بمشاركة ${joinList(names, 'ar')}.`) : '',
          loc(s.description, c.lang),
        ]
          .filter(Boolean)
          .join(' ')
      : t(c.lang, 'These sessions match:', 'هذه الجلسات مطابقة:');
  return {
    intent: 'session_detail',
    blocks: [
      { kind: 'text', text },
      { kind: 'sessions', ids: list.map((x) => x.id) },
    ],
    context: { intent: 'session_detail', sessionIds: list.map((x) => x.id), speakerIds: s.speakerIds, hallId: hall?.id, dayIndex: s.dayIndex },
    suggestions: [
      s.speakerIds.length ? t(c.lang, 'Who is speaking?', 'من المتحدثون؟') : '',
      t(c.lang, 'What else is on that day?', 'ماذا يوجد أيضًا في ذلك اليوم؟'),
    ].filter(Boolean),
  };
}

function hallAnswer(c: Ctx, h: Hall): Draft {
  const exCount = c.data.exhibitors.filter((e) => e.hallId === h.id).length;
  const stages = c.data.stages.filter((s) => s.hallId === h.id).map((s) => loc(s.name, c.lang));
  const text = [
    t(c.lang, `${loc(h.name, 'en')} is the ${loc(h.theme, 'en')} hall.`, `${loc(h.name, 'ar')} مخصصة لـ${loc(h.theme, 'ar')}.`),
    loc(h.access, c.lang),
    t(
      c.lang,
      `It has ${count(exCount, 'en', ['exhibitor', 'exhibitors'], ['', '', '', ''])}${stages.length ? ` and the ${joinList(stages, 'en')}` : ''}.`,
      `تضم ${count(exCount, 'ar', ['', ''], ['عارضًا واحدًا', 'عارضَين', 'عارضين', 'عارضًا'])}${stages.length ? ` و${joinList(stages, 'ar')}` : ''}.`,
    ),
  ].join(' ');
  return {
    intent: 'hall',
    blocks: [
      { kind: 'text', text },
      { kind: 'hall', id: h.id },
    ],
    context: { intent: 'hall', hallId: h.id },
    suggestions: [
      t(c.lang, `Show exhibitors in ${loc(h.name, 'en')}`, `اعرض العارضين في ${loc(h.name, 'ar')}`),
      stages.length ? t(c.lang, `What's on in ${loc(h.name, 'en')} today?`, `ما فعاليات ${loc(h.name, 'ar')} اليوم؟`) : '',
      t(c.lang, 'Where are the restrooms?', 'أين دورات المياه؟'),
    ].filter(Boolean),
  };
}

function standAnswer(c: Ctx): Draft {
  const { hall: n, slot } = c.q.stand!;
  const code = `H${n}-${pad2(slot)}`;
  const h = hallByNumber(c.data, n);
  if (!h || slot < 1 || slot > h.standCount) {
    return {
      intent: 'stand',
      answered: false,
      blocks: [{ kind: 'text', text: t(c.lang, `Stand ${code} doesn't exist on the ${loc(c.data.info.name, 'en')} floorplan.`, `الجناح ${code} غير موجود في مخطط ${loc(c.data.info.name, 'ar')}.`) }],
      suggestions: [t(c.lang, 'Show the exhibitor directory', 'اعرض دليل العارضين')],
    };
  }
  const e = c.data.exhibitors.find((x) => x.stand.toUpperCase() === code);
  if (e) {
    const d = exhibitorDetail(c, [e]);
    return { ...d, intent: 'stand' };
  }
  return {
    intent: 'stand',
    blocks: [
      { kind: 'text', text: t(c.lang, `Stand ${code} is in ${loc(h.name, 'en')} (${loc(h.theme, 'en')}), but no exhibitor is listed on it.`, `الجناح ${code} يقع في ${loc(h.name, 'ar')} (${loc(h.theme, 'ar')})، لكن لا يوجد عارض مدرج عليه.`) },
      { kind: 'hall', id: h.id },
    ],
    context: { intent: 'hall', hallId: h.id },
  };
}

const FACILITY_GROUPS: Partial<Record<FacilityType, FacilityType[]>> = {
  restroom: ['restroom', 'accessibility'],
  food: ['food', 'cafe'],
  cafe: ['cafe', 'food'],
  entrance: ['entrance', 'taxi', 'parking'],
};

function facilityAnswer(c: Ctx): Draft {
  const type = c.q.facility!;
  const types = FACILITY_GROUPS[type] ?? [type];
  let found = c.data.facilities.filter((f) => types.includes(f.type)).sort((a, b) => types.indexOf(a.type) - types.indexOf(b.type));
  if (c.q.hall) {
    const h = hallByNumber(c.data, c.q.hall);
    const inHall = found.filter((f) => f.zone === h?.id);
    if (inHall.length) found = inHall;
  }
  if (!found.length) {
    return {
      intent: 'facility',
      answered: false,
      blocks: [{ kind: 'text', text: t(c.lang, "That facility isn't listed in the venue information. Please ask at the information desk.", 'هذه الخدمة غير مدرجة في معلومات المكان. يرجى السؤال في مكتب المعلومات.') }],
      ...withInfoDesk(c),
    };
  }
  const lines = found.map((f) => `${loc(f.name, c.lang)}: ${loc(f.location, c.lang)}`);
  return {
    intent: 'facility',
    blocks: [
      { kind: 'text', text: lines.join('\n') },
      { kind: 'facilities', ids: found.map((f) => f.id) },
    ],
    context: { intent: 'facility' },
    suggestions: [t(c.lang, 'What time does the exhibition close?', 'متى يغلق المعرض؟'), t(c.lang, 'Where is the prayer room?', 'أين المصلى؟')],
  };
}

function withInfoDesk(c: Ctx): Pick<Draft, 'blocks'> | object {
  const desk = c.data.facilities.find((f) => f.type === 'info');
  return desk ? { blocks: [{ kind: 'facilities', ids: [desk.id] }] } : {};
}

function hoursAnswer(c: Ctx): Draft {
  const days = c.data.info.days;
  const target = c.q.day ? resolveDay(c, c.q.day) : c.clock.dayIndex;
  if (target < 0 || target >= days.length) return outsideDays(c, 'hours');
  const d = days[target];
  const asksClose = /close|closing|until|يغلق|تغلق|اغلاق|الاغلاق|حتي/.test(c.q.norm);
  const text = asksClose
    ? t(c.lang, `On ${dayName(c, target)} the exhibition closes at ${formatTime(d.close, 'en')} (open from ${formatTime(d.open, 'en')}).`, `يغلق المعرض في ${dayName(c, target)} الساعة ${formatTime(d.close, 'ar')} (يفتح من الساعة ${formatTime(d.open, 'ar')}).`)
    : t(c.lang, `On ${dayName(c, target)} the halls are open ${formatTime(d.open, 'en')}–${formatTime(d.close, 'en')}.`, `في ${dayName(c, target)} تفتح القاعات من ${formatTime(d.open, 'ar')} حتى ${formatTime(d.close, 'ar')}.`);
  return {
    intent: 'hours',
    blocks: [...(c.q.day?.kind === 'relative' || !c.q.day ? clockNotice(c) : []), { kind: 'text', text }, { kind: 'hours', dayIndexes: days.map((_, i) => i) }],
    context: { intent: 'hours', dayIndex: target },
    suggestions: [t(c.lang, 'What events are happening today?', 'ما الفعاليات المقامة اليوم؟'), t(c.lang, 'Where is the food court?', 'أين ساحة المطاعم؟')],
  };
}

function outsideDays(c: Ctx, intent: Intent): Draft {
  const days = c.data.info.days;
  const first = days[0];
  const last = days[days.length - 1];
  return {
    intent,
    blocks: [
      ...clockNotice(c),
      {
        kind: 'text',
        text: t(
          c.lang,
          `The event runs from ${formatDate(first.date, 'en')} to ${formatDate(last.date, 'en')}, so there's nothing scheduled on that day.`,
          `تقام الفعالية من ${formatDate(first.date, 'ar')} إلى ${formatDate(last.date, 'ar')}، لذلك لا يوجد شيء مجدول في ذلك اليوم.`,
        ),
      },
      { kind: 'hours', dayIndexes: days.map((_, i) => i) },
    ],
    context: { intent },
  };
}

interface SessionFilter {
  day?: number;
  cats: string[];
  content: string[];
  hallId?: string;
}

function sessionFilter(c: Ctx): SessionFilter | 'outside' {
  let day: number | undefined;
  if (c.q.day) {
    day = resolveDay(c, c.q.day);
    if (day < 0 || day >= c.data.info.days.length) return 'outside';
  } else if (c.q.time === 'now' || c.q.time === 'next') day = c.clock.dayIndex;
  const hall = c.q.hall ? hallByNumber(c.data, c.q.hall) : undefined;
  // Leftover words like "interesting" shouldn't empty a list that a day or hall already defines.
  const narrowed = day !== undefined || Boolean(c.q.time) || Boolean(hall);
  const content = narrowed && !rank(c.idx.sessions, c.content, 1.2).length ? [] : c.content;
  return { day, cats: c.cats, content, hallId: hall?.id };
}

function filterSessions(c: Ctx, f: SessionFilter): Session[] {
  let list = c.data.sessions.slice();
  if (f.day !== undefined) list = list.filter((s) => s.dayIndex === f.day);
  if (f.hallId) list = list.filter((s) => sessionHall(c, s)?.id === f.hallId);
  if (c.q.time) {
    const now = minutes(c.clock.time);
    const today = f.day === c.clock.dayIndex;
    list = list.filter((s) => {
      const a = minutes(s.start);
      const b = minutes(s.end);
      switch (c.q.time) {
        case 'now':
          return today && a <= now && now < b;
        case 'next':
          return !today || a > now;
        case 'morning':
          return a < 12 * 60;
        case 'afternoon':
          return a >= 12 * 60 && a < 17 * 60;
        case 'evening':
          return a >= 17 * 60;
        default:
          return true;
      }
    });
  }
  if (f.cats.length) list = list.filter((s) => s.topics.some((tp) => f.cats.includes(tp)));
  else if (f.content.length) {
    const ranked = rank(c.idx.sessions, f.content, 1.2);
    const top = ranked[0]?.score ?? 0;
    const keep = new Set(ranked.filter((r) => r.score >= top * 0.4).map((r) => r.id));
    list = list.filter((s) => keep.has(s.id));
  }
  return list.sort(sortSessions);
}

/** Upcoming sessions first (relative to the event clock), earlier ones after. */
function upcomingFirst(c: Ctx, list: Session[]): Session[] {
  const now = c.clock.dayIndex * 1440 + minutes(c.clock.time);
  const at = (s: Session) => s.dayIndex * 1440 + minutes(s.end);
  return [...list.filter((s) => at(s) > now), ...list.filter((s) => at(s) <= now)];
}

function describeFilter(c: Ctx, f: SessionFilter): { en: string; ar: string } {
  const en: string[] = [];
  const ar: string[] = [];
  if (f.cats.length) {
    const names = f.cats.map((id) => category(c.data, id)).filter(Boolean);
    en.push(`about ${joinList(names.map((x) => loc(x!.name, 'en')), 'en')}`);
    ar.push(`عن ${joinList(names.map((x) => loc(x!.name, 'ar')), 'ar')}`);
  } else if (f.content.length) {
    en.push(`matching “${shownTerms(c)}”`);
    ar.push(`مطابقة لـ«${shownTerms(c)}»`);
  }
  if (f.hallId) {
    const h = hallOf(c.data, f.hallId);
    en.push(`in ${loc(h?.name, 'en')}`);
    ar.push(`في ${loc(h?.name, 'ar')}`);
  }
  if (f.day !== undefined) {
    en.push(`on ${dayName({ ...c, lang: 'en' }, f.day)}`);
    ar.push(`في ${dayName({ ...c, lang: 'ar' }, f.day)}`);
  }
  if (c.q.time === 'now') {
    en.push('right now');
    ar.push('الآن');
  } else if (c.q.time === 'next') {
    en.push('coming up');
    ar.push('القادمة');
  } else if (c.q.time) {
    const map = { morning: ['in the morning', 'صباحًا'], afternoon: ['in the afternoon', 'بعد الظهر'], evening: ['in the evening', 'مساءً'] } as const;
    en.push(map[c.q.time][0]);
    ar.push(map[c.q.time][1]);
  }
  return { en: en.join(' '), ar: ar.join(' ') };
}

function sessionSearch(c: Ctx): Draft {
  const f = sessionFilter(c);
  if (f === 'outside') return outsideDays(c, 'session_search');
  let list = filterSessions(c, f);
  const recommending = /recommend|suggest|should i|best|اقترح|انصح|توصي|ترشح/.test(c.q.norm) || f.day === undefined;
  if (recommending) list = upcomingFirst(c, list);
  if (c.q.time === 'next') list = list.slice(0, 3);
  const desc = describeFilter(c, f);
  const notice = usesClock(c.q) ? clockNotice(c) : [];

  if (!list.length) {
    // Point to other days that do have matching sessions instead of a dead end.
    const otherDays = f.day !== undefined ? [...new Set(filterSessions(c, { ...f, day: undefined }).map((s) => s.dayIndex))] : [];
    const hint = otherDays.length
      ? t(c.lang, ` There ${otherDays.length === 1 ? 'is' : 'are'} matching sessions on ${joinList(otherDays.map((d) => dayName({ ...c, lang: 'en' }, d)), 'en')}.`, ` توجد جلسات مطابقة في ${joinList(otherDays.map((d) => dayName({ ...c, lang: 'ar' }, d)), 'ar')}.`)
      : '';
    return {
      intent: 'session_search',
      answered: Boolean(f.day !== undefined || c.q.time) && !f.content.length,
      blocks: [...notice, { kind: 'text', text: t(c.lang, `I couldn't find any sessions ${desc.en} in the programme.${hint}`, `لم أجد أي جلسات ${desc.ar} في البرنامج.${hint}`) }],
      context: { intent: 'session_search', dayIndex: f.day, categoryId: f.cats[0] },
      suggestions: [t(c.lang, 'What events are happening today?', 'ما الفعاليات المقامة اليوم؟'), t(c.lang, 'Show the full programme', 'اعرض البرنامج كاملاً')],
    };
  }

  const lead = recommending && (f.cats.length || f.content.length)
    ? t(c.lang, `I recommend ${count(list.length, 'en', ['session', 'sessions'], ['', '', '', ''])} ${desc.en}:`, `أقترح ${count(list.length, 'ar', ['', ''], ['جلسة واحدة', 'جلستين', 'جلسات', 'جلسة'])} ${desc.ar}:`)
    : t(c.lang, `${count(list.length, 'en', ['session', 'sessions'], ['', '', '', ''])} ${desc.en}:`.replace(/^./, (x) => x.toUpperCase()), `${count(list.length, 'ar', ['', ''], ['جلسة واحدة', 'جلستان', 'جلسات', 'جلسة'])} ${desc.ar}:`);
  return {
    intent: 'session_search',
    blocks: [...notice, { kind: 'text', text: lead.replace(/\s+:/, ':') }, { kind: 'sessions', ids: list.map((s) => s.id) }],
    context: { intent: 'session_search', sessionIds: list.map((s) => s.id), dayIndex: f.day, categoryId: f.cats[0], speakerIds: [...new Set(list.flatMap((s) => s.speakerIds))] },
    suggestions: [
      f.day === c.clock.dayIndex ? t(c.lang, 'What about tomorrow?', 'وماذا عن الغد؟') : t(c.lang, 'What events are happening today?', 'ما الفعاليات المقامة اليوم؟'),
      t(c.lang, 'Who is speaking?', 'من المتحدثون؟'),
      !f.cats.includes('ai') && c.data.categories.some((x) => x.id === 'ai') ? t(c.lang, 'Recommend sessions about artificial intelligence', 'اقترح جلسات عن الذكاء الاصطناعي') : '',
    ].filter(Boolean),
  };
}

function speakerSearch(c: Ctx): Draft {
  // "Who is speaking?" right after a session answer → that session's speakers.
  const bare = !c.q.day && !c.q.time && !c.cats.length && !c.content.length && !c.q.hall;
  if (bare && c.prev.sessionIds?.length) {
    const sessions = c.prev.sessionIds.map((id) => session(c.data, id)).filter(Boolean) as Session[];
    const ids = [...new Set(sessions.flatMap((s) => s.speakerIds))];
    if (ids.length)
      return {
        intent: 'speaker_search',
        blocks: [
          { kind: 'text', text: t(c.lang, 'These are the speakers for those sessions:', 'هؤلاء هم متحدثو هذه الجلسات:') },
          { kind: 'speakers', ids },
        ],
        context: { ...c.prev, intent: 'speaker_search', speakerIds: ids },
      };
  }

  const f = sessionFilter(c);
  if (f === 'outside') return outsideDays(c, 'speaker_search');
  let ids: string[];
  let sessions: Session[] = [];
  if (bare) ids = c.data.speakers.map((s) => s.id);
  else if (f.day === undefined && !c.q.time && !f.cats.length && f.content.length) {
    ids = rank(c.idx.speakers, f.content, 1.2).map((r) => r.id);
  } else {
    sessions = filterSessions(c, f);
    ids = [...new Set(sessions.flatMap((s) => s.speakerIds))];
    if (f.cats.length && f.day === undefined) {
      // Topic experts without a session that day still count.
      for (const s of c.data.speakers) if (s.topics.some((x) => f.cats.includes(x)) && !ids.includes(s.id)) ids.push(s.id);
    }
  }
  const desc = describeFilter(c, f);
  const notice = usesClock(c.q) ? clockNotice(c) : [];
  if (!ids.length) {
    return {
      intent: 'speaker_search',
      answered: !f.content.length,
      blocks: [...notice, { kind: 'text', text: t(c.lang, `No speakers are listed ${desc.en || 'for that'}.`, `لا يوجد متحدثون مدرجون ${desc.ar || 'لهذا الطلب'}.`) }],
      context: { intent: 'speaker_search', dayIndex: f.day },
      suggestions: [t(c.lang, 'Show all speakers', 'اعرض جميع المتحدثين')],
    };
  }
  const lead = bare
    ? t(c.lang, `All ${ids.length} speakers:`, `جميع المتحدثين (${ids.length}):`)
    : t(c.lang, `${count(ids.length, 'en', ['speaker', 'speakers'], ['', '', '', ''])} ${f.day !== undefined || c.q.time ? 'presenting' : ''} ${desc.en}:`.replace(/^./, (x) => x.toUpperCase()), `${count(ids.length, 'ar', ['', ''], ['متحدث واحد', 'متحدثان', 'متحدثين', 'متحدثًا'])} ${desc.ar}:`);
  return {
    intent: 'speaker_search',
    blocks: [
      ...notice,
      { kind: 'text', text: lead.replace(/\s+/g, ' ').replace(/\s+:/, ':') },
      { kind: 'speakers', ids },
      ...(sessions.length && sessions.length <= PAGE ? [{ kind: 'sessions', ids: sessions.map((s) => s.id) } as ReplyBlock] : []),
    ],
    context: { intent: 'speaker_search', speakerIds: ids, sessionIds: sessions.map((s) => s.id), dayIndex: f.day, categoryId: f.cats[0] },
    suggestions: [
      f.day === c.clock.dayIndex + 1 ? t(c.lang, 'What about today?', 'وماذا عن اليوم؟') : t(c.lang, 'Which speakers are presenting tomorrow?', 'من المتحدثون غدًا؟'),
      t(c.lang, 'Recommend sessions about artificial intelligence', 'اقترح جلسات عن الذكاء الاصطناعي'),
    ],
  };
}

function exhibitorSearch(c: Ctx): Draft {
  const hall = c.q.hall ? hallByNumber(c.data, c.q.hall) : undefined;
  if (c.q.hall && !hall) return noSuchHall(c);
  let list: Exhibitor[] = c.data.exhibitors.slice();
  if (hall) list = list.filter((e) => e.hallId === hall.id);

  // Terms left after removing the matched category words, e.g. "AI companies from Japan" → "japan".
  const catTokens = new Set(c.cats.flatMap((id) => c.idx.categories.find((x) => x.id === id)?.phrases.flat() ?? []));
  const extra = c.content.filter((x) => !catTokens.has(x));
  let unmatched = false;

  if (c.cats.length) {
    const all = list.filter((e) => e.categoryIds.some((id) => c.cats.includes(id)));
    const both = c.cats.length > 1 ? all.filter((e) => c.cats.every((id) => e.categoryIds.includes(id))) : [];
    list = both.length ? both : all;
    if (extra.length) {
      const keep = new Set(rank(c.idx.exhibitors, extra, 1).map((r) => r.id));
      const narrowed = list.filter((e) => keep.has(e.id));
      if (narrowed.length) list = narrowed;
    }
    const order = new Map(rank(c.idx.exhibitors, c.content, 0).map((r, i) => [r.id, i]));
    list.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
  } else if (c.content.length) {
    const ranked = rank(c.idx.exhibitors, c.content, 1.5);
    const top = ranked[0]?.score ?? 0;
    const ids = ranked.filter((r) => r.score >= top * 0.35).map((r) => r.id);
    const allowed = new Set(list.map((e) => e.id));
    list = ids.filter((id) => allowed.has(id)).map((id) => exhibitor(c.data, id)!);
    unmatched = !list.length;
  } else if (!hall) {
    return directory(c);
  }

  const what = c.cats.length
    ? { en: joinList(c.cats.map((id) => loc(category(c.data, id)?.name, 'en')), 'en'), ar: joinList(c.cats.map((id) => loc(category(c.data, id)?.name, 'ar')), 'ar') }
    : c.content.length
      ? { en: `“${shownTerms(c)}”`, ar: `«${shownTerms(c)}»` }
      : null;
  const where = hall ? { en: ` in ${loc(hall.name, 'en')}`, ar: ` في ${loc(hall.name, 'ar')}` } : { en: '', ar: '' };

  if (!list.length) {
    const cats = c.data.categories.slice(0, 4).map((x) => loc(x.name, c.lang));
    return {
      intent: 'exhibitor_search',
      answered: false,
      blocks: [
        {
          kind: 'text',
          text: t(
            c.lang,
            `I couldn't find any exhibitor matching ${what?.en ?? 'that'}${where.en} in the exhibitor list. Try a product type or category, such as ${joinList(cats, 'en')}.`,
            `لم أجد أي عارض يطابق ${what?.ar ?? 'ذلك'}${where.ar} في قائمة العارضين. جرّب نوع منتج أو فئة مثل ${joinList(cats, 'ar')}.`,
          ),
        },
      ],
      context: { intent: 'exhibitor_search' },
      suggestions: [t(c.lang, 'Show the exhibitor directory', 'اعرض دليل العارضين'), ...c.data.categories.slice(0, 2).map((x) => t(c.lang, `Show ${loc(x.name, 'en')} exhibitors`, `اعرض عارضي ${loc(x.name, 'ar')}`))],
    };
  }
  void unmatched;

  const n = list.length;
  const lead = what
    ? t(c.lang, `${count(n, 'en', ['exhibitor', 'exhibitors'], ['', '', '', ''])} for ${what.en}${where.en}:`, `${count(n, 'ar', ['', ''], ['عارض واحد', 'عارضان', 'عارضين', 'عارضًا'])} في ${what.ar}${where.ar}:`)
    : t(c.lang, `${count(n, 'en', ['exhibitor', 'exhibitors'], ['', '', '', ''])}${where.en}:`, `${count(n, 'ar', ['', ''], ['عارض واحد', 'عارضان', 'عارضين', 'عارضًا'])}${where.ar}:`);
  const ids = list.map((e) => e.id);
  return {
    intent: 'exhibitor_search',
    blocks: [{ kind: 'text', text: lead }, { kind: 'exhibitors', ids, total: n }],
    context: { intent: 'exhibitor_search', exhibitorIds: ids, categoryId: c.cats[0], hallId: hall?.id },
    suggestions: [
      n === 1 ? t(c.lang, 'Where is their stand?', 'أين جناحهم؟') : t(c.lang, 'Tell me about the first one', 'أخبرني عن الأول'),
      c.cats[0] && c.data.sessions.some((s) => s.topics.includes(c.cats[0])) ? t(c.lang, `Sessions about ${loc(category(c.data, c.cats[0])?.name, 'en')}`, `جلسات عن ${loc(category(c.data, c.cats[0])?.name, 'ar')}`) : '',
      t(c.lang, 'Show the exhibitor directory', 'اعرض دليل العارضين'),
    ].filter(Boolean),
  };
}

function noSuchHall(c: Ctx): Draft {
  const names = c.data.halls.map((h) => loc(h.name, c.lang));
  return {
    intent: 'hall',
    answered: false,
    blocks: [{ kind: 'text', text: t(c.lang, `There's no Hall ${c.q.hall} at this event. The halls are ${joinList(names, 'en')}.`, `لا توجد القاعة ${c.q.hall} في هذه الفعالية. القاعات هي ${joinList(names, 'ar')}.`) }],
  };
}

function directory(c: Ctx): Draft {
  const hall = c.q.hall ? hallByNumber(c.data, c.q.hall) : undefined;
  const list = c.data.exhibitors
    .filter((e) => !hall || e.hallId === hall.id)
    .sort((a, b) => a.hallId.localeCompare(b.hallId) || a.stand.localeCompare(b.stand));
  return {
    intent: 'directory',
    blocks: [
      {
        kind: 'text',
        text: t(
          c.lang,
          `The exhibitor directory lists ${list.length} exhibitors${hall ? ` in ${loc(hall.name, 'en')}` : ` across ${c.data.halls.length} halls`}, sorted by stand:`,
          `يضم دليل العارضين ${list.length} عارضًا${hall ? ` في ${loc(hall.name, 'ar')}` : ` في ${c.data.halls.length} قاعات`}، مرتبين حسب رقم الجناح:`,
        ),
      },
      { kind: 'exhibitors', ids: list.map((e) => e.id), total: list.length },
    ],
    context: { intent: 'directory', exhibitorIds: list.map((e) => e.id), hallId: hall?.id },
    suggestions: [t(c.lang, 'Find robotics exhibitors', 'ابحث عن عارضي الروبوتات'), t(c.lang, 'Show AI companies', 'اعرض شركات الذكاء الاصطناعي')],
  };
}

function announcementsAnswer(c: Ctx): Draft {
  let list = c.data.announcements.slice();
  if (c.q.day) {
    const d = resolveDay(c, c.q.day);
    list = list.filter((a) => a.dayIndex === undefined || a.dayIndex === d);
  }
  list.sort((a, b) => Number(b.priority === 'important') - Number(a.priority === 'important'));
  if (!list.length)
    return { intent: 'announcements', blocks: [{ kind: 'text', text: t(c.lang, 'There are no announcements right now.', 'لا توجد إعلانات حاليًا.') }] };
  return {
    intent: 'announcements',
    blocks: [
      { kind: 'text', text: t(c.lang, `Latest announcements from the organiser (${list.length}):`, `آخر إعلانات المنظم (${list.length}):`) },
      { kind: 'announcements', ids: list.map((a) => a.id) },
    ],
    context: { intent: 'announcements' },
    suggestions: [t(c.lang, 'What time does the exhibition close?', 'متى يغلق المعرض؟'), t(c.lang, 'Where is the information desk?', 'أين مكتب المعلومات؟')],
  };
}

function eventInfo(c: Ctx): Draft {
  const i = c.data.info;
  const first = i.days[0];
  const last = i.days[i.days.length - 1];
  return {
    intent: 'event_info',
    blocks: [
      {
        kind: 'text',
        text: [
          `${loc(i.name, c.lang)} — ${loc(i.tagline, c.lang)}`,
          t(c.lang, `Dates: ${formatDate(first.date, 'en', false)} to ${formatDate(last.date, 'en', false)}.`, `التواريخ: من ${formatDate(first.date, 'ar', false)} إلى ${formatDate(last.date, 'ar', false)}.`),
          t(c.lang, `Venue: ${loc(i.venue, 'en')}, ${loc(i.city, 'en')}.`, `المكان: ${loc(i.venue, 'ar')}، ${loc(i.city, 'ar')}.`),
          loc(i.admission, c.lang),
        ].join('\n'),
      },
      { kind: 'hours', dayIndexes: i.days.map((_, x) => x) },
    ],
    context: { intent: 'event_info' },
    suggestions: [t(c.lang, 'Show the exhibitor directory', 'اعرض دليل العارضين'), t(c.lang, 'What events are happening today?', 'ما الفعاليات المقامة اليوم؟')],
  };
}

function contactAnswer(c: Ctx): Draft {
  const i = c.data.info;
  const desk = c.data.facilities.find((f) => f.type === 'info');
  const lines = [
    t(c.lang, `You can reach the ${loc(i.name, 'en')} organising team by email at ${i.contactEmail}`, `يمكنك التواصل مع الفريق المنظم لـ${loc(i.name, 'ar')} عبر البريد ${i.contactEmail}`) +
      (i.contactPhone ? t(c.lang, ` or by phone on ${i.contactPhone}.`, ` أو هاتفيًا على ${i.contactPhone}.`) : '.'),
    desk ? t(c.lang, `On site, visit the ${loc(desk.name, 'en')}: ${loc(desk.location, 'en')}`, `وفي الموقع، توجّه إلى ${loc(desk.name, 'ar')}: ${loc(desk.location, 'ar')}`) : '',
  ].filter(Boolean);
  return {
    intent: 'faq',
    blocks: [{ kind: 'text', text: lines.join('\n') }, ...(desk ? [{ kind: 'facilities', ids: [desk.id] } as ReplyBlock] : [])],
    context: { intent: 'faq' },
    suggestions: [t(c.lang, 'Any announcements?', 'هل توجد إعلانات؟'), t(c.lang, 'What time does the exhibition close?', 'متى يغلق المعرض؟')],
  };
}

function faqAnswer(c: Ctx, id: string): Draft {
  const f = c.data.faqs.find((x) => x.id === id)!;
  return {
    intent: 'faq',
    blocks: [{ kind: 'text', text: `${loc(f.answer, c.lang)}` }],
    context: { intent: 'faq' },
    suggestions: defaults(c).slice(0, 2),
  };
}

function defaults(c: Ctx): string[] {
  const own = c.suggested?.[c.lang];
  return own?.length ? own : defaultSuggestions(c.mode, c.lang);
}

export function defaultSuggestions(mode: AssistantMode, lang: Lang): string[] {
  const s = {
    visitor: [
      ['What events are happening today?', 'ما الفعاليات المقامة اليوم؟'],
      ['Where is Hall 3?', 'أين القاعة 3؟'],
      ['Recommend sessions about artificial intelligence', 'اقترح جلسات عن الذكاء الاصطناعي'],
      ['Where are the restrooms?', 'أين دورات المياه؟'],
    ],
    exhibitor: [
      ['Show AI companies', 'اعرض شركات الذكاء الاصطناعي'],
      ['Find robotics exhibitors', 'ابحث عن عارضي الروبوتات'],
      ['Which company offers automation technology?', 'أي شركة تقدم تقنيات الأتمتة؟'],
      ['Show the exhibitor directory', 'اعرض دليل العارضين'],
    ],
    organizer: [
      ['Any announcements?', 'هل توجد إعلانات؟'],
      ['What time does the exhibition close?', 'متى يغلق المعرض؟'],
      ['Is parking free?', 'هل المواقف مجانية؟'],
      ['Where is the information desk?', 'أين مكتب المعلومات؟'],
    ],
  } as const;
  return s[mode].map(([en, ar]) => (lang === 'ar' ? ar : en));
}

function help(c: Ctx, greeting: boolean): Draft {
  const name = loc(c.data.info.name, c.lang);
  const can = {
    visitor: t(c.lang, 'the programme, speakers, halls, facilities and opening hours', 'البرنامج والمتحدثين والقاعات والخدمات ومواعيد العمل'),
    exhibitor: t(c.lang, 'exhibitors, products, categories and stand locations', 'العارضين والمنتجات والفئات ومواقع الأجنحة'),
    organizer: t(c.lang, 'announcements, FAQs, opening hours and visitor support', 'الإعلانات والأسئلة الشائعة ومواعيد العمل ودعم الزوار'),
  }[c.mode];
  const text = t(
    c.lang,
    `${greeting ? 'Hello! ' : ''}I'm the ${name} assistant. Ask me about ${can} — in English or Arabic. I only answer from the official event information.`,
    `${greeting ? 'مرحبًا! ' : ''}أنا مساعد ${name}. اسألني عن ${can} بالعربية أو الإنجليزية. أجيب فقط من معلومات الفعالية الرسمية.`,
  );
  const important = c.mode === 'organizer' ? c.data.announcements.filter((a) => a.priority === 'important').map((a) => a.id) : [];
  return {
    intent: greeting ? 'greeting' : 'help',
    blocks: [{ kind: 'text', text }, ...(important.length ? [{ kind: 'announcements', ids: important } as ReplyBlock] : [])],
    suggestions: defaults(c),
  };
}

function unknown(c: Ctx): Draft {
  const desk = c.data.facilities.find((f) => f.type === 'info');
  const email = c.data.info.contactEmail;
  const searched = c.content.length ? shownTerms(c).slice(0, 60) : '';
  return {
    intent: 'unknown',
    answered: false,
    blocks: [
      {
        kind: 'text',
        text: t(
          c.lang,
          `${searched ? `I couldn't find “${searched}” among the exhibitors, sessions, speakers or FAQs. ` : ''}I don't have that information in the ${loc(c.data.info.name, 'en')} guide, so I won't guess. I can answer questions about exhibitors, sessions, speakers, halls, facilities and FAQs.${desk ? ` For anything else, ask at the ${loc(desk.name, 'en')} (${loc(desk.location, 'en')})` : ''} or email ${email}.`,
          `${searched ? `لم أجد «${searched}» ضمن العارضين أو الجلسات أو المتحدثين أو الأسئلة الشائعة. ` : ''}لا تتوفر لدي هذه المعلومة في دليل ${loc(c.data.info.name, 'ar')}، لذلك لن أخمّن. يمكنني الإجابة عن العارضين والجلسات والمتحدثين والقاعات والخدمات والأسئلة الشائعة.${desk ? ` لأي استفسار آخر، يرجى التوجه إلى ${loc(desk.name, 'ar')} (${loc(desk.location, 'ar')})` : ''} أو المراسلة على ${email}.`,
        ),
      },
    ],
    suggestions: defaults(c),
  };
}

/** Explain whatever the previous answer was about, in the requested language. */
function explainContext(c: Ctx): Draft | null {
  const p = c.prev;
  if (p.exhibitorIds?.length === 1) return exhibitorDetail(c, [exhibitor(c.data, p.exhibitorIds[0])!].filter(Boolean));
  if (p.intent === 'session_detail' && p.sessionIds?.length) return sessionDetail(c, p.sessionIds.map((id) => session(c.data, id)!).filter(Boolean));
  if (p.speakerIds?.length === 1) return speakerDetail(c, [speaker(c.data, p.speakerIds[0])!].filter(Boolean));
  if (p.intent === 'hall' && p.hallId) return hallAnswer(c, hallOf(c.data, p.hallId)!);
  return null;
}

function nth<T>(ids: string[] | undefined, n: number, get: (id: string) => T | undefined): T | undefined {
  const id = ids?.[n - 1];
  return id ? get(id) : undefined;
}

// ---------- routing ----------

function route(c: Ctx): Draft {
  const { q, prev } = c;
  const w = q.wants;

  // 1. Language switch ("Can you explain this product in Arabic?").
  if (q.langSwitch && !c.content.length && !q.stand && !q.hall && !q.facility) {
    const d = explainContext(c) ?? merge(help(c, false), eventInfo(c));
    return { ...d, intent: d.intent === 'help' ? 'language' : d.intent, switchLang: q.langSwitch };
  }

  // "What else is on that day?" — reuse the day of the previous answer.
  if (!q.day && prev.dayIndex !== undefined && /\b(that|same) day\b|ذلك اليوم|نفس اليوم/.test(q.norm)) {
    return sessionSearch({ ...c, q: { ...q, day: { kind: 'index', index: prev.dayIndex } }, content: [] });
  }

  // 2. Exact stand code.
  if (q.stand) return standAnswer(c);
  if (w.organiser) return contactAnswer(c);

  // 3. "Tell me about the second one" — refers to the previous list.
  if (q.ordinal) {
    const e = nth(prev.exhibitorIds, q.ordinal, (id) => exhibitor(c.data, id));
    if (e && prev.intent !== 'session_search' && prev.intent !== 'speaker_search') return exhibitorDetail(c, [e]);
    const s = nth(prev.sessionIds, q.ordinal, (id) => session(c.data, id));
    if (s && prev.intent === 'session_search') return sessionDetail(c, [s]);
    const sp = nth(prev.speakerIds, q.ordinal, (id) => speaker(c.data, id));
    if (sp) return speakerDetail(c, [sp]);
  }

  // 4. Named exhibitor or speaker.
  const exNames = matchNames(c.idx.exhibitorNames, q.tokens);
  const spNames = matchNames(c.idx.speakerNames, q.tokens, { partial: true });
  if (q.facility && !exNames.length) return facilityAnswer(c);
  if (exNames.length && (!spNames.length || exNames[0].score >= spNames[0].score)) {
    const top = exNames[0].score;
    return exhibitorDetail(c, exNames.filter((x) => x.score >= top * 0.9).map((x) => exhibitor(c.data, x.id)!));
  }
  if (spNames.length && spNames[0].score >= 0.5 && !(w.exhibitors && !w.speakers)) {
    const top = spNames[0].score;
    return speakerDetail(c, spNames.filter((x) => x.score >= top * 0.9).map((x) => speaker(c.data, x.id)!));
  }

  // 5. Session title match ("When is the keynote on digital twins?").
  const asksWhen = /\b(when is|when does|when will|what time is|what time does the)\b|متي/.test(q.norm);
  if ((asksWhen || (w.sessions && !c.cats.length)) && c.content.length && !q.day && !w.speakers && !(w.hours && !w.sessions)) {
    const ranked = rank(c.idx.sessions, c.content, 3);
    if (ranked.length && (ranked.length === 1 || ranked[0].score > ranked[1].score * 1.6)) return sessionDetail(c, [session(c.data, ranked[0].id)!]);
  }

  // 6. Opening hours (but "what time is the AI keynote" is a session question).
  if (w.hours && !w.sessions && !w.speakers && !c.cats.length && !(c.content.length && !q.hall)) return hoursAnswer(c);

  // 7. Halls.
  if (q.hall && !w.exhibitors && !w.sessions && !w.speakers && !w.directory && !c.cats.length) {
    const h = hallByNumber(c.data, q.hall);
    return h ? hallAnswer(c, h) : noSuchHall(c);
  }

  if (w.directory) return directory(c);
  if (w.announcements) return announcementsAnswer(c);
  if (w.speakers) return speakerSearch(c);
  if (w.sessions || q.time === 'now' || q.time === 'next') return sessionSearch(c);
  if (w.exhibitors || (q.hall && c.cats.length)) return exhibitorSearch(c);

  // 8. Follow-ups that lean on the previous answer.
  const followUp = w.location || w.map || w.contact || w.explain || q.refersBack;
  if (followUp && !c.cats.length && !c.content.length) {
    const d = explainContext(c);
    if (d) return d;
  }
  if (q.day && !c.content.length && !c.cats.length) {
    if (prev.intent === 'speaker_search' || prev.intent === 'speaker_detail') return speakerSearch({ ...c, cats: prev.categoryId ? [prev.categoryId] : [] });
    return sessionSearch({ ...c, cats: prev.categoryId ? [prev.categoryId] : [] });
  }
  if (w.more && prev.exhibitorIds && prev.exhibitorIds.length > PAGE) {
    const rest = prev.exhibitorIds.slice(PAGE);
    return {
      intent: prev.intent ?? 'exhibitor_search',
      blocks: [
        { kind: 'text', text: t(c.lang, `${rest.length} more:`, `${rest.length} إضافيون:`) },
        { kind: 'exhibitors', ids: rest, total: rest.length },
      ],
      context: { ...prev, exhibitorIds: rest },
    };
  }

  if (w.more && !c.content.length && (prev.exhibitorIds || prev.sessionIds || prev.speakerIds)) {
    return {
      intent: prev.intent ?? 'help',
      blocks: [{ kind: 'text', text: t(c.lang, "That's the complete list for your last question — there are no more results.", 'هذه هي القائمة الكاملة لسؤالك الأخير، ولا توجد نتائج أخرى.') }],
      context: prev,
    };
  }

  if (w.eventInfo && !c.content.length) return eventInfo(c);

  // 9. Category on its own ("drones", "الطاقة الشمسية").
  if (c.cats.length) {
    return c.mode === 'visitor' && c.data.sessions.some((s) => s.topics.some((x) => c.cats.includes(x)))
      ? merge(exhibitorSearch(c), sessionSearch(c))
      : exhibitorSearch(c);
  }

  // 10. FAQs and free text across everything.
  if (c.content.length) {
    const faq = rank(c.idx.faqs, c.content, 2.5)[0];
    const ex = rank(c.idx.exhibitors, c.content, 2.5)[0];
    const se = rank(c.idx.sessions, c.content, 2.5)[0];
    const best = Math.max(ex?.score ?? 0, se?.score ?? 0);
    if (faq && faq.score >= best * 0.8) return faqAnswer(c, faq.id);
    if (w.eventInfo) return eventInfo(c);
    if (ex && (!se || ex.score >= se.score || c.mode === 'exhibitor')) return exhibitorSearch(c);
    if (se) return sessionSearch(c);
  }

  if (w.eventInfo) return eventInfo(c);
  if (w.greeting || w.help || !q.norm) return help(c, w.greeting);
  if (w.location && w.map) return directory(c);
  return unknown(c);
}

/** Combine two answers (e.g. exhibitors + sessions for a bare topic). */
function merge(a: Draft, b: Draft): Draft {
  const ok = [a, b].filter((d) => d.answered !== false);
  if (ok.length < 2) return ok[0] ?? a;
  return {
    intent: a.intent,
    blocks: [...a.blocks, ...b.blocks],
    context: { ...b.context, ...a.context, sessionIds: b.context?.sessionIds },
    suggestions: [...new Set([...(a.suggestions ?? []), ...(b.suggestions ?? [])])].slice(0, 3),
  };
}

/**
 * Answer one visitor message from the event dataset.
 * Pure and synchronous: the same input always gives the same, data-backed answer.
 */
export function answer(message: string, opts: EngineOptions): AssistantReply {
  const raw = message.slice(0, MAX_QUESTION_LENGTH);
  const q = parse(raw);
  const lang = q.langSwitch ?? detectLang(raw, opts.uiLang);
  const idx = getIndex(opts.data);
  const content = contentTokens(q.tokens).filter((x) => !/^\d+$/.test(x) && !/^h\d/.test(x) && !NOISE.has(x));
  const c: Ctx = {
    q,
    lang,
    data: opts.data,
    idx,
    clock: eventClock(opts.data, opts.settings, opts.now),
    mode: opts.mode,
    suggested: opts.suggested,
    prev: opts.context ?? {},
    content,
    cats: matchCategories(idx, q.tokens),
  };

  // Halls can be named ("Partner Showcase", "القاعة الكبرى") as well as numbered.
  if (!q.hall && !q.stand) {
    const named = matchNames(idx.hallNames, q.tokens)[0];
    const hall = named && opts.data.halls.find((h) => h.id === named.id);
    if (hall) {
      c.q = { ...q, hall: hall.number };
      const nameTokens = new Set(idx.hallNames.find((h) => h.id === hall.id)!.phrases.flat());
      c.content = c.content.filter((x) => !nameTokens.has(x));
    }
  }

  // Facility words are not search terms once the facility is known.
  if (q.facility) c.content = [];

  const d = route(c);
  const suggestions = (d.suggestions?.length ? d.suggestions : defaults({ ...c, lang: d.switchLang ?? lang })).filter((s) => normalize(s) !== q.norm).slice(0, 3);
  return {
    intent: d.intent,
    lang: d.switchLang ?? lang,
    blocks: d.blocks,
    suggestions,
    answered: d.answered ?? true,
    context: { ...(d.context ?? {}), intent: d.context?.intent ?? d.intent },
    source: 'engine',
    switchLang: d.switchLang,
  };
}
