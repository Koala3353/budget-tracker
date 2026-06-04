import { useEffect, useState } from "react";
import { ringColor } from "./budget.js";

/**
 * Hero progress ring. Animates the stroke from empty to its target on mount
 * and on any state change (transition-all duration-700 ease-out).
 * Color: matcha (safe) -> amber (>=80%) -> red (over). Children render centered.
 */
export default function ProgressRing({
  pct,
  isOver = false,
  size = 240,
  stroke = 22,
  children,
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = isOver ? 1 : Math.min(Math.max(pct, 0), 1);
  const color = ringColor(pct, isOver);

  // Animate in: start empty, then ease to target on the next frame.
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setProgress(target));
    return () => cancelAnimationFrame(id);
  }, [target]);
  const offset = circumference * (1 - progress);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-gray-200/80 dark:stroke-gray-800"
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
          className="transition-all duration-700 ease-out"
          style={{ filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.10))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        {children}
      </div>
    </div>
  );
}
