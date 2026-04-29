import { useMemo } from "react";
import styles from "../styles";
import { ACCENT_COLORS } from "../constants";

export default function DonutChart({ data }) {
  const counts = useMemo(() => {
    const c = {};
    data.forEach((w) =>
      w.exercises?.forEach((ex) => {
        c[ex.type] = (c[ex.type] || 0) + 1;
      }),
    );
    return c;
  }, [data]);

  const slices = useMemo(() => {
    const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
    let startAngle = -Math.PI / 2;
    return Object.entries(counts).map(([name, count], i) => {
      const angle = (count / total) * 2 * Math.PI;
      const endAngle = startAngle + angle;
      const r = 44,
        cx = 55,
        cy = 55,
        ir = 28;
      const x1 = cx + r * Math.cos(startAngle),
        y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle),
        y2 = cy + r * Math.sin(endAngle);
      const ix1 = cx + ir * Math.cos(startAngle),
        iy1 = cy + ir * Math.sin(startAngle);
      const ix2 = cx + ir * Math.cos(endAngle),
        iy2 = cy + ir * Math.sin(endAngle);
      const large = angle > Math.PI ? 1 : 0;
      const d = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1} Z`;
      startAngle = endAngle;
      return {
        name,
        count,
        pct: Math.round((count / total) * 100),
        d,
        color: ACCENT_COLORS[i % ACCENT_COLORS.length],
      };
    });
  }, [counts]);

  if (!slices.length) return <div style={styles.empty}>No exercises</div>;

  return (
    <div>
      <svg
        viewBox="0 0 110 110"
        style={{
          width: "100%",
          maxWidth: 130,
          display: "block",
          margin: "0 auto",
        }}
      >
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.d}
            fill={s.color}
            opacity="0.9"
            style={{ transition: "opacity 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.9")}
          >
            <title>
              {s.name}: {s.pct}%
            </title>
          </path>
        ))}
        <circle cx="55" cy="55" r="26" fill="rgba(7,12,14,0.85)" />
        <text
          x="55"
          y="51"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill="var(--accent)"
        >
          {slices.length}
        </text>
        <text
          x="55"
          y="63"
          textAnchor="middle"
          fontSize="8"
          fill="rgba(255,255,255,0.3)"
        >
          types
        </text>
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
        {slices.map((s) => (
          <div
            key={s.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: s.color,
                flexShrink: 0,
              }}
            />
            {s.name}{" "}
            <span style={{ color: "rgba(255,255,255,0.25)" }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
