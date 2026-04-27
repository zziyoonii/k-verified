import { notFound } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/Badge";
import ReviewSummary from "@/components/ReviewSummary";
import CopyButton from "@/components/CopyButton";
import { getPlaceDetails } from "@/lib/google-places";
import { summarizeKoreanReviews } from "@/lib/gemini";

interface PlacePageProps {
  params: { placeId: string };
  searchParams: { dest?: string; cat?: string };
}

function PriceLevel({ level }: { level: number }) {
  const labels = ["무료", "저렴", "보통", "비쌈", "매우 비쌈"];
  return (
    <span className="text-sm text-gray-500">
      {"₩".repeat(level)}{" "}
      <span className="text-gray-400">({labels[level] ?? ""})</span>
    </span>
  );
}

function maskName(name: string): string {
  if (!name || name.length === 0) return "익명";
  const first = [...name][0]; // 유니코드 안전하게 첫 글자 추출
  return first + "*".repeat(Math.min(name.length - 1, 3));
}

export default async function PlacePage({ params, searchParams }: PlacePageProps) {
  let place;
  try {
    place = await getPlaceDetails(params.placeId);
  } catch {
    notFound();
  }

  if (!place) notFound();

  if (place.koreanReviews.length > 0) {
    place.summary = await summarizeKoreanReviews(
      place.koreanReviews.map((r) => r.text)
    );
  }

  const backParams = new URLSearchParams();
  if (searchParams.dest) backParams.set("dest", searchParams.dest);
  if (searchParams.cat) backParams.set("cat", searchParams.cat);
  const backHref = backParams.toString() ? `/search?${backParams.toString()}` : "/";

  return (
    <div className="space-y-5">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors"
      >
        ← 목록으로
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{place.name}</h1>
            <CopyButton text={place.name} />
          </div>
          <div className="flex items-center gap-1 text-sm shrink-0">
            <span className="text-yellow-400">★</span>
            <span className="font-semibold">{place.rating.toFixed(1)}</span>
            <span className="text-gray-400">
              ({place.totalRatings.toLocaleString()})
            </span>
          </div>
        </div>

        {place.badge && (
          <Badge level={place.badge} count={place.koreanReviewCount} />
        )}

        <p className="text-sm text-gray-500">{place.address}</p>

        {place.priceLevel !== undefined && (
          <PriceLevel level={place.priceLevel} />
        )}

        {place.phoneNumber && (
          <p className="text-sm text-gray-500">📞 {place.phoneNumber}</p>
        )}

        {place.website && (
          <a
            href={place.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-600 hover:underline block truncate"
          >
            🌐 {place.website}
          </a>
        )}

        {place.openingHours && place.openingHours.length > 0 && (
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
              영업시간 보기
            </summary>
            <ul className="mt-2 space-y-0.5 text-gray-600 pl-2">
              {place.openingHours.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {place.summary && <ReviewSummary summary={place.summary} />}

      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          🇰🇷 한국인 리뷰 ({place.koreanReviewCount})
        </h2>

        {place.koreanReviews.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            한국인 리뷰가 없습니다.
          </p>
        ) : (
          <div className="space-y-3">
            {place.koreanReviews.map((review) => (
              <div
                key={review.reviewId}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    {maskName(review.authorName)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="text-yellow-400">★</span>
                    <span>{review.rating}</span>
                    <span className="ml-1 text-gray-300">·</span>
                    <span>{review.relativeTimeDescription}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
