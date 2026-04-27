import { BadgeLevel } from "@/types";

const BADGE_CONFIG: Record<
  BadgeLevel,
  { label: string; emoji: string; className: string }
> = {
  발견: {
    label: "발견",
    emoji: "🔍",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  검증: {
    label: "검증",
    emoji: "✅",
    className: "bg-green-100 text-green-700 border border-green-200",
  },
  강력추천: {
    label: "강력추천",
    emoji: "🔥",
    className: "bg-brand-100 text-brand-700 border border-brand-200",
  },
};

interface BadgeProps {
  level: BadgeLevel;
  count: number;
  size?: "sm" | "md";
}

export default function Badge({ level, count, size = "md" }: BadgeProps) {
  const config = BADGE_CONFIG[level];
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeClass} ${config.className}`}
    >
      <span>{config.emoji}</span>
      <span>한국인 {config.label}</span>
      <span className="opacity-70">({count})</span>
    </span>
  );
}
