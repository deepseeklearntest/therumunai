import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { LocationStep } from "./LocationStep";
import { LanguageProvider, useLanguage } from "../../i18n/LanguageProvider";
import { en, ta } from "../../i18n/dictionaries";

function SetLang({ lang }: { lang: "en" | "ta" }) {
  const { setLang } = useLanguage();
  useEffect(() => {
    setLang(lang);
  }, [lang, setLang]);
  return null;
}

function renderWithLang(lang: "en" | "ta") {
  return render(
    <LanguageProvider>
      <SetLang lang={lang} />
      <LocationStep onLocationReady={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} />
    </LanguageProvider>
  );
}

describe("LocationStep", () => {
  it("renders English instructions", () => {
    renderWithLang("en");
    expect(screen.getByText(en.locationInstructions)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: en.locationFetchButton })).toBeInTheDocument();
  });

  it("renders Tamil instructions", () => {
    renderWithLang("ta");
    expect(screen.getByText(ta.locationInstructions)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ta.locationFetchButton })).toBeInTheDocument();
  });

  it("disables Next until a location is captured", () => {
    renderWithLang("en");
    expect(screen.getByRole("button", { name: en.locationNextButton })).toBeDisabled();
  });
});
