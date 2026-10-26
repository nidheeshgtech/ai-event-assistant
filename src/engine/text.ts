import type { Lang, Localized } from '@/types/event';

/** Pick the visitor's language from a localized record, falling back to English. */
export function loc(text: Localized | undefined, lang: Lang): string {
  if (!text) return '';
  return text[lang] || text.en;
}

/** Inline bilingual template. */
export function t(lang: Lang, en: string, ar: string): string {
  return lang === 'ar' ? ar : en;
}

/** "A, B and C" / "أ، ب و ج". */
export function joinList(items: string[], lang: Lang): string {
  if (items.length <= 1) return items.join('');
  const and = lang === 'ar' ? ' و' : ' and ';
  const sep = lang === 'ar' ? '، ' : ', ';
  return `${items.slice(0, -1).join(sep)}${and}${items[items.length - 1]}`;
}

/** Arabic plural forms for counted nouns (1, 2, 3–10, 11+). */
export function count(n: number, lang: Lang, en: [string, string], ar: [string, string, string, string]): string {
  if (lang === 'en') return `${n} ${n === 1 ? en[0] : en[1]}`;
  if (n === 1) return ar[0];
  if (n === 2) return ar[1];
  if (n >= 3 && n <= 10) return `${n} ${ar[2]}`;
  return `${n} ${ar[3]}`;
}
