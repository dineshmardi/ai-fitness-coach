import { useEffect, useMemo, useState } from "react";
import { ACCENT_COLORS } from "../constants";
import styles from "../styles";

export default function ExerciseBars({ data }) {
  const [mounted, setMounted] = useState(false);

  const counts = useMemo(() => {
    const c = {};
    data.forEach((w) =>
      w.exercises?.forEach((ex) => {
        c[ex.type] = (c[ex.type] || 0) + 1;
      }),
    );
    return c;
  }, [data]);

  const total = useMemo(
    () => Object.values(counts).reduce((s, v) => s + v, 0) || 1,
    [counts],
  );
  const sorted = useMemo(
    () => Object.entries(counts).sort((a, b) => b[1] - a[1]),
    [counts],
  );

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, [data]);

  if (!sorted.length) return <div style={styles.empty}>No exercise data</div>;

  return (
    <div>
      {sorted.map(([name, count], i) => (
        <div
          key={name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.45)",
              width: 54,
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            {name}
          </div>
          <div
            style={{
              flex: 1,
              height: 6,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 3,
                background: `linear-gradient(90deg, ${ACCENT_COLORS[i % ACCENT_COLORS.length]}, ${ACCENT_COLORS[(i + 1) % ACCENT_COLORS.length]})`,
                width: mounted ? `${Math.round((count / total) * 100)}%` : "0%",
                transition: "width 1s cubic-bezier(.4,0,.2,1)",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              width: 28,
              flexShrink: 0,
            }}
          >
            {count}
          </div>
        </div>
      ))}
    </div>
  );
}
