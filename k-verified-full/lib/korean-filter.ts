/**
 * 한국어 리뷰 감지 및 필터링 유틸리티
 */

// 한국어(한글) 유니코드 범위 체크
function containsKorean(text: string): boolean {
  // 한글 자모: \u3131-\u3163
  // 한글 음절: \uAC00-\uD7A3
  // 한글 호환 자모: \u3130-\u318F
  const koreanRegex = /[\uAC00-\uD7A3\u3131-\u3163]/;
  return koreanRegex.test(text);
}

// 한국어 비율 계산 (더 정확한 판별)
function getKoreanRatio(text: string): number {
  if (!text || text.length === 0) return 0;

  const koreanChars = text.match(/[\uAC00-\uD7A3\u3131-\u3163]/g);
  const totalChars = text.replace(/\s/g, "").length;

  if (totalChars === 0) return 0;
  return (koreanChars?.length || 0) / totalChars;
}

// 리뷰가 한국어인지 판별
export function isKoreanReview(text: string): boolean {
  // 한국어 문자가 포함되어 있고
  // 전체 텍스트의 30% 이상이 한국어이면 한국어 리뷰로 판별
  return containsKorean(text) && getKoreanRatio(text) > 0.3;
}

// Google Places API 리뷰에서 한국어 리뷰만 필터링
export interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
  language?: string;
  original_language?: string;
}

export interface FilteredReview {
  author: string;
  rating: number;
  text: string;
  date: string;
  isKorean: boolean;
}

export function filterKoreanReviews(reviews: GoogleReview[]): FilteredReview[] {
  return reviews
    .filter((review) => {
      // 1차: Google API가 제공하는 언어 정보 활용
      if (review.original_language === "ko" || review.language === "ko") {
        return true;
      }
      // 2차: 텍스트 기반 한국어 감지
      return isKoreanReview(review.text);
    })
    .map((review) => ({
      author: review.author_name,
      rating: review.rating,
      text: review.text,
      date: formatDate(review.time),
      isKorean: true,
    }));
}

// 한국인 리뷰 수에 따른 검증 배지
export type BadgeType = "discovered" | "verified" | "strong";

export function getBadge(koreanReviewCount: number): BadgeType {
  if (koreanReviewCount >= 6) return "strong";    // 강력 추천
  if (koreanReviewCount >= 3) return "verified";   // 검증
  return "discovered";                              // 발견
}

// 한국인 평균 평점 계산
export function getKoreanAvgRating(reviews: FilteredReview[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

// Unix timestamp → YYYY.MM.DD 변환
function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}
