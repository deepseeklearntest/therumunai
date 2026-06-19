"use client";

import { en, ta } from "../i18n/dictionaries";
import { useLanguage } from "../i18n/LanguageProvider";

/**
 * Renders the verbatim Disclosure Footer text (CLAUDE.md HARD RULE 3) in the
 * current language. Included in the root layout so it appears on every view.
 */
export function DisclosureFooter() {
  const { lang } = useLanguage();
  const text = lang === "ta" ? ta.disclosure : en.disclosure;

  return (
    <footer className="border-t border-gray-200 bg-gray-50 px-4 py-4 text-center text-xs text-gray-600">
      <p>{text}</p>
    </footer>
  );
}
