# 🇰🇷 K-Verified

> 한국인이 인증한 곳만 보여드려요

해외 구글 리뷰에서 한국인 리뷰만 필터링하여 검증된 맛집, 마사지, 카페를 찾아주는 서비스

## 주요 기능

- **한국인 리뷰 필터링** — Google Places API 리뷰에서 한국어 리뷰를 자동 감지
- **검증 배지** — 한국인 리뷰 수에 따라 발견/검증/강력추천 등급 부여
- **AI 리뷰 요약** — Gemini가 한국인 리뷰를 3줄로 요약
- **한국인 vs 전체 평점 비교** — 문화적 취향 차이를 한눈에 확인

## 세팅 방법

### 1. 클론 + 설치

```bash
git clone https://github.com/YOUR_USERNAME/k-verified.git
cd k-verified
npm install
```

### 2. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열고 API 키를 입력:

```
GOOGLE_PLACES_API_KEY=your_google_api_key
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_api_key
GEMINI_API_KEY=your_gemini_api_key
```

**API 키 발급:**
- Google: [Google Cloud Console](https://console.cloud.google.com) → Places API 활성화
- Gemini: [Google AI Studio](https://aistudio.google.com) → API Key 생성

### 3. 실행

```bash
npm run dev
```

http://localhost:3000 접속

## 프로젝트 구조

```
k-verified/
├── app/
│   ├── page.tsx              ← 메인 UI (홈/검색결과/상세)
│   └── api/
│       ├── search/route.ts   ← 장소 검색 + 한국인 리뷰 필터링
│       └── place/route.ts    ← 장소 상세 + Gemini AI 요약
├── lib/
│   ├── google-places.ts      ← Google Places API 래퍼
│   ├── korean-filter.ts      ← 한국어 리뷰 감지 로직
│   └── gemini.ts             ← Gemini API 래퍼
└── .env.local.example        ← 환경변수 템플릿
```

## 기술 스택

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS**
- **Google Places API** — 장소 검색 + 리뷰 데이터
- **Google Gemini API** — AI 리뷰 요약

## API 비용

| API | 무료 범위 | 단가 |
|-----|----------|------|
| Google Places | $300 크레딧 (신규) | Text Search $0.032/건, Details $0.017/건 |
| Gemini Flash | 무료 (분당 15회) | 거의 무료 |

## 향후 계획

- [ ] 검색 결과 캐싱 (Supabase)
- [ ] 지도 뷰 연동
- [ ] 여행 리스트 저장/공유
- [ ] B면: 외국인 → 한국 가이드
