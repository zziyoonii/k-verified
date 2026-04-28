import { GoogleGenerativeAI } from "@google/generative-ai";

const SUMMARY_PROMPT = `당신은 한국인 여행자를 위한 맛집/마사지/카페 리뷰 요약 전문가입니다.
아래 한국인 리뷰들을 읽고 다음 형식으로 3줄 요약을 작성해주세요:

1. 장점: (핵심 장점 1~2가지)
2. 주의점: (알아야 할 단점이나 주의사항, 없으면 "특이사항 없음")
3. 실용 팁: (가격 정보, 예약 필요 여부, 추천 메뉴/코스 등)

반드시 한국어로 작성하고, 각 줄은 간결하게 1~2문장으로 작성해주세요.`;

// 우선순위 순으로 시도할 모델 목록 (무료 티어 우선)
const MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
];

async function callGemini(reviews: string[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[Gemini] GEMINI_API_KEY가 설정되지 않았습니다.");
    return null;
  }

  const reviewText = reviews.map((r, i) => `리뷰 ${i + 1}: ${r}`).join("\n\n");
  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(
        `${SUMMARY_PROMPT}\n\n---\n${reviewText}`
      );
      console.log(`[Gemini] 성공 (모델: ${modelName})`);
      return result.response.text();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[Gemini] 모델 ${modelName} 실패:`, msg);
      // 404(모델 없음) 또는 429(할당량 초과)면 다음 모델 시도
      if (!msg.includes("404") && !msg.includes("429")) break;
    }
  }

  return null;
}

export async function summarizeKoreanReviews(
  reviews: string[]
): Promise<string | null> {
  if (reviews.length === 0) return null;
  return callGemini(reviews);
}
