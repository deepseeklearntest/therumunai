// Single source of truth for category metadata shared by the report flow and
// the map dashboard: the canonical option list (from CategoryStep) plus the
// color used for pins and the legend.

import type { Category } from "./api";
import { CATEGORY_OPTIONS } from "../components/report/CategoryStep";

export const CATEGORY_COLORS: Record<Category, string> = {
  garbage: "#d97706", // amber
  road: "#dc2626", // red
  streetlight: "#2563eb", // blue
  drainage: "#0d9488", // teal
};

export { CATEGORY_OPTIONS };
