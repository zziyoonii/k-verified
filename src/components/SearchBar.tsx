"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  defaultValue?: string;
  size?: "lg" | "md";
}

export default function SearchBar({
  defaultValue = "",
  size = "lg",
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  const inputClass =
    size === "lg"
      ? "w-full text-base px-5 py-4 rounded-2xl border border-gray-200 shadow focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      : "w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent";

  const btnClass =
    size === "lg"
      ? "absolute right-2 top-1/2 -translate-y-1/2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors"
      : "absolute right-2 top-1/2 -translate-y-1/2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors";

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="예: 방콕 마사지, 도쿄 라멘, 파리 카페"
        className={inputClass}
      />
      <button type="submit" className={btnClass}>
        검색
      </button>
    </form>
  );
}
