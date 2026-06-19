"use client";

import { useLanguage } from "../../i18n/LanguageProvider";
import type { Category } from "../../lib/api";
import type { Dictionary } from "../../i18n/dictionaries";

interface CategoryStepProps {
  category?: Category;
  onSelectCategory: (category: Category) => void;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORY_OPTIONS: { value: Category; labelKey: keyof Dictionary }[] = [
  { value: "garbage", labelKey: "categoryGarbageLabel" },
  { value: "road", labelKey: "categoryRoadLabel" },
  { value: "streetlight", labelKey: "categoryStreetlightLabel" },
  { value: "drainage", labelKey: "categoryDrainageLabel" },
];

export function CategoryStep({
  category,
  onSelectCategory,
  onNext,
  onBack,
}: CategoryStepProps) {
  const { t } = useLanguage();

  return (
    <section aria-labelledby="category-step-title" className="flex flex-col gap-4 p-4">
      <h2 id="category-step-title" className="text-xl font-semibold">
        {t("stepCategoryTitle")}
      </h2>
      <p className="text-sm text-gray-600">{t("categoryInstructions")}</p>

      <div className="grid grid-cols-1 gap-3">
        {CATEGORY_OPTIONS.map((option) => {
          const label = t(option.labelKey);
          const selected = category === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectCategory(option.value)}
              aria-pressed={selected}
              aria-label={label}
              className={`min-h-[64px] rounded-md border-2 px-4 py-4 text-left text-base font-semibold ${
                selected
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-800"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("categoryBackButton")}
          className="flex-1 rounded-md border border-gray-300 px-4 py-3 text-base font-medium text-gray-700"
        >
          {t("categoryBackButton")}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!category}
          aria-label={t("categoryNextButton")}
          className="flex-1 rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-40"
        >
          {t("categoryNextButton")}
        </button>
      </div>
    </section>
  );
}

export { CATEGORY_OPTIONS };
