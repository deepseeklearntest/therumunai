import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3Client = new S3Client({});

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export interface PresignResult {
  uploadUrl: string;
  photoKey: string;
}

export async function generatePresignedUrl(
  bucketName: string,
  contentType: string
): Promise<PresignResult> {
  const normalizedType = contentType.toLowerCase().trim();

  if (!ALLOWED_CONTENT_TYPES.includes(normalizedType)) {
    throw new Error(`Invalid content type. Supported types: ${ALLOWED_CONTENT_TYPES.join(", ")}`);
  }

  // Derive file extension
  let ext = "jpg";
  if (normalizedType.includes("png")) {
    ext = "png";
  } else if (normalizedType.includes("webp")) {
    ext = "webp";
  }

  // Generate key matching validation regex: photos/YYYY/MM/UUID.ext
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const uuid = randomUUID();
  const photoKey = `photos/${year}/${month}/${uuid}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: photoKey,
    ContentType: normalizedType,
  });

  // Expires in 15 minutes (900 seconds)
  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 900,
  });

  return {
    uploadUrl,
    photoKey,
  };
}
