import { describe, expect, it } from "vitest";
import { CATEGORY_COLORS, CATEGORY_OPTIONS } from "./categories";

describe("CATEGORY_COLORS", () => {
  it("has a distinct hex color for every category in CATEGORY_OPTIONS", () => {
    const colors = CATEGORY_OPTIONS.map((option) => CATEGORY_COLORS[option.value]);

    for (const color of colors) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    }

    // Distinct so pins/legend are visually distinguishable.
    expect(new Set(colors).size).toBe(colors.length);
  });
});
