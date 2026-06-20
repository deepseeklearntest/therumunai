"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../i18n/LanguageProvider";
import { listReports, type Category, type ReportListItem } from "../lib/api";
import { CATEGORY_OPTIONS } from "../lib/categories";
import { CategoryFilter } from "../components/map/CategoryFilter";

// MapLibre touches `window` at import time and the app is statically exported
// (next.config.mjs `output: "export"`, no SSR) — load it client-only.
const MapView = dynamic(() => import("../components/map/MapView").then((m) => m.MapView), {
  ssr: false,
});

const ALL_CATEGORIES: Category[] = CATEGORY_OPTIONS.map((option) => option.value);

type LoadState = "loading" | "loaded" | "error";

export default function MapPage() {
  const { t } = useLanguage();
  const [state, setState] = useState<LoadState>("loading");
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [selected, setSelected] = useState<Category[]>(ALL_CATEGORIES);

  useEffect(() => {
    let cancelled = false;
    listReports()
      .then((data) => {
        if (cancelled) return;
        setReports(data);
        setState("loaded");
      })
      .catch(() => {
        if (cancelled) return;
        setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleCategory(category: Category) {
    setSelected((current) =>
      current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category]
    );
  }

  const filteredReports = useMemo(
    () => reports.filter((report) => selected.includes(report.category)),
    [reports, selected]
  );

  // Bilingual category labels for the map popup — the raw `Category` enum
  // value (e.g. "garbage") must never reach the UI untranslated (HARD RULE 4).
  const categoryLabels = useMemo(
    () =>
      Object.fromEntries(
        CATEGORY_OPTIONS.map((option) => [option.value, t(option.labelKey)])
      ) as Record<Category, string>,
    [t]
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">{t("mapTitle")}</h1>

      {state === "loading" ? <p>{t("mapLoading")}</p> : null}
      {state === "error" ? <p role="alert">{t("mapError")}</p> : null}

      {state === "loaded" ? (
        <>
          <CategoryFilter selected={selected} onToggle={toggleCategory} />
          {reports.length === 0 ? (
            <p>{t("mapEmpty")}</p>
          ) : filteredReports.length === 0 ? (
            <p>{t("mapNoFilterMatch")}</p>
          ) : (
            <MapView
              reports={filteredReports}
              categoryLabels={categoryLabels}
              popupReportedOnLabel={t("mapPopupReportedOn")}
              popupZoneUnavailableLabel={t("mapPopupZoneUnavailable")}
            />
          )}
        </>
      ) : null}
    </div>
  );
}
