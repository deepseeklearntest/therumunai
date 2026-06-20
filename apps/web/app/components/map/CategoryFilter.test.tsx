import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CategoryFilter } from "./CategoryFilter";
import { LanguageProvider, useLanguage } from "../../i18n/LanguageProvider";
import { en, ta } from "../../i18n/dictionaries";
import { CATEGORY_COLORS } from "../../lib/categories";
import type { Category } from "../../lib/api";

function SetLang({ lang }: { lang: "en" | "ta" }) {
  const { setLang } = useLanguage();
  useEffect(() => {
    setLang(lang);
  }, [lang, setLang]);
  return null;
}

function renderWithLang(
  lang: "en" | "ta",
  selected: Category[] = ["garbage", "road", "streetlight", "drainage"],
  onToggle = vi.fn()
) {
  return render(
    <LanguageProvider>
      <SetLang lang={lang} />
      <CategoryFilter selected={selected} onToggle={onToggle} />
    </LanguageProvider>
  );
}

describe("CategoryFilter", () => {
  it("renders all 4 English category labels as checkboxes, all checked by default", () => {
    renderWithLang("en");
    for (const label of [
      en.categoryGarbageLabel,
      en.categoryRoadLabel,
      en.categoryStreetlightLabel,
      en.categoryDrainageLabel,
    ]) {
      expect(screen.getByRole("checkbox", { name: label })).toBeChecked();
    }
  });

  it("renders all 4 Tamil category labels", () => {
    renderWithLang("ta");
    for (const label of [
      ta.categoryGarbageLabel,
      ta.categoryRoadLabel,
      ta.categoryStreetlightLabel,
      ta.categoryDrainageLabel,
    ]) {
      expect(screen.getByRole("checkbox", { name: label })).toBeInTheDocument();
    }
  });

  it("calls onToggle with the category when its checkbox is clicked", async () => {
    const onToggle = vi.fn();
    renderWithLang("en", ["garbage", "road", "streetlight", "drainage"], onToggle);
    await userEvent.click(screen.getByRole("checkbox", { name: en.categoryRoadLabel }));
    expect(onToggle).toHaveBeenCalledWith("road");
  });

  it("reflects unselected categories as unchecked", () => {
    renderWithLang("en", ["garbage"]);
    expect(screen.getByRole("checkbox", { name: en.categoryGarbageLabel })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: en.categoryRoadLabel })).not.toBeChecked();
  });

  it("shows a color swatch matching CATEGORY_COLORS for each category", () => {
    renderWithLang("en");
    const swatch = screen.getByTestId("category-swatch-garbage");
    expect(swatch).toHaveStyle({ backgroundColor: CATEGORY_COLORS.garbage });
  });
});
