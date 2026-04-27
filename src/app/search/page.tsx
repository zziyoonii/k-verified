import { Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import PlaceCard from "@/components/PlaceCard";
import { Place } from "@/types";

interface SearchPageProps {
  searchParams: { q?: string };
}

async function SearchResults({ query }: { query: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(
    `${baseUrl}/api/search?q=${encodeURIComponent(query)}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return (
      <p className="text-center text-gray-500 py-12">
        검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
    );
  }

  const data = await res.json();
  const places: Place[] = data.places ?? [];

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
              <PlaceCard key={place.placeId} place={place} query={query} />
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
              <PlaceCard key={place.placeId} place={place} query={query} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q ?? "";

  return (
    <div className="space-y-5">
      <SearchBar defaultValue={query} size="md" />

      {query ? (
        <>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{query}</span> 검색
            결과
          </p>
          <Suspense
            fallback={
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-28 bg-gray-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            }
          >
            <SearchResults query={query} />
          </Suspense>
        </>
      ) : (
        <p className="text-center text-gray-400 py-12">
          검색어를 입력해주세요.
        </p>
      )}
    </div>
  );
}
