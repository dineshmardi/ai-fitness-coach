import { useMemo } from "react";
import styles from "../styles";

export default function CaloriesChart({ data }) {
  const sorted = useMemo(
    () =>
      [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [data],
  );
  const vals = useMemo(() => sorted.map((w) => w.totalCalories || 0), [sorted]);

  const W = 600,
    H = 160,
    PAD = { top: 12, right: 12, bottom: 28, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const maxV = Math.max(...vals, 10);

  const points = useMemo(
    () =>
      vals.map((v, i) => ({
        x:
          PAD.left +
          (vals.length < 2 ? chartW / 2 : (i / (vals.length - 1)) * chartW),
        y: PAD.top + chartH - (v / maxV) * chartH,
      })),
    [vals, maxV, chartW, chartH, PAD.left, PAD.top],
  );

  if (!vals.length)
    return <div style={styles.empty}>No data for this period</div>;

  const pathD = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cpX = (prev.x + p.x) / 2;
      return `C ${cpX} ${prev.y} ${cpX} ${p.y} ${p.x} ${p.y}`;
    })
    .join(" ");

  const areaD =
    pathD +
    ` L ${points[points.length - 1].x} ${PAD.top + chartH} L ${points[0].x} ${PAD.top + chartH} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", overflow: "visible" }}
    >
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((v) => (
        <line
          key={v}
          x1={PAD.left}
          x2={W - PAD.right}
          y1={PAD.top + chartH * (1 - v)}
          y2={PAD.top + chartH * (1 - v)}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      ))}
      {[0, 0.5, 1].map((v) => (
        <text
          key={v}
          x={PAD.left - 6}
          y={PAD.top + chartH * (1 - v) + 4}
          textAnchor="end"
          fontSize="9"
          fill="rgba(255,255,255,0.25)"
        >
          {Math.round(maxV * v)}
        </text>
      ))}
      <path d={areaD} fill="url(#lineGrad)" />
      <path
        d={pathD}
        fill="none"
        stroke="var(--accent-2)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3.5"
          fill="var(--accent-2)"
          stroke="#0a1011"
          strokeWidth="2"
        >
          <title>
            {sorted[i]
              ? new Date(sorted[i].createdAt).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                }) +
                ": " +
                vals[i] +
                " kcal"
              : ""}
          </title>
        </circle>
      ))}
      {sorted.length <= 10 &&
        sorted.map((w, i) => (
          <text
            key={i}
            x={points[i].x}
            y={H - 4}
            textAnchor="middle"
            fontSize="8.5"
            fill="rgba(255,255,255,0.22)"
          >
            {new Date(w.createdAt).toLocaleDateString("en", {
              month: "short",
              day: "numeric",
            })}
          </text>
        ))}
    </svg>
  );
}
