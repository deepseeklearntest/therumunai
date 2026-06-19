import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { generatePresignedUrl } from "./presign.js";
import { validateReportPayload } from "./validate.js";
import { tagZone, insertReport, listReports } from "./db.js";

const PHOTOS_BUCKET_NAME = process.env.PHOTOS_BUCKET_NAME || "";

const DISCLOSURE =
  "Therumunai is an independent citizen-led civic initiative. We are not affiliated with the Greater Chennai Corporation (GCC), Coimbatore City Municipal Corporation (CCMC), or the Government of Tamil Nadu.";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const method = event.requestContext.http.method;
  const path = event.requestContext.http.path;

  // Route: GET /presign
  if (method === "GET" && path === "/presign") {
    try {
      const contentType = event.queryStringParameters?.contentType;

      if (!contentType) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Missing 'contentType' query parameter" }),
        };
      }

      if (!PHOTOS_BUCKET_NAME) {
        return {
          statusCode: 500,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "PHOTOS_BUCKET_NAME environment variable is not set" }),
        };
      }

      const result = await generatePresignedUrl(PHOTOS_BUCKET_NAME, contentType);

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: error.message || "Failed to generate upload URL" }),
      };
    }
  }

  // Route: POST /reports
  if (method === "POST" && path === "/reports") {
    try {
      let bodyString = event.body || "";
      if (event.isBase64Encoded) {
        bodyString = Buffer.from(bodyString, "base64").toString("utf-8");
      }

      let jsonPayload: any;
      try {
        jsonPayload = JSON.parse(bodyString);
      } catch {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Invalid JSON in request body" }),
        };
      }

      const validation = validateReportPayload(jsonPayload);
      if (!validation.valid || !validation.data) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ errors: validation.errors }),
        };
      }

      const { category, latitude, longitude, photoKey } = validation.data;

      // PostGIS zone tagging; falls back to "Other TN Region" for out-of-boundary
      // points (HARD RULE 5) without dropping the report.
      const { city, zone } = await tagZone(latitude, longitude);
      const stored = await insertReport({ category, photoKey, latitude, longitude, city, zone });

      return {
        statusCode: 201,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: stored.id,
          category,
          latitude,
          longitude,
          photoKey,
          city,
          zone,
          timestamp: new Date(stored.created_at).toISOString(),
          status: "submitted",
          disclosure: DISCLOSURE,
        }),
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Internal server error" }),
      };
    }
  }

  // Route: GET /reports
  if (method === "GET" && path === "/reports") {
    try {
      const reports = await listReports();
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reports),
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Internal server error" }),
      };
    }
  }

  // Fallback for unmatched routes
  return {
    statusCode: 404,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Not Found" }),
  };
};
