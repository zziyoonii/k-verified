/**
 * Google Gemini API 래퍼
 * 한국인 리뷰 요약 생성
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface FilteredReview {
  author: string;
  rating: number;
  text: string;
  date: string;
}

export async function summarizeKoreanReviews(
  placeName: string,
  reviews: FilteredReview[]
): Promise<string> {
  if (reviews.length === 0) {
    return "아직 한국인 리뷰가 없습니다.";
  }

  const reviewTexts = reviews
    .map((r, i) => `[${r.rating}점] ${r.text}`)
    .join("\n");

  const prompt = `당신은 한국인 여행자를 위한 장소 리뷰 요약 전문가입니다.

아래는 "${placeName}"에 대한 한국인 리뷰 ${reviews.length}개입니다.

${reviewTexts}

위 리뷰들을 3줄 이내로 요약해주세요. 
- 가장 많이 언급된 장점과 주의점을 포함
- 구체적인 메뉴/서비스명이 있으면 포함
- 가격 정보가 있으면 포함
- 한국인 여행자에게 실용적인 팁 위주로

형식: "한국인 리뷰 N개 요약: [요약 내용]"`;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 200,
        },
      }),
    });

    const data = await res.json();

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    }

    console.error("Gemini response error:", JSON.stringify(data));
    return `한국인 리뷰 ${reviews.length}개가 있습니다. 요약을 생성하지 못했습니다.`;
  } catch (error) {
    console.error("Gemini API error:", error);
    return `한국인 리뷰 ${reviews.length}개가 있습니다.`;
  }
}
