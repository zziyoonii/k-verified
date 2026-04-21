/**
 * POST /api/place
 * 장소 상세 정보 + 한국인 리뷰 + AI 요약
 */
import { NextRequest, NextResponse } from "next/server";
import { getPlaceDetails, getPhotoUrl } from "@/lib/google-places";
import { filterKoreanReviews, getBadge, getKoreanAvgRating } from "@/lib/korean-filter";
import { summarizeKoreanReviews } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { placeId } = await req.json();

    if (!placeId) {
      return NextResponse.json({ error: "placeId is required" }, { status: 400 });
    }

    // 장소 상세 정보 가져오기
    const details = await getPlaceDetails(placeId);
    if (!details) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    // 한국인 리뷰 필터링
    const koreanReviews = filterKoreanReviews(details.reviews || []);
    const koreanAvgRating = getKoreanAvgRating(koreanReviews);
    const badge = getBadge(koreanReviews.length);

    // Gemini로 AI 요약 생성
    const aiSummary = await summarizeKoreanReviews(details.name, koreanReviews);

    return NextResponse.json({
      id: details.place_id,
      name: details.name,
      address: details.formatted_address,
      phone: details.formatted_phone_number,
      website: details.website,
      ratingAll: details.rating || 0,
      ratingKo: koreanAvgRating,
      reviewsAll: details.user_ratings_total || 0,
      reviewsKo: koreanReviews.length,
      badge,
      aiSummary,
      googleMapsUrl: details.url,
      location: details.geometry.location,
      photos: details.photos?.map((p) => getPhotoUrl(p.photo_reference, 800)) || [],
      openingHours: details.opening_hours?.weekday_text,
      koreanReviews,
    });
  } catch (error) {
    console.error("Place API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
