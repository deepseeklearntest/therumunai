import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { describe, expect, it } from "vitest";
import { MapViewLink } from "./MapViewLink";
import { LanguageProvider, useLanguage } from "../i18n/LanguageProvider";
import { en, ta } from "../i18n/dictionaries";

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
      <MapViewLink />
    </LanguageProvider>
  );
}

describe("MapViewLink", () => {
  it("renders an English link to /map", () => {
    renderWithLang("en");
    const link = screen.getByRole("link", { name: en.mapViewLink });
    expect(link).toHaveAttribute("href", "/map");
  });

  it("renders a Tamil link to /map", () => {
    renderWithLang("ta");
    const link = screen.getByRole("link", { name: ta.mapViewLink });
    expect(link).toHaveAttribute("href", "/map");
  });
});
