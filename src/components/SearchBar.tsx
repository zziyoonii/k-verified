"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  defaultDest?: string;
  defaultCat?: string;
  size?: "lg" | "md";
}

export default function SearchBar({
  defaultDest = "",
  defaultCat = "",
  size = "lg",
}: SearchBarProps) {
  const [dest, setDest] = useState(defaultDest);
  const [cat, setCat] = useState(defaultCat);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!dest.trim()) return;
    const params = new URLSearchParams({ dest: dest.trim() });
    if (cat.trim()) params.set("cat", cat.trim());
    router.push(`/search?${params.toString()}`);
  }

  const isLg = size === "lg";

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
      <div className="flex gap-2">
        <div className={`relative flex-1 ${isLg ? "" : ""}`}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm select-none">
            📍
          </span>
          <input
            type="text"
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            placeholder="여행지 (예: 발리, 방콕)"
            className={`w-full pl-8 pr-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
              isLg ? "py-3.5 text-base" : "py-2.5 text-sm"
            }`}
          />
        </div>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm select-none">
            🔎
          </span>
          <input
            type="text"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            placeholder="업종 (예: 스파, 라멘)"
            className={`w-full pl-8 pr-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
              isLg ? "py-3.5 text-base" : "py-2.5 text-sm"
            }`}
          />
        </div>
        <button
          type="submit"
          className={`shrink-0 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold transition-colors ${
            isLg ? "px-5 py-3.5 text-base" : "px-4 py-2.5 text-sm"
          }`}
        >
          검색
        </button>
      </div>
    </form>
  );
}
