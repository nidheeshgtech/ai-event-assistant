import type { Lang } from '@/types/event';

const ARABIC_CHARS = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;
const TASHKEEL = /[ً-ٰٟۖ-ۭ]/g;
const ARABIC_DIGITS = /[٠-٩۰-۹]/g;

export function hasArabic(text: string): boolean {
  return ARABIC_CHARS.test(text);
}

/** Language the visitor wrote in; falls back to the UI language for digits-only input. */
export function detectLang(text: string, fallback: Lang): Lang {
  if (hasArabic(text)) return 'ar';
  return /[a-z]/i.test(text) ? 'en' : fallback;
}

/**
 * Canonical form used for matching: lower case, no diacritics, unified Arabic letter
 * variants (أ/إ/آ → ا, ى → ي, ة → ه), Western digits and single spaces.
 */
export function normalize(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(TASHKEEL, '')
    .replace(/ـ/g, '') // tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(ARABIC_DIGITS, (d) => String((d.charCodeAt(0) & 0xf) % 10))
    .replace(/[’'`]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_EN = new Set(
  'a an the is are was were be been am do does did can could would should will shall may might i me my we our you your it its they them their this that these those there here of in on at to for from by with about into over under and or but if then so as any some all please show tell give find list me what which who whom whose where when how why get see want need looking look know have has had like up out just also more other others than too very hi hello hey thanks thank ok okay'.split(
    ' ',
  ),
);

const STOP_AR = new Set(
  'في من الي علي عن مع هل ما ماذا متي اين كيف لماذا اي هو هي هم هذا هذه ذلك تلك هناك هنا ان او ثم كل بعض لي لنا لك انا نحن انت انتم عندي عندكم اريد ابحث ابغي ابي ممكن لو سمحت من فضلك اعرض اعطني اخبرني قل شو وين ايش يا مرحبا شكرا الذي التي و'.split(
    ' ',
  ),
);

export function isStopword(token: string): boolean {
  return STOP_EN.has(token) || STOP_AR.has(token);
}

/** Light stemming: English plurals/verb endings, Arabic article and conjunction prefixes. */
export function stem(token: string): string {
  if (hasArabic(token)) {
    let t = token;
    if (t.length > 3 && t.startsWith('و')) t = t.slice(1);
    for (const p of ['بال', 'لل', 'فال', 'كال', 'وال', 'ال']) {
      if (t.length - p.length >= 2 && t.startsWith(p)) {
        t = t.slice(p.length);
        break;
      }
    }
    if (t.length > 4) for (const s of ['ات', 'ون', 'ين', 'يه']) if (t.endsWith(s)) return t.slice(0, -s.length);
    return t;
  }
  if (token.length <= 3) return token;
  if (token.endsWith('ies') && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith('ing') && token.length > 5) return token.slice(0, -3);
  if (/(ss|us|is)$/.test(token)) return token;
  if (token.endsWith('es') && /(ch|sh|x|z)es$/.test(token)) return token.slice(0, -2);
  if (token.endsWith('s')) return token.slice(0, -1);
  return token;
}

/** Normalised, stemmed, stopword-free tokens. */
export function tokens(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter((t) => t && !isStopword(t))
    .map(stem)
    .filter((t) => t.length > 1 || /\d/.test(t));
}

/** Damerau-free Levenshtein distance capped at `max` (returns max + 1 when exceeded). */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      best = Math.min(best, cur[j]);
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/**
 * How well a query token matches an index token: 1 exact, 0.8 prefix, 0.6 one typo.
 * Short tokens only match exactly so "ai" never matches "air".
 */
export function tokenMatch(q: string, t: string): number {
  if (q === t) return 1;
  if (q.length >= 4 && t.length >= 4 && (t.startsWith(q) || q.startsWith(t))) return 0.8;
  if (q.length >= 5 && t.length >= 5 && editDistance(q, t, 1) <= 1) return 0.6;
  return 0;
}

/** Does the normalised text contain the phrase as whole words? */
export function hasPhrase(normText: string, phrase: string): boolean {
  const p = normalize(phrase);
  if (!p) return false;
  return ` ${normText} `.includes(` ${p} `);
}
