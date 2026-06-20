"use client";

import { useLanguage } from "../i18n/LanguageProvider";

export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => setLang(lang === "en" ? "ta" : "en")}
      aria-label={t("langToggleAria")}
      className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200"
    >
      {t("langToggleLabel")}
    </button>
  );
}
