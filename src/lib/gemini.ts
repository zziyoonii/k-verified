import { GoogleGenerativeAI } from "@google/generative-ai";

const SUMMARY_PROMPT = `당신은 한국인 여행자를 위한 맛집/마사지/카페 리뷰 요약 전문가입니다.
아래 한국인 리뷰들을 읽고 다음 형식으로 3줄 요약을 작성해주세요:

1. 장점: (핵심 장점 1~2가지)
2. 주의점: (알아야 할 단점이나 주의사항, 없으면 "특이사항 없음")
3. 실용 팁: (가격 정보, 예약 필요 여부, 추천 메뉴/코스 등)

반드시 한국어로 작성하고, 각 줄은 간결하게 1~2문장으로 작성해주세요.`;

export async function summarizeKoreanReviews(
  reviews: string[]
): Promise<string | null> {
  if (reviews.length === 0) return null;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[Gemini] GEMINI_API_KEY가 설정되지 않았습니다. Vercel → Settings → Environment Variables에서 추가하세요.");
    return null;
  }

  const reviewText = reviews.map((r, i) => `리뷰 ${i + 1}: ${r}`).join("\n\n");

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(
      `${SUMMARY_PROMPT}\n\n---\n${reviewText}`
    );
    return result.response.text();
  } catch (error) {
    console.error("[Gemini] API 호출 실패:", error instanceof Error ? error.message : error);
    return null;
  }
}
