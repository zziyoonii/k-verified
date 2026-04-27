import Link from "next/link";
import Image from "next/image";
import { Place } from "@/types";
import Badge from "./Badge";

interface PlaceCardProps {
  place: Place;
  dest?: string;
  cat?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-sm text-gray-600">
      <span className="text-yellow-400">★</span>
      <span className="font-medium">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function PlaceCard({ place, dest, cat }: PlaceCardProps) {
  const params = new URLSearchParams();
  if (dest) params.set("dest", dest);
  if (cat) params.set("cat", cat);
  const qs = params.toString();
  const href = `/place/${place.placeId}${qs ? `?${qs}` : ""}`;

  return (
    <Link
      href={href}
      className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
        {place.photoReference ? (
          <Image
            src={`/api/photo?ref=${encodeURIComponent(place.photoReference)}&w=200`}
            alt={place.name}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
            📍
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 truncate">{place.name}</h3>
          <StarRating rating={place.rating} />
        </div>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{place.address}</p>

        <div className="mt-2">
          {place.badge ? (
            <Badge level={place.badge} count={place.koreanReviewCount} size="sm" />
          ) : (
            <span className="text-xs text-gray-400">한국인 리뷰 없음</span>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-1.5">
          전체 리뷰 {place.totalRatings.toLocaleString()}개
        </p>
      </div>
    </Link>
  );
}
