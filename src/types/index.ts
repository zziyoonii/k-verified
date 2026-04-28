export type BadgeLevel = "발견" | "검증" | "강력추천";

export interface KoreanReview {
  reviewId: string;
  authorName: string;
  rating: number;
  text: string;
  time: number;
  relativeTimeDescription: string;
}

export interface Place {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  totalRatings: number;
  koreanReviewCount: number;
  badge: BadgeLevel | null;
  photoReference?: string;
  types: string[];
  location: {
    lat: number;
    lng: number;
  };
}

export interface PlaceDetail extends Place {
  koreanReviews: KoreanReview[];
  summary: string | null;
  localName?: string;
  phoneNumber?: string;
  website?: string;
  openingHours?: string[];
  priceLevel?: number;
}

export interface SearchResult {
  places: Place[];
  query: string;
  totalCount: number;
}

export interface CachedData<T> {
  data: T;
  cachedAt: number;
  ttl: number;
}
