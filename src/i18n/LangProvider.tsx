import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readJSON, writeJSON } from '@/services/storage';
import type { Lang } from '@/types/event';
import { STRINGS, type StringKey } from './strings';

interface LangValue {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang: (l: Lang) => void;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
}

const LangContext = createContext<LangValue | null>(null);

/** UI language for the whole app; mirrors lang/dir onto <html> so RTL applies everywhere. */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (readJSON<Lang>('lang', 'en') === 'ar' ? 'ar' : 'en'));

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    writeJSON('lang', l);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const value = useMemo<LangValue>(
    () => ({
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      setLang,
      t: (key, vars) => {
        let s: string = STRINGS[lang][key] ?? STRINGS.en[key];
        if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
        return s;
      },
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangValue {
  const v = useContext(LangContext);
  if (!v) throw new Error('useLang must be used inside LangProvider');
  return v;
}
