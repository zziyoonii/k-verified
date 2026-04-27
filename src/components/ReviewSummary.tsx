interface ReviewSummaryProps {
  summary: string;
}

export default function ReviewSummary({ summary }: ReviewSummaryProps) {
  const lines = summary
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="bg-brand-50 rounded-2xl p-4 border border-brand-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-brand-600 font-bold text-sm">AI 요약</span>
        <span className="text-xs text-brand-400">한국인 리뷰 기반</span>
      </div>
      <div className="space-y-2">
        {lines.map((line, i) => (
          <p key={i} className="text-sm text-gray-700 leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
