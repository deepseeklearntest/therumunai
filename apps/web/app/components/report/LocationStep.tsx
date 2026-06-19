"use client";

import { useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";

interface LocationStepProps {
  latitude?: number;
  longitude?: number;
  onLocationReady: (latitude: number, longitude: number) => void;
  onNext: () => void;
  onBack: () => void;
}

type LocationErrorKind = "denied" | "unavailable" | null;

export function LocationStep({
  latitude,
  longitude,
  onLocationReady,
  onNext,
  onBack,
}: LocationStepProps) {
  const { t } = useLanguage();
  const [fetching, setFetching] = useState(false);
  const [errorKind, setErrorKind] = useState<LocationErrorKind>(null);

  function handleFetchLocation() {
    setFetching(true);
    setErrorKind(null);

    if (!("geolocation" in navigator)) {
      setFetching(false);
      setErrorKind("unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFetching(false);
        onLocationReady(position.coords.latitude, position.coords.longitude);
      },
      (geoError) => {
        setFetching(false);
        // GeolocationPositionError.PERMISSION_DENIED === 1
        setErrorKind(geoError.code === 1 ? "denied" : "unavailable");
      },
      { enableHighAccuracy: true }
    );
  }

  const hasLocation = typeof latitude === "number" && typeof longitude === "number";

  return (
    <section aria-labelledby="location-step-title" className="flex flex-col gap-4 p-4">
      <h2 id="location-step-title" className="text-xl font-semibold">
        {t("stepLocationTitle")}
      </h2>
      <p className="text-sm text-gray-600">{t("locationInstructions")}</p>

      {hasLocation ? (
        <p className="text-sm font-medium text-green-700">
          {t("locationCapturedLabel")}: {latitude!.toFixed(5)}, {longitude!.toFixed(5)}
        </p>
      ) : null}

      {errorKind === "denied" ? (
        <p role="alert" className="text-sm text-red-600">
          {t("locationDeniedMessage")}
        </p>
      ) : null}

      {errorKind === "unavailable" ? (
        <p role="alert" className="text-sm text-red-600">
          {t("locationUnavailableMessage")}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleFetchLocation}
        disabled={fetching}
        aria-label={errorKind ? t("locationRetryButton") : t("locationFetchButton")}
        className="rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-40"
      >
        {fetching
          ? t("locationFetchingLabel")
          : errorKind
            ? t("locationRetryButton")
            : t("locationFetchButton")}
      </button>

      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("locationBackButton")}
          className="flex-1 rounded-md border border-gray-300 px-4 py-3 text-base font-medium text-gray-700"
        >
          {t("locationBackButton")}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasLocation}
          aria-label={t("locationNextButton")}
          className="flex-1 rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-40"
        >
          {t("locationNextButton")}
        </button>
      </div>
    </section>
  );
}
