import { Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import PlaceCard from "@/components/PlaceCard";
import { searchPlaces } from "@/lib/google-places";
import { geocodeLocation } from "@/lib/geocoding";
import { Place } from "@/types";

interface SearchPageProps {
  searchParams: { dest?: string; cat?: string };
}

const BADGE_ORDER = { 강력추천: 0, 검증: 1, 발견: 2 } as const;

async function SearchResults({ dest, cat }: { dest: string; cat: string }) {
  try {
    const locationBias = await geocodeLocation(dest);
    const query = cat ? cat : dest;
    const places = await searchPlaces(query, locationBias ?? undefined);

    if (places.length === 0) {
      return (
        <div className="text-center py-12 space-y-2">
          <p className="text-gray-500">검색 결과가 없습니다.</p>
          <p className="text-sm text-gray-400">
            다른 키워드로 검색해보세요. (예: 도시명 + 업종)
          </p>
        </div>
      );
    }

    const withKorean = places
      .filter((p): p is Place & { badge: NonNullable<Place["badge"]> } => p.badge !== null)
      .sort((a, b) => BADGE_ORDER[a.badge] - BADGE_ORDER[b.badge]);

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
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("SearchResults error:", message);
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-gray-500">검색 중 오류가 발생했습니다.</p>
        <p className="text-xs text-red-400">{message}</p>
      </div>
    );
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const dest = searchParams.dest ?? "";
  const cat = searchParams.cat ?? "";

  return (
    <div className="space-y-5">
      <SearchBar defaultDest={dest} defaultCat={cat} size="md" />

      {dest ? (
        <>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{dest}</span>
            {cat && (
              <>
                {" "}·{" "}
                <span className="font-semibold text-gray-800">{cat}</span>
              </>
            )}{" "}
            검색 결과
          </p>
          <Suspense
            fallback={
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            }
          >
            <SearchResults dest={dest} cat={cat} />
          </Suspense>
        </>
      ) : (
        <p className="text-center text-gray-400 py-12">
          여행지를 입력해주세요.
        </p>
      )}
    </div>
  );
}
