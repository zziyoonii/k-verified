"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-600">K-Verified</span>
          <span className="text-xs text-gray-400 hidden sm:block">
            한국인이 검증한 맛집
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-600 transition-colors">
            홈
          </Link>
        </nav>
      </div>
    </header>
  );
}
