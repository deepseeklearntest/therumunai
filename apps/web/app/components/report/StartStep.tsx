"use client";

import { useLanguage } from "../../i18n/LanguageProvider";

interface StartStepProps {
  onNext: () => void;
}

export function StartStep({ onNext }: StartStepProps) {
  const { t } = useLanguage();

  return (
    <section aria-labelledby="start-step-title" className="flex flex-col gap-4 p-4 text-center">
      <h2 id="start-step-title" className="text-2xl font-bold">
        {t("tagline")}
      </h2>
      <p className="text-sm text-gray-600">{t("startInstructions")}</p>
      <button
        type="button"
        onClick={onNext}
        aria-label={t("ctaReportIssue")}
        className="mt-2 rounded-md bg-blue-600 px-4 py-4 text-lg font-semibold text-white"
      >
        {t("ctaReportIssue")}
      </button>
    </section>
  );
}
