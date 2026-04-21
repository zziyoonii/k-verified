/**
 * Google Places API 래퍼
 * Text Search + Place Details 호출
 */

const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const BASE_URL = "https://maps.googleapis.com/maps/api/place";

// ── 장소 검색 (Text Search) ──
export interface SearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
  types?: string[];
  business_status?: string;
}

export async function searchPlaces(query: string): Promise<SearchResult[]> {
  const url = `${BASE_URL}/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}&language=ko`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK") {
    console.error("Text Search error:", data.status, data.error_message);
    return [];
  }

  return data.results || [];
}

// ── 장소 상세 + 리뷰 (Place Details) ──
export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry: {
    location: { lat: number; lng: number };
  };
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
    relative_time_description: string;
    language?: string;
    original_language?: string;
  }>;
  opening_hours?: {
    weekday_text?: string[];
    open_now?: boolean;
  };
  types?: string[];
  url?: string; // Google Maps URL
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const fields = [
    "place_id", "name", "formatted_address", "formatted_phone_number",
    "website", "rating", "user_ratings_total", "geometry", "photos",
    "reviews", "opening_hours", "types", "url",
  ].join(",");

  // language=ko로 요청하면 한국어 리뷰를 우선 반환
  const url = `${BASE_URL}/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}&language=ko&reviews_sort=newest`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK") {
    console.error("Place Details error:", data.status, data.error_message);
    return null;
  }

  return data.result || null;
}

// ── 사진 URL 생성 ──
export function getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
  return `${BASE_URL}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${API_KEY}`;
}

// ── 카테고리 매핑 ──
const CATEGORY_MAP: Record<string, string[]> = {
  food: ["restaurant", "food", "meal_delivery", "meal_takeaway", "bakery"],
  cafe: ["cafe", "coffee"],
  massage: ["spa", "beauty_salon", "hair_care", "massage"],
};

export function detectCategory(types: string[]): string {
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (types.some((t) => keywords.some((k) => t.includes(k)))) {
      return category;
    }
  }
  return "other";
}
