import { Place, PlaceDetail, KoreanReview } from "@/types";
import { isKoreanReview, assignBadge } from "./korean-detector";
import { getCached, setCached } from "./supabase";

const PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place";
const CACHE_TTL = 86400; // 24 hours

function getApiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY is not set");
  return key;
}

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
  original_language?: string;
}

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: { photo_reference: string }[];
  types: string[];
  geometry: { location: { lat: number; lng: number } };
  reviews?: GoogleReview[];
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: { weekday_text: string[] };
  price_level?: number;
}

function extractKoreanReviews(reviews: GoogleReview[]): KoreanReview[] {
  return reviews
    .filter((r) => r.text && isKoreanReview(r.text, r.original_language))
    .map((r, idx) => ({
      reviewId: `${r.time}-${idx}`,
      authorName: r.author_name,
      rating: r.rating,
      text: r.text,
      time: r.time,
      relativeTimeDescription: r.relative_time_description,
    }));
}

function toPlace(p: GooglePlace, koreanReviews: KoreanReview[]): Place {
  return {
    placeId: p.place_id,
    name: p.name,
    address: p.formatted_address,
    rating: p.rating ?? 0,
    totalRatings: p.user_ratings_total ?? 0,
    koreanReviewCount: koreanReviews.length,
    badge: assignBadge(koreanReviews.length),
    photoReference: p.photos?.[0]?.photo_reference,
    types: p.types,
    location: p.geometry.location,
  };
}

export async function searchPlaces(query: string): Promise<Place[]> {
  const cacheKey = `search:${query}`;
  const cached = await getCached<Place[]>(cacheKey);
  if (cached) return cached;

  const url = new URL(`${PLACES_BASE_URL}/textsearch/json`);
  url.searchParams.set("query", query);
  url.searchParams.set("language", "ko");
  url.searchParams.set("key", getApiKey());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Places text search failed: ${res.status}`);

  const json = await res.json();
  const results: GooglePlace[] = json.results ?? [];

  const places = results.slice(0, 20).map((p) => {
    const koreanReviews = extractKoreanReviews(p.reviews ?? []);
    return toPlace(p, koreanReviews);
  });

  await setCached(cacheKey, places, CACHE_TTL);
  return places;
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetail> {
  const cacheKey = `place:${placeId}`;
  const cached = await getCached<PlaceDetail>(cacheKey);
  if (cached) return cached;

  const fields = [
    "place_id",
    "name",
    "formatted_address",
    "rating",
    "user_ratings_total",
    "photos",
    "types",
    "geometry",
    "reviews",
    "formatted_phone_number",
    "website",
    "opening_hours",
    "price_level",
  ].join(",");

  const url = new URL(`${PLACES_BASE_URL}/details/json`);
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", fields);
  url.searchParams.set("language", "ko");
  url.searchParams.set("key", getApiKey());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Place details failed: ${res.status}`);

  const json = await res.json();
  const p: GooglePlace = json.result;

  const koreanReviews = extractKoreanReviews(p.reviews ?? []);
  const base = toPlace(p, koreanReviews);

  const detail: PlaceDetail = {
    ...base,
    koreanReviews,
    summary: null,
    phoneNumber: p.formatted_phone_number,
    website: p.website,
    openingHours: p.opening_hours?.weekday_text,
    priceLevel: p.price_level,
  };

  await setCached(cacheKey, detail, CACHE_TTL);
  return detail;
}

export function getPhotoUrl(photoReference: string, maxWidth = 400): string {
  const url = new URL(`${PLACES_BASE_URL}/photo`);
  url.searchParams.set("maxwidth", String(maxWidth));
  url.searchParams.set("photoreference", photoReference);
  url.searchParams.set("key", getApiKey());
  return url.toString();
}
