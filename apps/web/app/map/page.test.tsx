import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MapPage from "./page";
import { LanguageProvider } from "../i18n/LanguageProvider";
import { en } from "../i18n/dictionaries";
import type { ReportListItem } from "../lib/api";

const { listReportsMock, mapViewSpy } = vi.hoisted(() => ({
  listReportsMock: vi.fn(),
  mapViewSpy: vi.fn(),
}));

vi.mock("../lib/api", async () => {
  const actual = await vi.importActual<typeof import("../lib/api")>("../lib/api");
  return { ...actual, listReports: listReportsMock };
});

// MapLibre can't render in jsdom (no WebGL) — replace with a spy that records
// the props it would have rendered so filter wiring and popup i18n are still
// testable without a real map.
vi.mock("../components/map/MapView", () => ({
  MapView: (props: { reports: ReportListItem[]; categoryLabels: Record<string, string> }) => {
    mapViewSpy(props.reports, props.categoryLabels);
    return <div data-testid="map-view-mock">{props.reports.length} pins</div>;
  },
}));

const REPORTS: ReportListItem[] = [
  {
    id: "1",
    category: "garbage",
    latitude: 13.0827,
    longitude: 80.2707,
    photoKey: "k1",
    city: "Chennai",
    zone: "Zone 1",
    timestamp: "2026-06-19T00:00:00.000Z",
    status: "submitted",
  },
  {
    id: "2",
    category: "road",
    latitude: 9.9252,
    longitude: 78.1198,
    photoKey: "k2",
    city: "Other TN Region",
    zone: null,
    timestamp: "2026-06-19T01:00:00.000Z",
    status: "submitted",
  },
];

function renderPage() {
  return render(
    <LanguageProvider>
      <MapPage />
    </LanguageProvider>
  );
}

describe("MapPage", () => {
  it("shows the loading state, then renders the map with all reports including null-zone ones", async () => {
    listReportsMock.mockResolvedValueOnce(REPORTS);
    renderPage();

    expect(screen.getByText(en.mapLoading)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByTestId("map-view-mock")).toBeInTheDocument());
    expect(mapViewSpy).toHaveBeenLastCalledWith(
      REPORTS,
      expect.objectContaining({
        garbage: en.categoryGarbageLabel,
        road: en.categoryRoadLabel,
        streetlight: en.categoryStreetlightLabel,
        drainage: en.categoryDrainageLabel,
      })
    );
  });

  it("shows the empty state when there are no reports", async () => {
    listReportsMock.mockResolvedValueOnce([]);
    renderPage();

    await waitFor(() => expect(screen.getByText(en.mapEmpty)).toBeInTheDocument());
  });

  it("shows the error state when the fetch fails", async () => {
    listReportsMock.mockRejectedValueOnce(new Error("network down"));
    renderPage();

    await waitFor(() => expect(screen.getByText(en.mapError)).toBeInTheDocument());
  });

  it("filters pins passed to the map when a category checkbox is unchecked", async () => {
    listReportsMock.mockResolvedValueOnce(REPORTS);
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => expect(screen.getByTestId("map-view-mock")).toBeInTheDocument());

    await user.click(screen.getByRole("checkbox", { name: en.categoryRoadLabel }));

    await waitFor(() =>
      expect(mapViewSpy).toHaveBeenLastCalledWith([REPORTS[0]], expect.anything())
    );
  });
});
