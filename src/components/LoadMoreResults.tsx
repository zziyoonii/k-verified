"use client";

import { useState, useMemo } from "react";
import PlaceCard from "@/components/PlaceCard";
import { Place } from "@/types";

interface Props {
  initialPlaces: Place[];
  initialNextPageToken?: string;
  dest: string;
  cat: string;
  query: string;
}

const CATEGORY_MAP: Record<string, string> = {
  restaurant: "맛집", food: "맛집", meal_takeaway: "맛집", meal_delivery: "맛집",
  cafe: "카페", coffee_shop: "카페", bakery: "카페",
  spa: "스파·마사지", beauty_salon: "스파·마사지", massage: "스파·마사지",
  bar: "바·나이트", night_club: "바·나이트",
  tourist_attraction: "관광지", museum: "관광지", amusement_park: "관광지",
  shopping_mall: "쇼핑", store: "쇼핑",
};

const CATEGORY_ORDER = ["맛집", "카페", "스파·마사지", "바·나이트", "관광지", "쇼핑", "기타"];

function getPrimaryCategory(types: string[]): string {
  for (const type of types) {
    if (CATEGORY_MAP[type]) return CATEGORY_MAP[type];
  }
  return "기타";
}

function InfoTooltip() {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="ml-1 text-gray-400 hover:text-brand-500 text-xs align-middle"
        aria-label="리뷰 기준 설명"
      >
        ⓘ
      </button>
      {open && (
        <div className="absolute left-0 top-5 z-10 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs text-gray-600 space-y-1.5">
          <p className="font-semibold text-gray-800 mb-1">한국인 리뷰 기준</p>
          <p>구글은 장소당 최대 <strong>5개</strong> 리뷰만 제공하기 때문에 한국인 리뷰도 최대 5개입니다.</p>
          <p>리뷰는 <strong>24시간마다</strong> 구글에서 최신화됩니다.</p>
          <div className="pt-1 border-t border-gray-100 space-y-0.5">
            <p>🔥 <strong>강력추천</strong> — 한국인 리뷰 6개 이상</p>
            <p>✅ <strong>검증</strong> — 3개 이상</p>
            <p>🔍 <strong>발견</strong> — 1개 이상</p>
          </div>
          <button onClick={() => setOpen(false)} className="mt-1 text-gray-400 hover:text-gray-600">닫기</button>
        </div>
      )}
    </span>
  );
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
  const [selectedTab, setSelectedTab] = useState("전체");

  const showCategories = !cat.trim();

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

  // 실제 결과에 존재하는 카테고리만 탭으로 표시
  const availableTabs = useMemo(() => {
    if (!showCategories) return [];
    const seen = new Set<string>();
    for (const place of withKorean) {
      seen.add(getPrimaryCategory(place.types ?? []));
    }
    return ["전체", ...CATEGORY_ORDER.filter((c) => seen.has(c))];
  }, [withKorean, showCategories]);

  const filteredKorean = useMemo(() => {
    if (!showCategories || selectedTab === "전체") return withKorean;
    return withKorean.filter((p) => getPrimaryCategory(p.types ?? []) === selectedTab);
  }, [withKorean, selectedTab, showCategories]);

  return (
    <div className="space-y-4">
      {withKorean.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-brand-600 mb-3">
            🇰🇷 한국인 리뷰 있는 곳 ({withKorean.length})
            <InfoTooltip />
          </h2>

          {/* 카테고리 탭 — 도시만 검색한 경우 */}
          {showCategories && availableTabs.length > 2 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
              {availableTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedTab === tab
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab}
                  {tab !== "전체" && (
                    <span className="ml-1 text-xs opacity-70">
                      {withKorean.filter((p) => getPrimaryCategory(p.types ?? []) === tab).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {filteredKorean.map((place) => (
              <PlaceCard key={place.placeId} place={place} dest={dest} cat={cat} />
            ))}
            {filteredKorean.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">해당 카테고리 결과가 없습니다.</p>
            )}
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
