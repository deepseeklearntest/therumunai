import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, getPresignedUrl, listReports, submitReport, uploadPhoto } from "./api";

const ORIGINAL_ENV = process.env.NEXT_PUBLIC_API_BASE_URL;

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
  vi.restoreAllMocks();
});

afterEach(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = ORIGINAL_ENV;
});

describe("getPresignedUrl", () => {
  it("calls GET /presign with the content type as a query param", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ uploadUrl: "https://s3.example.com/x", photoKey: "photos/2026/06/abc.jpg" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPresignedUrl("image/jpeg");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/presign?contentType=image%2Fjpeg",
      { method: "GET" }
    );
    expect(result).toEqual({
      uploadUrl: "https://s3.example.com/x",
      photoKey: "photos/2026/06/abc.jpg",
    });
  });

  it("throws ApiError on non-ok response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "Invalid content type" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getPresignedUrl("text/plain")).rejects.toBeInstanceOf(ApiError);
  });
});

describe("uploadPhoto", () => {
  it("PUTs the file body with matching Content-Type header", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    await uploadPhoto("https://s3.example.com/upload", file);

    expect(fetchMock).toHaveBeenCalledWith("https://s3.example.com/upload", {
      method: "PUT",
      headers: { "Content-Type": "image/jpeg" },
      body: file,
    });
  });

  it("throws ApiError on non-ok response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    await expect(uploadPhoto("https://s3.example.com/upload", file)).rejects.toBeInstanceOf(
      ApiError
    );
  });
});

describe("submitReport", () => {
  it("POSTs to /reports with exactly the 4 allowed fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "1",
        category: "garbage",
        latitude: 13.08,
        longitude: 80.27,
        photoKey: "photos/2026/06/abc.jpg",
        city: "Chennai",
        zone: "Zone 5 - Anna Nagar",
        timestamp: "2026-06-19T00:00:00.000Z",
        status: "submitted",
        disclosure: "...",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await submitReport({
      category: "garbage",
      latitude: 13.08,
      longitude: 80.27,
      photoKey: "photos/2026/06/abc.jpg",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.example.com/reports");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });

    const sentBody = JSON.parse(init.body);
    expect(Object.keys(sentBody).sort()).toEqual(
      ["category", "latitude", "longitude", "photoKey"].sort()
    );
    expect(sentBody).toEqual({
      category: "garbage",
      latitude: 13.08,
      longitude: 80.27,
      photoKey: "photos/2026/06/abc.jpg",
    });
  });

  it("parses a 400 { errors } response into a typed ApiError", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        errors: [{ field: "latitude", message: "Latitude must be a number" }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    try {
      await submitReport({
        category: "garbage",
        latitude: Number.NaN,
        longitude: 80.27,
        photoKey: "photos/2026/06/abc.jpg",
      });
      expect.unreachable("submitReport should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(400);
      expect(apiErr.errors).toEqual([
        { field: "latitude", message: "Latitude must be a number" },
      ]);
    }
  });
});

describe("listReports", () => {
  it("calls GET /reports and returns the parsed array", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          category: "garbage",
          latitude: 13.0827,
          longitude: 80.2707,
          photoKey: "photos/2026/06/abc.jpg",
          city: "Chennai",
          zone: "Zone 5 - Anna Nagar",
          timestamp: "2026-06-19T00:00:00.000Z",
          status: "submitted",
        },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await listReports();

    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/reports", {
      method: "GET",
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("throws ApiError on non-ok response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "Internal server error" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(listReports()).rejects.toBeInstanceOf(ApiError);
  });
});
