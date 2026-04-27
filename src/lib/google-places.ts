import { Place, PlaceDetail, KoreanReview } from "@/types";
import { isKoreanReview, assignBadge } from "./korean-detector";

const BASE = "https://places.googleapis.com/v1";

function getApiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY is not set");
  return key;
}

interface NewReview {
  relativePublishTimeDescription: string;
  rating: number;
  text?: { text: string; languageCode: string };
  originalText?: { text: string; languageCode: string };
  authorAttribution?: { displayName: string };
  publishTime?: string;
}

interface NewPlace {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  photos?: { name: string }[];
  types?: string[];
  location?: { latitude: number; longitude: number };
  reviews?: NewReview[];
  nationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: { weekdayDescriptions: string[] };
  priceLevel?: string;
}

const PRICE_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

function extractKoreanReviews(reviews: NewReview[]): KoreanReview[] {
  return reviews
    .filter((r) => {
      const text = r.originalText?.text ?? r.text?.text ?? "";
      const lang = r.originalText?.languageCode ?? r.text?.languageCode;
      return text && isKoreanReview(text, lang);
    })
    .map((r, idx) => ({
      reviewId: `${r.publishTime ?? idx}-${idx}`,
      authorName: r.authorAttribution?.displayName ?? "익명",
      rating: r.rating,
      text: r.originalText?.text ?? r.text?.text ?? "",
      time: r.publishTime ? new Date(r.publishTime).getTime() / 1000 : 0,
      relativeTimeDescription: r.relativePublishTimeDescription,
    }));
}

function toPlace(p: NewPlace, koreanReviews: KoreanReview[]): Place {
  return {
    placeId: p.id,
    name: p.displayName?.text ?? "",
    address: p.formattedAddress ?? "",
    rating: p.rating ?? 0,
    totalRatings: p.userRatingCount ?? 0,
    koreanReviewCount: koreanReviews.length,
    badge: assignBadge(koreanReviews.length),
    photoReference: p.photos?.[0]?.name,
    types: p.types ?? [],
    location: {
      lat: p.location?.latitude ?? 0,
      lng: p.location?.longitude ?? 0,
    },
  };
}

const SEARCH_FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.photos",
  "places.types",
  "places.location",
  "places.reviews",
].join(",");

const DETAIL_FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "rating",
  "userRatingCount",
  "photos",
  "types",
  "location",
  "reviews",
  "nationalPhoneNumber",
  "websiteUri",
  "regularOpeningHours",
  "priceLevel",
].join(",");

export async function searchPlaces(
  query: string,
  locationBias?: { lat: number; lng: number }
): Promise<Place[]> {
  const body: Record<string, unknown> = { textQuery: query, languageCode: "ko" };

  if (locationBias) {
    body.locationBias = {
      circle: {
        center: { latitude: locationBias.lat, longitude: locationBias.lng },
        radius: 50000,
      },
    };
  }

  const res = await fetch(`${BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask": SEARCH_FIELDS,
    },
    body: JSON.stringify(body),
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Places search failed: ${res.status} — ${JSON.stringify(err)}`
    );
  }

  const json = await res.json();
  const places: NewPlace[] = json.places ?? [];

  return places.slice(0, 20).map((p) => {
    const koreanReviews = extractKoreanReviews(p.reviews ?? []);
    return toPlace(p, koreanReviews);
  });
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetail> {
  const url = new URL(`${BASE}/places/${placeId}`);
  url.searchParams.set("languageCode", "ko");

  const res = await fetch(url.toString(), {
    headers: {
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask": DETAIL_FIELDS,
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Place details failed: ${res.status} — ${JSON.stringify(err)}`
    );
  }

  const p: NewPlace = await res.json();

  console.log(
    `[place:${placeId}] reviews: ${p.reviews?.length ?? 0}`,
    p.reviews?.map((r) => r.originalText?.languageCode ?? r.text?.languageCode) ?? []
  );

  const koreanReviews = extractKoreanReviews(p.reviews ?? []);
  const base = toPlace(p, koreanReviews);

  return {
    ...base,
    koreanReviews,
    summary: null,
    phoneNumber: p.nationalPhoneNumber,
    website: p.websiteUri,
    openingHours: p.regularOpeningHours?.weekdayDescriptions,
    priceLevel: p.priceLevel ? PRICE_MAP[p.priceLevel] : undefined,
  };
}
