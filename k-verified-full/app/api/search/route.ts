/**
 * POST /api/search
 * 장소 검색 + 한국인 리뷰 필터링 + 배지 부여
 */
import { NextRequest, NextResponse } from "next/server";
import { searchPlaces, getPlaceDetails, getPhotoUrl, detectCategory } from "@/lib/google-places";
import { filterKoreanReviews, getBadge, getKoreanAvgRating } from "@/lib/korean-filter";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    // 1. 장소 검색
    const places = await searchPlaces(query);

    // 2. 각 장소의 리뷰를 가져와서 한국인 리뷰 필터링
    const results = await Promise.all(
      places.slice(0, 10).map(async (place) => {
        const details = await getPlaceDetails(place.place_id);
        if (!details) return null;

        // 한국인 리뷰 필터링
        const koreanReviews = filterKoreanReviews(details.reviews || []);

        // 한국인 리뷰가 0개면 제외 (옵션: 포함하되 표시만 다르게)
        // if (koreanReviews.length === 0) return null;

        const koreanAvgRating = getKoreanAvgRating(koreanReviews);
        const badge = getBadge(koreanReviews.length);
        const category = detectCategory(details.types || []);

        return {
          id: place.place_id,
          name: details.name,
          address: details.formatted_address,
          category,
          photo: details.photos?.[0]
            ? getPhotoUrl(details.photos[0].photo_reference)
            : null,
          ratingAll: details.rating || 0,
          ratingKo: koreanAvgRating,
          reviewsAll: details.user_ratings_total || 0,
          reviewsKo: koreanReviews.length,
          badge,
          googleMapsUrl: details.url,
          location: details.geometry.location,
          koreanReviews: koreanReviews.slice(0, 10), // 최대 10개
        };
      })
    );

    // null 제거 + 한국인 리뷰 많은 순 정렬
    const filtered = results
      .filter(Boolean)
      .sort((a, b) => (b?.reviewsKo || 0) - (a?.reviewsKo || 0));

    return NextResponse.json({ places: filtered });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
