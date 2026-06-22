"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dictionaries, type Dictionary, type Lang } from "./dictionaries";

const STORAGE_KEY = "therumunai-lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof Dictionary) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function isLang(value: string | null): value is Lang {
  return value === "en" || value === "ta";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Restore the persisted choice on mount. We deliberately only use
  // localStorage (no cookies, no analytics, no PII) per CLAUDE.md.
  // Deferred to an effect (rather than lazy useState init) so the static
  // export's prerendered "en" markup matches the first client render.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLang(stored)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional mount-only sync from localStorage, see comment above
        setLangState(stored);
      }
    } catch {
      // localStorage may be unavailable (private browsing); default stays "en".
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore persistence failures; in-memory state still updates.
    }
  }, []);

  const t = useCallback(
    (key: keyof Dictionary) => dictionaries[lang][key],
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
