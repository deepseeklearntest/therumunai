"use client";

import { useLanguage } from "../../i18n/LanguageProvider";
import type { Category } from "../../lib/api";
import { CATEGORY_COLORS, CATEGORY_OPTIONS } from "../../lib/categories";

interface CategoryFilterProps {
  selected: Category[];
  onToggle: (category: Category) => void;
}

// Doubles as the map legend: each row pairs the category color used for pins
// with a checkbox driving which pins render.
export function CategoryFilter({ selected, onToggle }: CategoryFilterProps) {
  const { t } = useLanguage();

  return (
    <fieldset className="flex flex-col gap-2 rounded-md border border-gray-200 p-3">
      <legend className="px-1 text-sm font-semibold text-gray-700">
        {t("mapLegendTitle")}
      </legend>
      {CATEGORY_OPTIONS.map((option) => {
        const label = t(option.labelKey);
        const checked = selected.includes(option.value);
        return (
          <label key={option.value} className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(option.value)}
              aria-label={label}
              className="h-4 w-4"
            />
            <span
              data-testid={`category-swatch-${option.value}`}
              aria-hidden="true"
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[option.value] }}
            />
            {label}
          </label>
        );
      })}
    </fieldset>
  );
}
