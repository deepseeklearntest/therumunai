"use client";

import Link from "next/link";
import { useLanguage } from "../i18n/LanguageProvider";

export function MapViewLink() {
  const { t } = useLanguage();

  return (
    <Link
      href="/map"
      className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200"
    >
      {t("mapViewLink")}
    </Link>
  );
}
