export interface SubmitReportPayload {
  category: string;
  latitude: number;
  longitude: number;
  photoKey: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

const ALLOWED_CATEGORIES = ["garbage", "road", "streetlight", "drainage"];
const PHOTO_KEY_REGEX = /^photos\/\d{4}\/\d{2}\/[a-f0-9-]{36}\.(jpg|jpeg|png|webp)$/i;

export function validateReportPayload(payload: any): {
  valid: boolean;
  errors: ValidationError[];
  data?: SubmitReportPayload;
} {
  const errors: ValidationError[] = [];

  if (!payload || typeof payload !== "object") {
    return {
      valid: false,
      errors: [{ field: "payload", message: "Payload must be a JSON object" }],
    };
  }

  const { category, latitude, longitude, photoKey, ...extra } = payload;

  // Check for unexpected extra properties to prevent payload pollution
  const extraKeys = Object.keys(extra);
  if (extraKeys.length > 0) {
    errors.push({
      field: "payload",
      message: `Unexpected fields found: ${extraKeys.join(", ")}. No extra fields are allowed.`,
    });
  }

  // Validate category
  if (typeof category !== "string") {
    errors.push({ field: "category", message: "Category must be a string" });
  } else if (!ALLOWED_CATEGORIES.includes(category.toLowerCase())) {
    errors.push({
      field: "category",
      message: `Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`,
    });
  }

  // Validate latitude
  if (typeof latitude !== "number" || isNaN(latitude)) {
    errors.push({ field: "latitude", message: "Latitude must be a number" });
  } else if (latitude < -90 || latitude > 90) {
    errors.push({ field: "latitude", message: "Latitude must be between -90 and 90" });
  }

  // Validate longitude
  if (typeof longitude !== "number" || isNaN(longitude)) {
    errors.push({ field: "longitude", message: "Longitude must be a number" });
  } else if (longitude < -180 || longitude > 180) {
    errors.push({ field: "longitude", message: "Longitude must be between -180 and 180" });
  }

  // Validate photoKey
  if (typeof photoKey !== "string") {
    errors.push({ field: "photoKey", message: "PhotoKey must be a string" });
  } else if (!PHOTO_KEY_REGEX.test(photoKey)) {
    errors.push({
      field: "photoKey",
      message: "PhotoKey must match the expected format (photos/YYYY/MM/UUID.ext)",
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      category: category.toLowerCase(),
      latitude,
      longitude,
      photoKey,
    },
  };
}
