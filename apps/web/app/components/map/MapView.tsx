"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Category, ReportListItem } from "../../lib/api";
import { CATEGORY_COLORS } from "../../lib/categories";

// Keyless vector style (no API key — HARD RULE 1/2, PRD cost guardrail).
// OSM attribution is required and shown via the AttributionControl below.
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// Centered roughly between Chennai and Coimbatore at a zoom that shows both.
const INITIAL_CENTER: [number, number] = [78.8, 11.5];
const INITIAL_ZOOM = 6;

interface MapViewProps {
  reports: ReportListItem[];
  categoryLabels: Record<Category, string>;
  popupReportedOnLabel: string;
  popupZoneUnavailableLabel: string;
}

export function MapView({
  reports,
  categoryLabels,
  popupReportedOnLabel,
  popupZoneUnavailableLabel,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      attributionControl: false,
    });
    mapRef.current.addControl(
      new maplibregl.AttributionControl({ customAttribution: "© OpenStreetMap contributors" })
    );

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = reports.map((report) => {
      // categoryLabels/city/zone all come from the backend's constrained enum
      // and zone lookup (no free-text fields reach a report today), so this
      // interpolation is safe — but if a free-text field is ever added here,
      // it must be escaped before going into setHTML.
      const popupHtml = `
        <strong>${categoryLabels[report.category]}</strong><br/>
        ${report.city}${report.zone ? ` — ${report.zone}` : ` — ${popupZoneUnavailableLabel}`}<br/>
        ${popupReportedOnLabel}: ${new Date(report.timestamp).toLocaleString()}
      `;
      const marker = new maplibregl.Marker({ color: CATEGORY_COLORS[report.category] })
        .setLngLat([report.longitude, report.latitude])
        .setPopup(new maplibregl.Popup({ offset: 12 }).setHTML(popupHtml));
      if (mapRef.current) marker.addTo(mapRef.current);
      return marker;
    });
  }, [reports, categoryLabels, popupReportedOnLabel, popupZoneUnavailableLabel]);

  return <div ref={containerRef} className="h-[70vh] w-full rounded-md" data-testid="map-container" />;
}
