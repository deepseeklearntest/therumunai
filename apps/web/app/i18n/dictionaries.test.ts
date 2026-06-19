import { describe, expect, it } from "vitest";
import { en, ta } from "./dictionaries";

describe("i18n dictionaries", () => {
  it("have identical key sets", () => {
    const enKeys = Object.keys(en).sort();
    const taKeys = Object.keys(ta).sort();
    expect(taKeys).toEqual(enKeys);
  });

  it("have no empty string values in en", () => {
    for (const [key, value] of Object.entries(en)) {
      expect(value, `en.${key} should not be empty`).not.toBe("");
    }
  });

  it("have no empty string values in ta", () => {
    for (const [key, value] of Object.entries(ta)) {
      expect(value, `ta.${key} should not be empty`).not.toBe("");
    }
  });

  it("includes the verbatim disclosure text in English", () => {
    expect(en.disclosure).toBe(
      "Therumunai is an independent citizen-led civic initiative. We are not affiliated with the Greater Chennai Corporation (GCC), Coimbatore City Municipal Corporation (CCMC), or the Government of Tamil Nadu."
    );
  });
});
