import type { EventDataset, Localized } from '@/types/event';
import { normalize, tokenMatch, tokens } from './normalize';

/** A searchable record: token → weight (already multiplied by IDF). */
interface Doc {
  id: string;
  weights: Map<string, number>;
}

interface NamePhrase {
  id: string;
  /** Each alternative name as a token list. */
  phrases: string[][];
}

export interface EngineIndex {
  data: EventDataset;
  exhibitors: Doc[];
  speakers: Doc[];
  sessions: Doc[];
  faqs: Doc[];
  categories: NamePhrase[];
  exhibitorNames: NamePhrase[];
  speakerNames: NamePhrase[];
  hallNames: NamePhrase[];
}

/**
 * Words that say *what kind* of thing is wanted rather than *which* one.
 * They steer intent detection but are dropped before ranking records.
 */
const META = new Set(
  tokens(
    'exhibitor exhibitors exhibiting company companies firm firms brand brands vendor vendors supplier suppliers stand stands booth booths speaker speakers presenter presenting presentation talk talks session sessions event events agenda schedule programme program happening hall halls recommend recommendation suggest offer offers offering provide provides sell sells technology technologies solution solutions product products today tomorrow day morning afternoon evening now next directory list map located location where find search show which who what about related topic topics interested best top good any explain describe information info details tell more ' +
      'عارض العارضين العارضون شركه شركات جناح اجنحه متحدث المتحدثين متحدثون جلسه جلسات فعاليه فعاليات برنامج جدول قاعه قاعات اقترح انصح توصيه تقدم يقدم توفر منتجات منتج تقنيه تقنيات حلول اليوم غدا بكره صباح مساء الان التالي دليل قائمه خريطه موقع وين اين ابحث عن حول مهتم افضل معلومات تفاصيل اشرح',
  ),
);

export function contentTokens(qTokens: string[]): string[] {
  return qTokens.filter((t) => !META.has(t));
}

function addText(map: Map<string, number>, text: string | undefined, weight: number) {
  if (!text) return;
  for (const t of tokens(text)) map.set(t, Math.max(map.get(t) ?? 0, weight));
}

function addLoc(map: Map<string, number>, text: Localized | undefined, weight: number) {
  if (!text) return;
  addText(map, text.en, weight);
  addText(map, text.ar, weight);
}

function applyIdf(docs: Doc[]): Doc[] {
  const df = new Map<string, number>();
  for (const d of docs) for (const t of d.weights.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const n = docs.length || 1;
  for (const d of docs) for (const [t, w] of d.weights) d.weights.set(t, w * Math.log(1 + n / (df.get(t) ?? 1)));
  return docs;
}

const cache = new WeakMap<EventDataset, EngineIndex>();

export function getIndex(data: EventDataset): EngineIndex {
  const hit = cache.get(data);
  if (hit) return hit;

  const catById = new Map(data.categories.map((c) => [c.id, c]));
  const addTopics = (map: Map<string, number>, ids: string[], weight: number) => {
    for (const id of ids) {
      const c = catById.get(id);
      if (c) {
        addLoc(map, c.name, weight);
        c.keywords.forEach((k) => addText(map, k, weight));
      } else addText(map, id, weight);
    }
  };
  const speakerById = new Map(data.speakers.map((s) => [s.id, s]));
  const stageById = new Map(data.stages.map((s) => [s.id, s]));

  const exhibitors = applyIdf(
    data.exhibitors.map((e) => {
      const w = new Map<string, number>();
      addText(w, e.name, 5);
      e.aliases.forEach((a) => addText(w, a, 5));
      addTopics(w, e.categoryIds, 2.5);
      e.products.forEach((p) => {
        addLoc(w, p.name, 3);
        addLoc(w, p.description, 1);
      });
      e.tags.forEach((t) => addText(w, t, 2));
      addLoc(w, e.description, 1);
      addLoc(w, e.country, 1);
      return { id: e.id, weights: w };
    }),
  );

  const speakers = applyIdf(
    data.speakers.map((s) => {
      const w = new Map<string, number>();
      addText(w, s.name, 5);
      addText(w, s.nameAr, 5);
      addText(w, s.organization, 3);
      addLoc(w, s.title, 1.5);
      addLoc(w, s.bio, 1);
      addTopics(w, s.topics, 2.5);
      return { id: s.id, weights: w };
    }),
  );

  const sessions = applyIdf(
    data.sessions.map((s) => {
      const w = new Map<string, number>();
      addLoc(w, s.title, 4);
      addLoc(w, s.description, 1.5);
      addTopics(w, s.topics, 2.5);
      s.speakerIds.forEach((id) => {
        const sp = speakerById.get(id);
        if (sp) {
          addText(w, sp.name, 2);
          addText(w, sp.nameAr, 2);
        }
      });
      addLoc(w, stageById.get(s.stageId)?.name, 1);
      return { id: s.id, weights: w };
    }),
  );

  const faqs = applyIdf(
    data.faqs.map((f) => {
      const w = new Map<string, number>();
      addLoc(w, f.question, 3);
      f.keywords.forEach((k) => addText(w, k, 3));
      addLoc(w, f.answer, 0.5);
      return { id: f.id, weights: w };
    }),
  );

  const phrase = (s: string) => tokens(s);
  const index: EngineIndex = {
    data,
    exhibitors,
    speakers,
    sessions,
    faqs,
    categories: data.categories.map((c) => ({
      id: c.id,
      phrases: [c.name.en, c.name.ar, ...c.keywords].map(phrase).filter((p) => p.length),
    })),
    exhibitorNames: data.exhibitors.map((e) => ({
      id: e.id,
      phrases: [e.name, ...e.aliases].map(phrase).filter((p) => p.length),
    })),
    hallNames: data.halls.map((h) => ({
      id: h.id,
      phrases: [h.name.en, h.name.ar].map(phrase).filter((p) => p.length),
    })),
    speakerNames: data.speakers.map((s) => ({
      id: s.id,
      phrases: [s.name, s.nameAr].map(phrase).filter((p) => p.length),
    })),
  };
  cache.set(data, index);
  return index;
}

export interface Scored {
  id: string;
  score: number;
}

/** Rank records by weighted token overlap with the query. */
export function rank(docs: Doc[], qTokens: string[], minScore = 0.5): Scored[] {
  if (!qTokens.length) return [];
  const out: Scored[] = [];
  for (const d of docs) {
    let score = 0;
    for (const q of qTokens) {
      let best = 0;
      for (const [t, w] of d.weights) {
        const m = tokenMatch(q, t);
        if (m && m * w > best) best = m * w;
      }
      score += best;
    }
    if (score >= minScore) out.push({ id: d.id, score });
  }
  return out.sort((a, b) => b.score - a.score);
}

/** Contiguous phrase match (with per-token fuzziness). Returns matched-token coverage 0..1. */
function phraseScore(q: string[], phrase: string[]): number {
  if (!phrase.length || phrase.length > q.length) return 0;
  for (let i = 0; i + phrase.length <= q.length; i++) {
    let ok = true;
    let total = 0;
    for (let j = 0; j < phrase.length; j++) {
      // Short words ("ai", "ev") must match exactly.
      const m = phrase[j].length <= 3 ? (q[i + j] === phrase[j] ? 1 : 0) : tokenMatch(q[i + j], phrase[j]);
      if (!m) {
        ok = false;
        break;
      }
      total += m;
    }
    if (ok) return total / phrase.length;
  }
  return 0;
}

/** Records whose name (or one of its aliases) appears in the query. */
export function matchNames(list: NamePhrase[], qTokens: string[], { partial = false } = {}): Scored[] {
  const out: Scored[] = [];
  for (const item of list) {
    let best = 0;
    for (const p of item.phrases) {
      const full = phraseScore(qTokens, p);
      if (full) best = Math.max(best, full * (1 + p.length * 0.1));
      // Partial: a distinctive single name token (e.g. a surname or the first word of a brand).
      else if (partial)
        for (const t of p) if (t.length >= 4 && qTokens.some((q) => tokenMatch(q, t) >= 0.8)) best = Math.max(best, 0.5);
    }
    if (best > 0) out.push({ id: item.id, score: best });
  }
  return out.sort((a, b) => b.score - a.score);
}

export function matchCategories(index: EngineIndex, qTokens: string[]): string[] {
  const scored = index.categories
    .map((c) => ({ id: c.id, score: Math.max(0, ...c.phrases.map((p) => phraseScore(qTokens, p) * p.length)) }))
    .filter((c) => c.score >= 0.8)
    .sort((a, b) => b.score - a.score);
  return scored.map((c) => c.id);
}

export function normalizedQuery(text: string): string {
  return normalize(text);
}
