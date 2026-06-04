import { ringColor } from "./budget.js";

/**
 * Circular SVG progress ring.
 * - `pct` 0..1+ (clamped visually to 1). Color shifts green -> amber -> red.
 * - children render in the center (the big remaining-amount typography).
 */
export default function ProgressRing({
  pct,
  isOver = false,
  size = 220,
  stroke = 18,
  children,
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = isOver ? 1 : Math.min(Math.max(pct, 0), 1);
  const offset = circumference * (1 - filled);
  const color = ringColor(pct, isOver);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-gray-200 dark:stroke-white/10"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 500ms ease, stroke 300ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        {children}
      </div>
    </div>
  );
}
