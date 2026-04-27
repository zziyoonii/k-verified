const KOREAN_UNICODE_START = 0xac00;
const KOREAN_UNICODE_END = 0xd7a3;
const KOREAN_JAMO_START = 0x1100;
const KOREAN_JAMO_END = 0x11ff;
const KOREAN_RATIO_THRESHOLD = 0.3;

export function isKoreanChar(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= KOREAN_UNICODE_START && code <= KOREAN_UNICODE_END) ||
    (code >= KOREAN_JAMO_START && code <= KOREAN_JAMO_END)
  );
}

export function getKoreanRatio(text: string): number {
  if (!text || text.length === 0) return 0;
  const letters = text.replace(/\s/g, "");
  if (letters.length === 0) return 0;
  const koreanCount = [...letters].filter(isKoreanChar).length;
  return koreanCount / letters.length;
}

export function isKoreanReview(
  text: string,
  originalLanguage?: string
): boolean {
  if (originalLanguage) {
    return originalLanguage === "ko";
  }
  return getKoreanRatio(text) >= KOREAN_RATIO_THRESHOLD;
}

export function assignBadge(
  koreanReviewCount: number
): "발견" | "검증" | "강력추천" | null {
  if (koreanReviewCount >= 6) return "강력추천";
  if (koreanReviewCount >= 3) return "검증";
  if (koreanReviewCount >= 1) return "발견";
  return null;
}
