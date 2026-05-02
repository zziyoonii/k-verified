import { Suspense } from "react";
import dynamic from "next/dynamic";
import SearchBar from "@/components/SearchBar";
import LoadMoreResults from "@/components/LoadMoreResults";
import { searchPlaces } from "@/lib/google-places";
import { geocodeLocation } from "@/lib/geocoding";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface SearchPageProps {
  searchParams: { dest?: string; cat?: string };
}

async function SearchResults({ dest, cat }: { dest: string; cat: string }) {
  try {
    const locationBias = await geocodeLocation(dest);
    const query = cat.trim() || "맛집";
    const { places, nextPageToken } = await searchPlaces(query, locationBias ?? undefined);

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

    // 한국인 리뷰 많은 순 → 별점 높은 순
    const sorted = [...places].sort(
      (a, b) => b.koreanReviewCount - a.koreanReviewCount || b.rating - a.rating
    );

    return (
      <div className="space-y-6">
        {locationBias && (
          <MapView places={sorted} center={locationBias} />
        )}
        <LoadMoreResults
          initialPlaces={sorted}
          initialNextPageToken={nextPageToken}
          dest={dest}
          cat={cat}
          query={query}
          totalCount={places.length}
        />
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
            key={`${dest}-${cat}`}
            fallback={
              <div className="space-y-3">
                <div className="h-[420px] bg-gray-100 rounded-2xl animate-pulse" />
                {[...Array(4)].map((_, i) => (
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
