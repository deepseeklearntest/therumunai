import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReportPage from "./page";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { en } from "./i18n/dictionaries";

const ORIGINAL_ENV = process.env.NEXT_PUBLIC_API_BASE_URL;

function mockGeolocation(coords: { latitude: number; longitude: number }) {
  const getCurrentPosition = vi.fn((success: PositionCallback) => {
    success({
      coords: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: 5,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    } as GeolocationPosition);
  });
  vi.stubGlobal("navigator", {
    ...navigator,
    geolocation: { getCurrentPosition },
  });
  return getCurrentPosition;
}

async function driveFlowToReview(user: ReturnType<typeof userEvent.setup>) {
  // Step 0: Start
  await user.click(screen.getByRole("button", { name: en.ctaReportIssue }));

  // Step 1: Photo
  const file = new File(["fake-bytes"], "photo.jpg", { type: "image/jpeg" });
  const fileInput = screen.getByLabelText(en.photoInputAria, { exact: false });
  await user.upload(fileInput, file);

  await waitFor(() =>
    expect(screen.getByRole("button", { name: en.photoNextButton })).toBeEnabled()
  );
  await user.click(screen.getByRole("button", { name: en.photoNextButton }));

  // Step 2: Location
  await waitFor(() =>
    expect(screen.getByRole("button", { name: en.locationFetchButton })).toBeInTheDocument()
  );
  await user.click(screen.getByRole("button", { name: en.locationFetchButton }));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: en.locationNextButton })).toBeEnabled()
  );
  await user.click(screen.getByRole("button", { name: en.locationNextButton }));

  // Step 3: Category
  await waitFor(() =>
    expect(screen.getByRole("button", { name: en.categoryRoadLabel })).toBeInTheDocument()
  );
  await user.click(screen.getByRole("button", { name: en.categoryRoadLabel }));
  await user.click(screen.getByRole("button", { name: en.categoryNextButton }));

  // Step 4: Review screen reached
  await waitFor(() =>
    expect(screen.getByRole("button", { name: en.submitButton })).toBeInTheDocument()
  );
}

describe("Report flow (Photo -> Location -> Category -> Submit)", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    URL.createObjectURL = vi.fn(() => "blob:mock-preview");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = ORIGINAL_ENV;
    vi.unstubAllGlobals();
  });

  it("renders an in-city success screen for a normal 201 response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          uploadUrl: "https://s3.example.com/upload",
          photoKey: "photos/2026/06/abc-def.jpg",
        }),
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "report-1",
          category: "road",
          latitude: 13.08,
          longitude: 80.27,
          photoKey: "photos/2026/06/abc-def.jpg",
          city: "Chennai",
          zone: "Zone 5 - Anna Nagar",
          timestamp: "2026-06-19T00:00:00.000Z",
          status: "submitted",
          disclosure: en.disclosure,
        }),
      });
    vi.stubGlobal("fetch", fetchMock);
    mockGeolocation({ latitude: 13.08, longitude: 80.27 });

    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <ReportPage />
      </LanguageProvider>
    );

    await driveFlowToReview(user);
    await user.click(screen.getByRole("button", { name: en.submitButton }));

    await waitFor(() => expect(screen.getByText(en.successTitle)).toBeInTheDocument());
    expect(screen.getByText("Chennai")).toBeInTheDocument();
    expect(screen.getByText("Zone 5 - Anna Nagar")).toBeInTheDocument();
    expect(screen.queryByText(en.submitErrorTitle)).not.toBeInTheDocument();
  });

  it("renders a normal success screen for an out-of-boundary 201 response (Other TN Region / null zone)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          uploadUrl: "https://s3.example.com/upload",
          photoKey: "photos/2026/06/abc-def.jpg",
        }),
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "report-2",
          category: "road",
          latitude: 9.9,
          longitude: 78.1,
          photoKey: "photos/2026/06/abc-def.jpg",
          city: "Other TN Region",
          zone: null,
          timestamp: "2026-06-19T00:00:00.000Z",
          status: "submitted",
          disclosure: en.disclosure,
        }),
      });
    vi.stubGlobal("fetch", fetchMock);
    mockGeolocation({ latitude: 9.9, longitude: 78.1 });

    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <ReportPage />
      </LanguageProvider>
    );

    await driveFlowToReview(user);
    await user.click(screen.getByRole("button", { name: en.submitButton }));

    // Out-of-boundary fallback (HARD RULE 5) is a SUCCESS case, not an error.
    await waitFor(() => expect(screen.getByText(en.successTitle)).toBeInTheDocument());
    expect(screen.getByText("Other TN Region")).toBeInTheDocument();
    expect(screen.getByText(en.successZoneUnavailable)).toBeInTheDocument();
    expect(screen.queryByText(en.submitErrorTitle)).not.toBeInTheDocument();
  });

  it("shows the disclosure footer on the success screen", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          uploadUrl: "https://s3.example.com/upload",
          photoKey: "photos/2026/06/abc-def.jpg",
        }),
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "report-3",
          category: "road",
          latitude: 13.08,
          longitude: 80.27,
          photoKey: "photos/2026/06/abc-def.jpg",
          city: "Chennai",
          zone: "Zone 5 - Anna Nagar",
          timestamp: "2026-06-19T00:00:00.000Z",
          status: "submitted",
          disclosure: en.disclosure,
        }),
      });
    vi.stubGlobal("fetch", fetchMock);
    mockGeolocation({ latitude: 13.08, longitude: 80.27 });

    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <ReportPage />
      </LanguageProvider>
    );

    await driveFlowToReview(user);
    await user.click(screen.getByRole("button", { name: en.submitButton }));

    await waitFor(() => expect(screen.getByText(en.successTitle)).toBeInTheDocument());
    expect(screen.getByText(en.disclosure)).toBeInTheDocument();
  });
});
