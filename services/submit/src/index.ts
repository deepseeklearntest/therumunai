import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { generatePresignedUrl } from "./presign.js";
import { validateReportPayload } from "./validate.js";

const PHOTOS_BUCKET_NAME = process.env.PHOTOS_BUCKET_NAME || "";

// Simple rough bounding box checks for local stub validation
// Real spatial queries will run in PostgreSQL/PostGIS in Phase 2
function determineZone(lat: number, lng: number): { city: string; zone: string } {
  // Chennai bounding box approximate
  if (lat >= 12.8 && lat <= 13.2 && lng >= 80.1 && lng <= 80.3) {
    return { city: "Chennai", zone: "Zone 5 (Anna Nagar - Stub)" };
  }
  // Coimbatore bounding box approximate
  if (lat >= 10.9 && lat <= 11.1 && lng >= 76.9 && lng <= 77.1) {
    return { city: "Coimbatore", zone: "Central Zone (Stub)" };
  }
  // Fallback as required by PRD
  return { city: "Other TN Region", zone: "Other Region" };
}

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
      const { city, zone } = determineZone(latitude, longitude);

      // In Phase 1, we return a successful response stubbing the DB write.
      // Phase 2 will replace this with real RDS/PostgreSQL schema entry.
      const mockReportId = `report-${Math.random().toString(36).substring(2, 11)}`;
      const timestamp = new Date().toISOString();

      return {
        statusCode: 201,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: mockReportId,
          category,
          latitude,
          longitude,
          photoKey,
          city,
          zone,
          timestamp,
          status: "submitted",
          message: "Report successfully submitted (Stub Mode - database write deferred to Phase 2)",
          disclosure: "Therumunai is an independent citizen-led civic initiative. We are not affiliated with the Greater Chennai Corporation (GCC), Coimbatore City Municipal Corporation (CCMC), or the Government of Tamil Nadu."
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
    // Return a static array of reports in stub mode for dashboard testing
    const timestamp = new Date().toISOString();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        {
          id: "report-stub-1",
          category: "garbage",
          latitude: 13.0827,
          longitude: 80.2707,
          photoKey: "photos/2026/06/stub-garbage.jpg",
          city: "Chennai",
          zone: "Zone 5 (Anna Nagar - Stub)",
          timestamp,
          status: "submitted"
        },
        {
          id: "report-stub-2",
          category: "road",
          latitude: 11.0168,
          longitude: 76.9558,
          photoKey: "photos/2026/06/stub-road.jpg",
          city: "Coimbatore",
          zone: "Central Zone (Stub)",
          timestamp,
          status: "submitted"
        }
      ]),
    };
  }

  // Fallback for unmatched routes
  return {
    statusCode: 404,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Not Found" }),
  };
};
