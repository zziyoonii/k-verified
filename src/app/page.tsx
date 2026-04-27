import SearchBar from "@/components/SearchBar";

const POPULAR_CITIES = [
  { name: "방콕", emoji: "🇹🇭", country: "태국" },
  { name: "발리", emoji: "🇮🇩", country: "인도네시아" },
  { name: "도쿄", emoji: "🇯🇵", country: "일본" },
  { name: "오사카", emoji: "🇯🇵", country: "일본" },
  { name: "파리", emoji: "🇫🇷", country: "프랑스" },
  { name: "상하이", emoji: "🇨🇳", country: "중국" },
  { name: "푸꾸옥", emoji: "🇻🇳", country: "베트남" },
];

const POPULAR_SEARCHES = [
  { dest: "방콕", cat: "마사지" },
  { dest: "발리", cat: "스파" },
  { dest: "도쿄", cat: "라멘" },
  { dest: "오사카", cat: "이자카야" },
  { dest: "파리", cat: "카페" },
  { dest: "상하이", cat: "맛집" },
  { dest: "푸꾸옥", cat: "해산물" },
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
        <p className="text-xs text-gray-400 mb-3 font-medium">인기 도시</p>
        <div className="flex gap-2 justify-center flex-wrap">
          {POPULAR_CITIES.map((city) => (
            <a
              key={city.name}
              href={`/search?dest=${encodeURIComponent(city.name)}`}
              className="flex flex-col items-center gap-1 px-4 py-3 bg-white border border-gray-200 rounded-2xl hover:border-brand-400 hover:shadow-sm transition-all shadow-sm min-w-[72px]"
            >
              <span className="text-2xl">{city.emoji}</span>
              <span className="text-sm font-semibold text-gray-700">{city.name}</span>
              <span className="text-xs text-gray-400">{city.country}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="w-full max-w-xl">
        <p className="text-xs text-gray-400 mb-3 font-medium">인기 검색</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {POPULAR_SEARCHES.map((s) => (
            <a
              key={`${s.dest}-${s.cat}`}
              href={`/search?dest=${encodeURIComponent(s.dest)}&cat=${encodeURIComponent(s.cat)}`}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-colors shadow-sm"
            >
              {s.dest} {s.cat}
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-xl mt-2">
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
            <div className="text-sm font-semibold text-gray-800">{badge.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{badge.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
