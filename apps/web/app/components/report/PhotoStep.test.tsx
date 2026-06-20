import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { PhotoStep } from "./PhotoStep";
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
      <PhotoStep onPhotoReady={vi.fn()} onNext={vi.fn()} />
    </LanguageProvider>
  );
}

describe("PhotoStep", () => {
  it("renders English instructions and privacy note", () => {
    renderWithLang("en");
    expect(screen.getByText(en.photoInstructions)).toBeInTheDocument();
    expect(screen.getByText(en.photoPrivacyNote)).toBeInTheDocument();
  });

  it("renders Tamil instructions and privacy note", () => {
    renderWithLang("ta");
    expect(screen.getByText(ta.photoInstructions)).toBeInTheDocument();
    expect(screen.getByText(ta.photoPrivacyNote)).toBeInTheDocument();
  });

  it("disables Next until a photo is chosen", () => {
    renderWithLang("en");
    const nextButton = screen.getByRole("button", { name: en.photoNextButton });
    expect(nextButton).toBeDisabled();
  });
});
