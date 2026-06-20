// Thin client over services/submit's HTTP API. Must match the backend contract
// exactly: see services/submit/src/{index,validate,presign}.ts.

export type Category = "garbage" | "road" | "streetlight" | "drainage";

export interface PresignResponse {
  uploadUrl: string;
  photoKey: string;
}

export interface SubmitReportInput {
  category: Category;
  latitude: number;
  longitude: number;
  photoKey: string;
}

export interface SubmitReportResponse {
  id: string;
  category: Category;
  latitude: number;
  longitude: number;
  photoKey: string;
  city: string;
  zone: string | null;
  timestamp: string;
  status: string;
  disclosure: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  errors?: ValidationError[];
  status: number;

  constructor(message: string, status: number, errors?: ValidationError[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "";
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let errors: ValidationError[] | undefined;
  let message = `Request failed with status ${response.status}`;
  try {
    const body = await response.json();
    if (Array.isArray(body?.errors)) {
      errors = body.errors as ValidationError[];
      message = "Validation failed";
    } else if (typeof body?.error === "string") {
      message = body.error;
    }
  } catch {
    // Body wasn't JSON; fall back to the generic message above.
  }
  return new ApiError(message, response.status, errors);
}

export async function getPresignedUrl(contentType: string): Promise<PresignResponse> {
  const url = `${getApiBaseUrl()}/presign?contentType=${encodeURIComponent(contentType)}`;
  const response = await fetch(url, { method: "GET" });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return (await response.json()) as PresignResponse;
}

export async function uploadPhoto(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!response.ok) {
    throw new ApiError(`Photo upload failed with status ${response.status}`, response.status);
  }
}

export async function submitReport(
  payload: SubmitReportInput
): Promise<SubmitReportResponse> {
  // Only these 4 fields — the backend validator rejects any unknown keys.
  const body = {
    category: payload.category,
    latitude: payload.latitude,
    longitude: payload.longitude,
    photoKey: payload.photoKey,
  };

  const response = await fetch(`${getApiBaseUrl()}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return (await response.json()) as SubmitReportResponse;
}
