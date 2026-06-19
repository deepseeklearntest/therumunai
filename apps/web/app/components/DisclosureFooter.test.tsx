import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DisclosureFooter } from "./DisclosureFooter";
import { LanguageProvider } from "../i18n/LanguageProvider";
import { en, ta } from "../i18n/dictionaries";

describe("DisclosureFooter", () => {
  it("renders the verbatim English disclosure by default", () => {
    render(
      <LanguageProvider>
        <DisclosureFooter />
      </LanguageProvider>
    );
    expect(screen.getByText(en.disclosure)).toBeInTheDocument();
  });

  it("dictionary holds a Tamil translation distinct from English", () => {
    expect(ta.disclosure).not.toBe(en.disclosure);
    expect(ta.disclosure.length).toBeGreaterThan(0);
  });
});
