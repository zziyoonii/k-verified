"use client";

import { useState, useCallback } from "react";

// ── Types ──
interface PlaceResult {
  id: string;
  name: string;
  address: string;
  category: string;
  photo: string | null;
  ratingAll: number;
  ratingKo: number;
  reviewsAll: number;
  reviewsKo: number;
  badge: "discovered" | "verified" | "strong";
  googleMapsUrl: string;
  location: { lat: number; lng: number };
  koreanReviews: ReviewItem[];
}

interface PlaceDetail extends PlaceResult {
  phone?: string;
  website?: string;
  aiSummary: string;
  photos: string[];
  openingHours?: string[];
}

interface ReviewItem {
  author: string;
  rating: number;
  text: string;
  date: string;
}

const CATEGORIES = [
  { key: "all", label: "전체", icon: "◉" },
  { key: "food", label: "맛집", icon: "🍜" },
  { key: "cafe", label: "카페", icon: "☕" },
  { key: "massage", label: "마사지/스파", icon: "💆" },
];

const POPULAR_SEARCHES = [
  "방콕 마사지", "다낭 맛집", "오사카 카페",
  "치앙마이 스파", "하노이 맛집", "도쿄 라멘",
];

const BADGE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  discovered: { label: "발견", color: "#94A3B8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" },
  verified: { label: "검증", color: "#E85D3A", bg: "rgba(232,93,58,0.08)", border: "rgba(232,93,58,0.2)" },
  strong: { label: "강력추천", color: "#0EA5A0", bg: "rgba(14,165,160,0.08)", border: "rgba(14,165,160,0.2)" },
};

function StarRating({ rating, size = 14, color = "#E85D3A" }: { rating: number; size?: number; color?: string }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="inline-flex gap-[1px]">
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{ fontSize: size, color: i < full || (i === full && half) ? color : "#D1D5DB", opacity: i < full || (i === full && half) ? 1 : 0.3 }}>★</span>
      ))}
    </span>
  );
}

function Badge({ type }: { type: string }) {
  const c = BADGE_CONFIG[type];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      {type === "strong" && "🔥"} {c.label}
    </span>
  );
}

export default function Home() {
  const [view, setView] = useState<"home" | "results" | "detail">("home");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedCat, setSelectedCat] = useState("all");
  const [savedPlaces, setSavedPlaces] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setQuery(q); setLoading(true); setError(null); setView("results");
    try {
      const res = await fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
      const data = await res.json();
      if (data.error) { setError(data.error); setPlaces([]); }
      else { setPlaces(data.places || []); }
    } catch { setError("검색 중 오류가 발생했습니다. API 키를 확인해주세요."); setPlaces([]); }
    finally { setLoading(false); }
  }, []);

  const openDetail = useCallback(async (placeId: string) => {
    setDetailLoading(true); setView("detail");
    try {
      const res = await fetch("/api/place", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ placeId }) });
      setSelectedPlace(await res.json());
    } catch { setError("장소 정보를 불러올 수 없습니다."); }
    finally { setDetailLoading(false); }
  }, []);

  const toggleSave = (id: string) => setSavedPlaces((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const filteredPlaces = selectedCat === "all" ? places : places.filter((p) => p.category === selectedCat);

  // ── HOME ──
  if (view === "home") return (
    <main className="min-h-screen" style={{ background: "#FAFAF8" }}>
      <div className="max-w-[480px] mx-auto px-5">
        <div className="pt-16 pb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5" style={{ background: "rgba(232,93,58,0.06)", border: "1px solid rgba(232,93,58,0.12)", fontSize: 12, color: "#E85D3A", fontWeight: 600, letterSpacing: 1 }}>✓ KOREAN VERIFIED</div>
          <h1 className="text-[32px] font-extrabold leading-tight mb-2.5" style={{ color: "#1A1A2E", letterSpacing: -0.5 }}>한국인이 인증한<br />곳만 보여드려요</h1>
          <p className="text-[15px] leading-relaxed" style={{ color: "#888" }}>해외 구글 리뷰에서 한국인 리뷰만 필터링</p>
        </div>
        <div className="flex gap-2 mb-8">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-[14px] px-4" style={{ border: "1px solid #E8E8E4", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <span className="text-lg opacity-40">🔍</span>
            <input type="text" placeholder="도시 + 카테고리 (예: 방콕 마사지)" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSearch(query)} className="flex-1 border-none outline-none bg-transparent text-sm py-3.5" style={{ color: "#1A1A2E" }} />
          </div>
          <button onClick={() => doSearch(query)} className="px-5 rounded-[14px] border-none text-white text-sm font-semibold cursor-pointer" style={{ background: "#E85D3A", boxShadow: "0 2px 8px rgba(232,93,58,0.25)" }}>검색</button>
        </div>
        <div className="mb-9">
          <div className="text-[13px] font-bold mb-3.5" style={{ color: "#1A1A2E" }}>인기 검색어</div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((s) => (<button key={s} onClick={() => doSearch(s)} className="px-4 py-2.5 rounded-xl bg-white text-[13px] font-medium cursor-pointer hover:text-[#E85D3A]" style={{ border: "1px solid #E8E8E4", color: "#444" }}>{s}</button>))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 mb-8" style={{ border: "1px solid #E8E8E4" }}>
          <div className="text-[13px] font-bold mb-4" style={{ color: "#1A1A2E" }}>어떻게 작동하나요?</div>
          {[{ s: "1", t: "도시와 카테고리 검색", d: "방콕 마사지, 다낭 맛집..." }, { s: "2", t: "한국인 리뷰만 필터링", d: "구글 리뷰 중 한국어 리뷰를 자동 감지" }, { s: "3", t: "AI가 핵심만 요약", d: "Gemini가 리뷰를 3줄로 정리" }].map((item, i) => (
            <div key={i} className={`flex gap-3.5 items-start ${i < 2 ? "mb-4" : ""}`}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0" style={{ background: "rgba(232,93,58,0.08)", color: "#E85D3A" }}>{item.s}</div>
              <div><div className="text-[13px] font-semibold" style={{ color: "#1A1A2E" }}>{item.t}</div><div className="text-xs mt-0.5" style={{ color: "#999" }}>{item.d}</div></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );

  // ── RESULTS ──
  if (view === "results") return (
    <main className="min-h-screen" style={{ background: "#FAFAF8" }}>
      <div className="max-w-[480px] mx-auto px-5">
        <div className="flex items-center gap-3 py-5">
          <button onClick={() => setView("home")} className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center cursor-pointer" style={{ border: "1px solid #E8E8E4" }}>←</button>
          <div className="flex-1">
            <div className="text-lg font-bold" style={{ color: "#1A1A2E" }}>{query}</div>
            <div className="text-xs" style={{ color: "#999" }}>{loading ? "검색 중..." : `한국인 검증 장소 ${filteredPlaces.length}곳`}</div>
          </div>
        </div>
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (<button key={cat.key} onClick={() => setSelectedCat(cat.key)} className="px-3.5 py-2 rounded-[10px] border-none text-xs font-semibold cursor-pointer whitespace-nowrap" style={{ background: selectedCat === cat.key ? "#1A1A2E" : "#FFF", color: selectedCat === cat.key ? "#FFF" : "#666" }}>{cat.icon} {cat.label}</button>))}
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-4 border border-red-100">{error}</div>}
        {loading ? <div className="text-center py-20 text-sm" style={{ color: "#999" }}><div className="text-2xl mb-3 animate-bounce">🔍</div>한국인 리뷰를 찾는 중...</div> : (
          <div className="flex flex-col gap-3 pb-10">
            {filteredPlaces.map((place) => (
              <div key={place.id} onClick={() => openDetail(place.id)} className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow" style={{ border: "1px solid #E8E8E4" }}>
                {place.photo && (
                  <div className="h-[140px] bg-cover bg-center relative" style={{ backgroundImage: `url(${place.photo})` }}>
                    <div className="absolute top-2.5 left-2.5"><Badge type={place.badge} /></div>
                    <button onClick={(e) => { e.stopPropagation(); toggleSave(place.id); }} className="absolute top-2.5 right-2.5 w-8 h-8 rounded-lg bg-white/90 border-none cursor-pointer text-base flex items-center justify-center">{savedPlaces.has(place.id) ? "♥" : "♡"}</button>
                  </div>
                )}
                <div className="p-3.5">
                  <div className="text-[15px] font-bold" style={{ color: "#1A1A2E" }}>{place.name}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: "#AAA" }}>{place.address}</div>
                  <div className="flex gap-4 mt-2.5 p-2.5 rounded-[10px]" style={{ background: "#FAFAF8" }}>
                    <div>
                      <div className="text-[10px] font-semibold mb-0.5" style={{ color: "#999" }}>🇰🇷 한국인</div>
                      <div className="flex items-center gap-1.5"><StarRating rating={place.ratingKo} size={12} /><span className="text-sm font-bold" style={{ color: "#E85D3A" }}>{place.ratingKo || "-"}</span><span className="text-[11px]" style={{ color: "#BBB" }}>({place.reviewsKo})</span></div>
                    </div>
                    <div className="w-px" style={{ background: "#E8E8E4" }} />
                    <div>
                      <div className="text-[10px] font-semibold mb-0.5" style={{ color: "#999" }}>🌍 전체</div>
                      <div className="flex items-center gap-1.5"><StarRating rating={place.ratingAll} size={12} color="#94A3B8" /><span className="text-sm font-bold" style={{ color: "#666" }}>{place.ratingAll}</span><span className="text-[11px]" style={{ color: "#BBB" }}>({place.reviewsAll?.toLocaleString()})</span></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredPlaces.length === 0 && <div className="text-center py-16 text-sm" style={{ color: "#BBB" }}>한국인 검증 장소가 없어요</div>}
          </div>
        )}
      </div>
    </main>
  );

  // ── DETAIL ──
  if (view === "detail") {
    if (detailLoading || !selectedPlace) return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
        <div className="text-center text-sm" style={{ color: "#999" }}><div className="text-2xl mb-3 animate-spin">✦</div>AI가 리뷰를 분석 중...</div>
      </main>
    );
    const p = selectedPlace;
    return (
      <main className="min-h-screen" style={{ background: "#FAFAF8" }}>
        <div className="max-w-[480px] mx-auto">
          <div className="h-[220px] bg-cover bg-center relative" style={{ backgroundImage: p.photos?.[0] ? `url(${p.photos[0]})` : "linear-gradient(135deg, #E85D3A, #0EA5A0)" }}>
            <div className="absolute inset-0" style={{ background: "linear-gradient(transparent 50%, rgba(0,0,0,0.5))" }} />
            <button onClick={() => setView("results")} className="absolute top-4 left-4 w-9 h-9 rounded-[10px] bg-white/90 border-none cursor-pointer backdrop-blur-sm flex items-center justify-center">←</button>
            <div className="absolute bottom-4 left-4 right-4"><Badge type={p.badge} /><div className="text-[22px] font-extrabold text-white mt-2">{p.name}</div><div className="text-xs text-white/70 mt-0.5">{p.address}</div></div>
          </div>
          <div className="px-5 pb-10">
            <div className="flex gap-0 mt-5 rounded-[14px] overflow-hidden" style={{ border: "1px solid #E8E8E4" }}>
              <div className="flex-1 p-4 text-center bg-white"><div className="text-[10px] font-semibold mb-1.5" style={{ color: "#999" }}>🇰🇷 한국인 평점</div><div className="text-[28px] font-extrabold" style={{ color: "#E85D3A" }}>{p.ratingKo || "-"}</div><StarRating rating={p.ratingKo} size={13} /><div className="text-[11px] mt-1" style={{ color: "#BBB" }}>리뷰 {p.reviewsKo}개</div></div>
              <div className="w-px" style={{ background: "#E8E8E4" }} />
              <div className="flex-1 p-4 text-center bg-white"><div className="text-[10px] font-semibold mb-1.5" style={{ color: "#999" }}>🌍 전체 평점</div><div className="text-[28px] font-extrabold" style={{ color: "#666" }}>{p.ratingAll}</div><StarRating rating={p.ratingAll} size={13} color="#94A3B8" /><div className="text-[11px] mt-1" style={{ color: "#BBB" }}>리뷰 {p.reviewsAll?.toLocaleString()}개</div></div>
            </div>
            <div className="mt-5 p-4 rounded-[14px]" style={{ background: "linear-gradient(135deg, rgba(232,93,58,0.04), rgba(14,165,160,0.04))", border: "1px solid rgba(232,93,58,0.1)" }}>
              <div className="flex items-center gap-2 mb-2.5 text-xs font-bold" style={{ color: "#E85D3A" }}><span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-md text-[11px]" style={{ background: "rgba(232,93,58,0.1)" }}>✦</span>AI 리뷰 요약</div>
              <div className="text-[13px] leading-[1.7]" style={{ color: "#444" }}>{p.aiSummary}</div>
            </div>
            <div className="flex gap-2 mt-4">
              <a href={p.googleMapsUrl || "#"} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 rounded-xl text-white text-[13px] font-semibold text-center no-underline" style={{ background: "#1A1A2E" }}>📍 구글맵에서 보기</a>
              <button onClick={() => toggleSave(p.id)} className="py-3 px-4 rounded-xl bg-white text-[13px] cursor-pointer" style={{ border: "1px solid #E8E8E4", color: savedPlaces.has(p.id) ? "#E85D3A" : "#666" }}>{savedPlaces.has(p.id) ? "♥ 저장됨" : "♡ 저장"}</button>
            </div>
            <div className="mt-7">
              <div className="text-sm font-bold mb-3.5 flex items-center gap-2" style={{ color: "#1A1A2E" }}>🇰🇷 한국인 리뷰<span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ color: "#E85D3A", background: "rgba(232,93,58,0.06)" }}>{p.reviewsKo}개</span></div>
              {p.koreanReviews?.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {p.koreanReviews.map((r, i) => (
                    <div key={i} className="bg-white rounded-[14px] p-4" style={{ border: "1px solid #E8E8E4" }}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: `hsl(${(i * 73) % 360}, 40%, 92%)`, color: `hsl(${(i * 73) % 360}, 40%, 45%)` }}>{r.author[0]}</div>
                          <div><div className="text-xs font-semibold" style={{ color: "#1A1A2E" }}>{r.author}</div><div className="text-[10px]" style={{ color: "#BBB" }}>{r.date}</div></div>
                        </div>
                        <StarRating rating={r.rating} size={11} />
                      </div>
                      <div className="text-[13px] leading-[1.65]" style={{ color: "#555" }}>{r.text}</div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-center py-10 text-sm" style={{ color: "#BBB" }}>한국인 리뷰가 아직 없어요</div>}
            </div>
          </div>
        </div>
      </main>
    );
  }
  return null;
}
