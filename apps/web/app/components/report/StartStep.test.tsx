import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StartStep } from "./StartStep";
import { LanguageProvider, useLanguage } from "../../i18n/LanguageProvider";
import { en, ta } from "../../i18n/dictionaries";

function SetLang({ lang }: { lang: "en" | "ta" }) {
  const { setLang } = useLanguage();
  useEffect(() => {
    setLang(lang);
  }, [lang, setLang]);
  return null;
}

function renderWithLang(lang: "en" | "ta", onNext = vi.fn()) {
  return render(
    <LanguageProvider>
      <SetLang lang={lang} />
      <StartStep onNext={onNext} />
    </LanguageProvider>
  );
}

describe("StartStep", () => {
  it("renders the English tagline and CTA", () => {
    renderWithLang("en");
    expect(screen.getByText(en.tagline)).toBeInTheDocument();
    expect(screen.getByText(en.startInstructions)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: en.ctaReportIssue })).toBeInTheDocument();
  });

  it("renders the Tamil tagline and CTA", () => {
    renderWithLang("ta");
    expect(screen.getByText(ta.tagline)).toBeInTheDocument();
    expect(screen.getByText(ta.startInstructions)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ta.ctaReportIssue })).toBeInTheDocument();
  });

  it("calls onNext when the CTA is clicked", async () => {
    const onNext = vi.fn();
    renderWithLang("en", onNext);
    await userEvent.click(screen.getByRole("button", { name: en.ctaReportIssue }));
    expect(onNext).toHaveBeenCalledOnce();
  });
});
