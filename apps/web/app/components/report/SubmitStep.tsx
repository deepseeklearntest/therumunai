"use client";

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "../../i18n/LanguageProvider";
import { submitReport, ApiError, type Category, type SubmitReportResponse } from "../../lib/api";
import { DisclosureFooter } from "../DisclosureFooter";
import { CATEGORY_OPTIONS } from "./CategoryStep";
import type { Dictionary } from "../../i18n/dictionaries";

interface SubmitStepProps {
  category: Category;
  latitude: number;
  longitude: number;
  photoKey: string;
  photoPreviewUrl?: string;
  onBack: () => void;
  onSuccess: (result: SubmitReportResponse) => void;
  onReset: () => void;
  result?: SubmitReportResponse;
}

export function SubmitStep({
  category,
  latitude,
  longitude,
  photoKey,
  photoPreviewUrl,
  onBack,
  onSuccess,
  onReset,
  result,
}: SubmitStepProps) {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryLabelKey = CATEGORY_OPTIONS.find((c) => c.value === category)
    ?.labelKey as keyof Dictionary;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await submitReport({ category, latitude, longitude, photoKey });
      onSuccess(response);
    } catch (err) {
      if (err instanceof ApiError && err.errors?.length) {
        setError(err.errors.map((e) => e.message).join(" "));
      } else {
        setError(t("submitGenericError"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    // Out-of-boundary points legitimately resolve to city: "Other TN Region",
    // zone: null (HARD RULE 5 fallback). This MUST render as a normal success
    // screen, never as an error.
    return (
      <section aria-labelledby="success-title" className="flex flex-col gap-4 p-4">
        <h2 id="success-title" className="text-xl font-semibold text-green-700">
          {t("successTitle")}
        </h2>
        <p className="text-sm text-gray-700">{t("successMessage")}</p>
        <dl className="text-sm text-gray-700">
          <div className="flex justify-between border-b border-gray-100 py-2">
            <dt className="font-medium">{t("successCityLabel")}</dt>
            <dd>{result.city}</dd>
          </div>
          <div className="flex justify-between border-b border-gray-100 py-2">
            <dt className="font-medium">{t("successZoneLabel")}</dt>
            <dd>{result.zone ?? t("successZoneUnavailable")}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onReset}
          aria-label={t("successReportAnother")}
          className="rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white"
        >
          {t("successReportAnother")}
        </button>
        <DisclosureFooter />
      </section>
    );
  }

  return (
    <section aria-labelledby="submit-step-title" className="flex flex-col gap-4 p-4">
      <h2 id="submit-step-title" className="text-xl font-semibold">
        {t("submitReviewTitle")}
      </h2>

      {photoPreviewUrl ? (
        <Image
          src={photoPreviewUrl}
          alt={t("photoPreviewAlt")}
          width={400}
          height={160}
          unoptimized
          className="h-40 w-full rounded-md object-cover"
        />
      ) : null}

      <dl className="text-sm text-gray-700">
        <div className="flex justify-between border-b border-gray-100 py-2">
          <dt className="font-medium">{t("submitCategoryLabel")}</dt>
          <dd>{t(categoryLabelKey)}</dd>
        </div>
        <div className="flex justify-between border-b border-gray-100 py-2">
          <dt className="font-medium">{t("submitLocationLabel")}</dt>
          <dd>
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </dd>
        </div>
      </dl>

      {error ? (
        <div role="alert" className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-red-700">{t("submitErrorTitle")}</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : null}

      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          aria-label={t("submitBackButton")}
          className="flex-1 rounded-md border border-gray-300 px-4 py-3 text-base font-medium text-gray-700 disabled:opacity-40"
        >
          {t("submitBackButton")}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          aria-label={error ? t("submitErrorRetryButton") : t("submitButton")}
          className="flex-1 rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-40"
        >
          {submitting
            ? t("submitSubmittingLabel")
            : error
              ? t("submitErrorRetryButton")
              : t("submitButton")}
        </button>
      </div>
    </section>
  );
}
