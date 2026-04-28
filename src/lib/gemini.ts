import Anthropic from "@anthropic-ai/sdk";
import { unstable_cache } from "next/cache";

const SUMMARY_PROMPT = `당신은 한국인 여행자를 위한 맛집/마사지/카페 리뷰 요약 전문가입니다.
아래 한국인 리뷰들을 읽고 다음 형식으로 3줄 요약을 작성해주세요:

1. 장점: (핵심 장점 1~2가지)
2. 주의점: (알아야 할 단점이나 주의사항, 없으면 "특이사항 없음")
3. 실용 팁: (가격 정보, 예약 필요 여부, 추천 메뉴/코스 등)

반드시 한국어로 작성하고, 각 줄은 간결하게 1~2문장으로 작성해주세요.`;

async function callClaude(reviews: string[]): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[Claude] ANTHROPIC_API_KEY가 설정되지 않았습니다.");
    return null;
  }

  const reviewText = reviews.map((r, i) => `리뷰 ${i + 1}: ${r}`).join("\n\n");
  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: `${SUMMARY_PROMPT}\n\n---\n${reviewText}` }],
    });
    console.log("[Claude] AI 요약 성공");
    const block = message.content[0];
    return block.type === "text" ? block.text : null;
  } catch (error) {
    console.error("[Claude] API 호출 실패:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function summarizeKoreanReviews(
  reviews: string[]
): Promise<string | null> {
  if (reviews.length === 0) return null;

  const key = reviews.map((r) => r.slice(0, 100)).join("|");
  const cached = unstable_cache(
    async () => callClaude(reviews),
    ["review-summary", key],
    { revalidate: 86400 }
  );
  return cached();
}
