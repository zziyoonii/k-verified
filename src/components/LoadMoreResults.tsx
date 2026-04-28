"use client";

import { useState } from "react";
import PlaceCard from "@/components/PlaceCard";
import { Place } from "@/types";

interface Props {
  initialPlaces: Place[];
  initialNextPageToken?: string;
  dest: string;
  cat: string;
  query: string;
}

export default function LoadMoreResults({
  initialPlaces,
  initialNextPageToken,
  dest,
  cat,
  query,
}: Props) {
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(initialNextPageToken);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!nextPageToken || loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query, pageToken: nextPageToken });
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      if (data.places) {
        setPlaces((prev) => [...prev, ...data.places]);
        setNextPageToken(data.nextPageToken);
      }
    } finally {
      setLoading(false);
    }
  }

  const withKorean = places.filter((p) => p.badge !== null);
  const withoutKorean = places.filter((p) => p.badge === null);

  return (
    <div className="space-y-6">
      {withKorean.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-brand-600 mb-3">
            🇰🇷 한국인 리뷰 있는 곳 ({withKorean.length})
          </h2>
          <div className="space-y-3">
            {withKorean.map((place) => (
              <PlaceCard key={place.placeId} place={place} dest={dest} cat={cat} />
            ))}
          </div>
        </section>
      )}

      {withoutKorean.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-400 mb-3">
            기타 검색 결과 ({withoutKorean.length})
          </h2>
          <div className="space-y-3">
            {withoutKorean.map((place) => (
              <PlaceCard key={place.placeId} place={place} dest={dest} cat={cat} />
            ))}
          </div>
        </section>
      )}

      {nextPageToken && (
        <div className="text-center pt-2">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-brand-600 border border-brand-200 rounded-full hover:bg-brand-50 disabled:opacity-50 transition-colors"
          >
            {loading ? "불러오는 중..." : "더 보기"}
          </button>
        </div>
      )}
    </div>
  );
}
