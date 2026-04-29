import { useEffect, useRef, useState } from "react";
import styles from "../styles";
import Icon from "../icons";
import { ACCENT_COLORS } from "../constants";

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

export default function StatCard({
  label,
  value,
  sub,
  icon,
  gradient,
  accentBg,
  delay = 0,
}) {
  const displayVal = useCountUp(typeof value === "number" ? value : 0);

  return (
    <div
      style={{
        ...styles.glass,
        animationDelay: `${delay}ms`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background:
            "linear-gradient(90deg,transparent,rgba(var(--accent-rgb),0.35),transparent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: 10,
          background: accentBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={17} color={ACCENT_COLORS[0]} />
      </div>
      <div style={styles.cardLabel}>{label}</div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "-0.5px",
          background: gradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {typeof value === "number" ? displayVal.toLocaleString() : value}
      </div>
      <div
        style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 6 }}
      >
        {sub}
      </div>
    </div>
  );
}
