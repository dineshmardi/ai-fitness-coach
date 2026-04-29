import { useEffect, useState } from "react";
import { WEEKLY_CAL_GOAL } from "../constants";

export default function GoalRing({ totalCal, goal = WEEKLY_CAL_GOAL }) {
  const pct = Math.min(totalCal / goal, 1);
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, [pct]);

  const color =
    pct >= 1 ? "var(--accent)" : pct >= 0.6 ? "var(--accent-2)" : "#ffd36a";

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <svg width="120" height="120" viewBox="0 0 110 110">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
        />
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke={pct >= 1 ? "var(--accent)" : "url(#ringGrad)"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={animated ? offset : circ}
          transform="rotate(-90 55 55)"
          style={{
            transition: "stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)",
          }}
        />
        <text
          x="55"
          y="50"
          textAnchor="middle"
          fontSize="19"
          fontWeight="700"
          fill={color}
        >
          {Math.round(pct * 100)}%
        </text>
        <text
          x="55"
          y="66"
          textAnchor="middle"
          fontSize="9"
          fill="rgba(255,255,255,0.3)"
        >
          of goal
        </text>
      </svg>
      <div
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.3)",
          marginTop: 4,
          textAlign: "center",
        }}
      >
        {Math.min(totalCal, goal).toLocaleString()} / {goal.toLocaleString()}{" "}
        kcal
      </div>
    </div>
  );
}
