# K-Verified 🇰🇷

> 해외 구글 리뷰에서 한국인 리뷰만 필터링하여, 한국인이 검증한 맛집·마사지·카페를 찾아주는 서비스

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열고 아래 API 키를 입력하세요:

| 변수 | 발급처 | 비용 |
|------|--------|------|
| `GOOGLE_PLACES_API_KEY` | [Google Cloud Console](https://console.cloud.google.com) | 유료 (신규 $300 크레딧) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com) | 무료 |
| `NEXT_PUBLIC_SUPABASE_URL` | [Supabase](https://supabase.com) | 무료 티어 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 프로젝트 Settings > API | 무료 티어 |

### 3. Supabase 테이블 생성

Supabase SQL Editor에서 아래 쿼리를 실행하세요:

```sql
create table cache (
  cache_key text primary key,
  data jsonb not null,
  created_at timestamptz default now(),
  expires_at timestamptz not null
);

create index on cache (expires_at);
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 기술 스택

- **프론트엔드**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **백엔드**: Next.js API Routes
- **외부 API**: Google Places API, Gemini API (gemini-1.5-flash)
- **데이터베이스**: Supabase (PostgreSQL) — 24시간 TTL 캐싱
- **배포**: Vercel

## 배지 시스템

| 배지 | 조건 |
|------|------|
| 🔍 발견 | 한국인 리뷰 1~2개 |
| ✅ 검증 | 한국인 리뷰 3~5개 |
| 🔥 강력추천 | 한국인 리뷰 6개 이상 |

## 한국어 리뷰 감지 방법

1. Google API의 `original_language` 필드가 `ko`인 경우
2. 텍스트 내 한글 문자(AC00-D7A3) 비율이 30% 이상인 경우

## Vercel 배포

```bash
vercel deploy
```

환경 변수는 Vercel 프로젝트 Settings > Environment Variables에서 동일하게 설정하고,
`NEXT_PUBLIC_BASE_URL`은 배포된 URL로 변경하세요.
