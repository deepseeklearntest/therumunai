"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import { useLanguage } from "../../i18n/LanguageProvider";
import { getPresignedUrl, uploadPhoto, ApiError } from "../../lib/api";

interface PhotoStepProps {
  photoPreviewUrl?: string;
  onPhotoReady: (photoKey: string, previewUrl: string, file: File) => void;
  onNext: () => void;
}

export function PhotoStep({ photoPreviewUrl, onPhotoReady, onNext }: PhotoStepProps) {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const { uploadUrl, photoKey } = await getPresignedUrl(file.type);
      await uploadPhoto(uploadUrl, file);
      const previewUrl = URL.createObjectURL(file);
      onPhotoReady(photoKey, previewUrl, file);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("photoUploadError"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <section aria-labelledby="photo-step-title" className="flex flex-col gap-4 p-4">
      <h2 id="photo-step-title" className="text-xl font-semibold">
        {t("stepPhotoTitle")}
      </h2>
      <p className="text-sm text-gray-600">{t("photoInstructions")}</p>
      <p className="text-sm text-amber-700">{t("photoPrivacyNote")}</p>

      {photoPreviewUrl ? (
        <Image
          src={photoPreviewUrl}
          alt={t("photoPreviewAlt")}
          width={400}
          height={192}
          unoptimized
          className="h-48 w-full rounded-md object-cover"
        />
      ) : null}

      <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6 text-center text-sm font-medium text-gray-700">
        {photoPreviewUrl ? t("photoChangeButton") : t("photoInputLabel")}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          aria-label={t("photoInputAria")}
          className="sr-only"
          onChange={handleFileChange}
        />
      </label>

      {uploading ? (
        <p role="status" className="text-sm text-gray-600">
          {t("photoUploading")}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onNext}
        disabled={!photoPreviewUrl || uploading}
        aria-label={t("photoNextButton")}
        className="mt-2 rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-40"
      >
        {t("photoNextButton")}
      </button>
    </section>
  );
}
