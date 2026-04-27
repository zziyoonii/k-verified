"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600 transition-colors px-2 py-1 rounded-lg hover:bg-brand-50"
      title="장소명 복사 (바이두지도 검색용)"
    >
      {copied ? (
        <>
          <span>✓</span>
          <span className="text-brand-600 font-medium">복사됨</span>
        </>
      ) : (
        <>
          <span>📋</span>
          <span>복사</span>
        </>
      )}
    </button>
  );
}
