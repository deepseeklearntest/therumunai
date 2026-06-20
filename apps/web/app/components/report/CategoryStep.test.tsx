import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CategoryStep } from "./CategoryStep";
import { LanguageProvider, useLanguage } from "../../i18n/LanguageProvider";
import { en, ta } from "../../i18n/dictionaries";

function SetLang({ lang }: { lang: "en" | "ta" }) {
  const { setLang } = useLanguage();
  useEffect(() => {
    setLang(lang);
  }, [lang, setLang]);
  return null;
}

function renderWithLang(lang: "en" | "ta", onSelectCategory = vi.fn()) {
  return render(
    <LanguageProvider>
      <SetLang lang={lang} />
      <CategoryStep onSelectCategory={onSelectCategory} onNext={vi.fn()} onBack={vi.fn()} />
    </LanguageProvider>
  );
}

describe("CategoryStep", () => {
  it("renders all 4 English category labels", () => {
    renderWithLang("en");
    expect(screen.getByRole("button", { name: en.categoryGarbageLabel })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: en.categoryRoadLabel })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: en.categoryStreetlightLabel })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: en.categoryDrainageLabel })).toBeInTheDocument();
  });

  it("renders all 4 Tamil category labels", () => {
    renderWithLang("ta");
    expect(screen.getByRole("button", { name: ta.categoryGarbageLabel })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ta.categoryRoadLabel })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ta.categoryStreetlightLabel })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ta.categoryDrainageLabel })).toBeInTheDocument();
  });

  it("calls onSelectCategory with the correct value", async () => {
    const onSelectCategory = vi.fn();
    renderWithLang("en", onSelectCategory);
    await userEvent.click(screen.getByRole("button", { name: en.categoryRoadLabel }));
    expect(onSelectCategory).toHaveBeenCalledWith("road");
  });
});
