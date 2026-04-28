"use client";

import { useState } from "react";

interface CopyButtonProps {
  name: string;
  localName?: string;
}

export default function CopyButton({ name, localName }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyText = localName && localName !== name ? localName : name;
  const hasLocal = localName && localName !== name;

  async function handleCopy() {
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600 transition-colors px-2 py-1 rounded-lg hover:bg-brand-50"
      title={hasLocal ? `현지명 복사: ${copyText}` : "장소명 복사"}
    >
      {copied ? (
        <>
          <span>✓</span>
          <span className="text-brand-600 font-medium">복사됨</span>
        </>
      ) : (
        <>
          <span>📋</span>
          <span>{hasLocal ? "현지명 복사" : "복사"}</span>
        </>
      )}
    </button>
  );
}
