"use client";

import { useEffect, useRef } from "react";
import type { Place } from "@/types";

interface MapViewProps {
  places: Place[];
  center: { lat: number; lng: number };
}

const BADGE_COLOR: Record<string, string> = {
  강력추천: "#e11d48",
  검증: "#16a34a",
  발견: "#2563eb",
};

export default function MapView({ places, center }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<typeof import("leaflet")["default"]["map"]> | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("leaflet").then((mod) => {
      const L = mod.default;

      // Fix default marker icon path issue in bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!).setView([center.lat, center.lng], 13);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      places.forEach((place) => {
        if (!place.location.lat || !place.location.lng) return;

        const color = place.badge ? BADGE_COLOR[place.badge] : "#6b7280";
        const emoji =
          place.badge === "강력추천" ? "🔥" :
          place.badge === "검증" ? "✅" :
          place.badge === "발견" ? "🔍" : "📍";

        const icon = L.divIcon({
          html: `<div style="
            background:${color};
            color:white;
            border-radius:50%;
            width:28px;height:28px;
            display:flex;align-items:center;justify-content:center;
            font-size:14px;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
            border:2px solid white;
          ">${emoji}</div>`,
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([place.location.lat, place.location.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:160px;font-family:sans-serif">
              <div style="font-weight:600;margin-bottom:4px">${place.name}</div>
              ${place.badge
                ? `<div style="font-size:12px;color:${color}">${emoji} 한국인 ${place.badge} (${place.koreanReviewCount}명)</div>`
                : `<div style="font-size:12px;color:#9ca3af">한국인 리뷰 없음</div>`}
              <div style="font-size:12px;margin-top:4px">★ ${place.rating.toFixed(1)} (${place.totalRatings.toLocaleString()})</div>
            </div>
          `);
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
      style={{ height: "420px" }}
    />
  );
}
