import SearchBar from "@/components/SearchBar";

const POPULAR_SEARCHES = [
  "방콕 마사지",
  "도쿄 라멘",
  "오사카 이자카야",
  "파리 카페",
  "뉴욕 한식당",
  "발리 스파",
  "싱가포르 호커센터",
  "베트남 쌀국수",
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center py-12 gap-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">
          🇰🇷 한국인이 검증한 해외 맛집
        </h1>
        <p className="text-gray-500 text-base max-w-md">
          구글 리뷰에서 한국인 리뷰만 필터링해
          <br />
          <span className="text-brand-600 font-semibold">
            한국인의 입맛으로 검증된 곳
          </span>
          을 찾아드립니다
        </p>
      </div>

      <div className="w-full max-w-xl">
        <SearchBar size="lg" />
      </div>

      <div className="w-full max-w-xl">
        <p className="text-xs text-gray-400 mb-3 text-center">인기 검색어</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {POPULAR_SEARCHES.map((term) => (
            <a
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-colors shadow-sm"
            >
              {term}
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-xl mt-4">
        {[
          { emoji: "🔍", label: "발견", desc: "한국인 리뷰 1~2개" },
          { emoji: "✅", label: "검증", desc: "한국인 리뷰 3~5개" },
          { emoji: "🔥", label: "강력추천", desc: "한국인 리뷰 6개 이상" },
        ].map((badge) => (
          <div
            key={badge.label}
            className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm"
          >
            <div className="text-2xl mb-1">{badge.emoji}</div>
            <div className="text-sm font-semibold text-gray-800">
              {badge.label}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{badge.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
