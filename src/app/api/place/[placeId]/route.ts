import { NextRequest, NextResponse } from "next/server";
import { getPlaceDetails } from "@/lib/google-places";
import { summarizeKoreanReviews } from "@/lib/gemini";

export async function GET(
  _request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  const { placeId } = params;

  if (!placeId) {
    return NextResponse.json({ error: "placeId가 필요합니다." }, { status: 400 });
  }

  try {
    const detail = await getPlaceDetails(placeId);

    if (detail.koreanReviews.length > 0 && !detail.summary) {
      const reviewTexts = detail.koreanReviews.map((r) => r.text);
      detail.summary = await summarizeKoreanReviews(reviewTexts);
    }

    return NextResponse.json(detail);
  } catch (error) {
    console.error("Place detail error:", error);
    return NextResponse.json(
      { error: "장소 정보를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
