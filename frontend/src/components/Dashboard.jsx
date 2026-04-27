import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { getWorkoutSessions } from "../api/workoutApi";
import { exerciseConfig } from "../exercises/exerciseConfig";

// === MOCK DATA FALLBACK (replace getWorkoutSessions with your real API) ===
const EX_TYPES = ["squat", "pushup", "plank", "lunge", "deadlift", "pullup", "burpee", "crunch"];

function generateMockData() {
  const now = new Date();
  return Array.from({ length: 45 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * 85));
    const exCount = Math.floor(Math.random() * 3) + 1;
    return {
      _id: "mock_" + i,
      userId: "guest",
      exercises: Array.from({ length: exCount }, () => ({
        type: EX_TYPES[Math.floor(Math.random() * EX_TYPES.length)],
        reps: Math.floor(Math.random() * 20) + 5,
      })),
      totalCalories: Math.floor(Math.random() * 220) + 40,
      totalDuration: Math.floor(Math.random() * 3000) + 300,
      createdAt: d.toISOString(),
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// === CONSTANTS ===
const ACCENT_COLORS = ["#818cf8", "#a855f7", "#22d3ee", "#f472b6", "#34d399", "#fb923c"];
const WEEKLY_CAL_GOAL = 1000;
const NAV_ITEMS = [
  { label: "Dashboard", active: true, icon: "grid" },
  { label: "Workouts", icon: "activity" },
  { label: "Progress", icon: "trending-up" },
  { label: "Profile", icon: "user" },
  { label: "Log Session", icon: "plus-square", section: "Tools" },
  { label: "Goals", icon: "target" },
];

// === UTILITY FUNCTIONS ===
function fmtDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function filterByPeriod(data, filter) {
  const now = new Date();
  return data.filter((w) => {
    const d = new Date(w.createdAt);
    if (filter === "week") return (now - d) / 864e5 < 7;
    if (filter === "month")
      return now.getMonth() === d.getMonth() && now.getFullYear() === d.getFullYear();
    return now.getFullYear() === d.getFullYear();
  });
}

// === ICONS ===
const Icon = ({ name, size = 16, color = "currentColor" }) => {
  const s = { width: size, height: size, flexShrink: 0 };
  const icons = {
    grid: <svg style={s} viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill={color} /><rect x="9" y="1" width="6" height="6" rx="1.5" fill={color} opacity=".5" /><rect x="1" y="9" width="6" height="6" rx="1.5" fill={color} opacity=".5" /><rect x="9" y="9" width="6" height="6" rx="1.5" fill={color} opacity=".5" /></svg>,
    activity: <svg style={s} viewBox="0 0 16 16" fill="none"><path d="M2 8h2l2-5 3 10 2-6 1 1h2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    "trending-up": <svg style={s} viewBox="0 0 16 16" fill="none"><path d="M2 12L6 7l3 3 5-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 4h4v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    user: <svg style={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="3" stroke={color} strokeWidth="1.5" /><path d="M2.5 14c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>,
    "plus-square": <svg style={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke={color} strokeWidth="1.5" /><path d="M8 5v6M5 8h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>,
    target: <svg style={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" /><circle cx="8" cy="8" r="3" stroke={color} strokeWidth="1.5" /><circle cx="8" cy="8" r="1" fill={color} /></svg>,
    flame: <svg style={s} viewBox="0 0 16 16" fill="none"><path d="M8 2C8 2 3 6.5 3 10a5 5 0 0010 0C13 6.5 8 2 8 2z" stroke={color} strokeWidth="1.5" fill="rgba(168,85,247,0.15)" /><path d="M8 7c0 0-2 1.5-2 3a2 2 0 004 0C10 8.5 8 7 8 7z" fill={color} opacity=".5" /></svg>,
    clock: <svg style={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" /><path d="M8 5v3.5l2.5 1.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>,
    zap: <svg style={s} viewBox="0 0 16 16" fill="none"><path d="M9 2L4 9h4l-1 5L13 7H9L9 2z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /></svg>,
    bar: <svg style={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="9" width="3" height="5" rx="1" fill={color} opacity=".5" /><rect x="6.5" y="5" width="3" height="9" rx="1" fill={color} opacity=".75" /><rect x="11" y="2" width="3" height="12" rx="1" fill={color} /></svg>,
  };
  return icons[name] || null;
};

// === ANIMATED COUNT-UP HOOK ===
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

// === STAT CARD ===
function StatCard({ label, value, sub, icon, gradient, accentBg, delay = 0 }) {
  const displayVal = useCountUp(typeof value === "number" ? value : 0);
  return (
    <div style={{
      ...styles.glass,
      animationDelay: `${delay}ms`,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)" }} />
      <div style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 10, background: accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={17} color={ACCENT_COLORS[0]} />
      </div>
      <div style={styles.cardLabel}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.5px", background: gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        {typeof value === "number" ? displayVal.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 6 }}>{sub}</div>
    </div>
  );
}

// === GOAL RING ===
function GoalRing({ totalCal, goal = WEEKLY_CAL_GOAL }) {
  const pct = Math.min(totalCal / goal, 1);
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, [pct]);

  const color = pct >= 1 ? "#34d399" : pct >= 0.6 ? "#818cf8" : "#f472b6";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="120" height="120" viewBox="0 0 110 110">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="55" cy="55" r={r} fill="none"
          stroke={pct >= 1 ? "#34d399" : "url(#ringGrad)"}
          strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={animated ? offset : circ}
          transform="rotate(-90 55 55)"
          style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)", }}
        />
        <text x="55" y="50" textAnchor="middle" fontSize="19" fontWeight="700" fill={color}>
          {Math.round(pct * 100)}%
        </text>
        <text x="55" y="66" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)">of goal</text>
      </svg>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, textAlign: "center" }}>
        {Math.min(totalCal, goal).toLocaleString()} / {goal.toLocaleString()} kcal
      </div>
    </div>
  );
}
// === HEATMAP (FINAL FIXED - GITHUB STYLE) ===
function Heatmap({ allData }) {

  // ✅ SAFE DATE KEY (NO TIMEZONE BUG)
  const getKey = (date) => {
    const d = new Date(date);
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  };

  // === CAL MAP ===
  const calMap = useMemo(() => {
    const map = {};
    allData.forEach((w) => {
      const key = getKey(w.createdAt);
      map[key] = (map[key] || 0) + (w.totalCalories || 0);
    });
    return map;
  }, [allData]);

  // === DATE RANGE (FULL DATA RANGE) ===
  const cells = useMemo(() => {
    if (!allData.length) return [];

    const dates = allData.map(w => new Date(w.createdAt));
    const start = new Date(Math.min(...dates));
    const end = new Date();

    const days = Math.ceil((end - start) / 86400000);

    return Array.from({ length: days }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const val = calMap[getKey(d)] || 0;

      return { date: d, val };
    });
  }, [allData, calMap]);

  // === MAX CAL ===
  const maxCal = useMemo(
    () => Math.max(...cells.map(c => c.val), 1),
    [cells]
  );

  // === COLOR SCALE ===
  const getColor = (val) => {
    const i = val / maxCal;
    if (i > 0.75) return "#c4b5fd";
    if (i > 0.5) return "#818cf8";
    if (i > 0.25) return "#4f46e5";
    if (i > 0) return "#312e81";
    return "rgba(255,255,255,0.05)";
  };

  // === GROUP INTO WEEKS (CRITICAL FIX) ===
  const weeks = useMemo(() => {
    const arr = [];
    let week = [];

    cells.forEach((c, i) => {
      const day = c.date.getDay(); // 0=Sun

      if (i === 0) {
        for (let j = 0; j < day; j++) week.push(null);
      }

      week.push(c);

      if (day === 6) {
        arr.push(week);
        week = [];
      }
    });

    if (week.length) arr.push(week);

    return arr;
  }, [cells]);

  return (
    <div style={{ width: "100%" }}>

      {/* === MONTH LABELS === */}
      <div style={{
        display: "flex",
        gap: 8,
        marginBottom: 6,
        overflowX: "auto"
      }}>
        {weeks.map((week, i) => {
          const first = week.find(d => d);
          if (!first) return <div key={i} style={{ width: 14 }} />;

          const month = first.date.toLocaleString("default", { month: "short" });

          return (
            <div key={i} style={{
              width: 14,
              fontSize: 10,
              color: "rgba(255,255,255,0.4)"
            }}>
              {i === 0 ||
                month !== weeks[i - 1]?.find(d => d)?.date.toLocaleString("default", { month: "short" })
                ? month
                : ""}
            </div>
          );
        })}
      </div>

      {/* === MAIN HEATMAP === */}
      <div style={{
        display: "flex",
        gap: 2,
        overflowX: "auto"
      }}>

        {/* DAY LABELS */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          marginRight: 6,
          fontSize: 9,
          color: "rgba(255,255,255,0.25)"
        }}>
          <span>Mon</span>
          <span></span>
          <span>Wed</span>
          <span></span>
          <span>Fri</span>
          <span></span>
          <span>Sun</span>
        </div>

        {/* GRID */}
        <div style={{
          display: "flex",
          gap: 2
        }}>
          {weeks.map((week, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateRows: "repeat(7, 12px)",
              gap: 2
            }}>
              {week.map((c, j) => (
                <div
                  key={j}
                  title={
                    c
                      ? `${c.date.toDateString()} — ${c.val || 0} kcal`
                      : ""
                  }
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    background: c ? getColor(c.val) : "transparent",
                    transition: "all 0.15s"
                  }}
                />
              ))}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
// === BAR BREAKDOWN ===
function ExerciseBars({ data }) {
  const [mounted, setMounted] = useState(false);

  const counts = useMemo(() => {
    const c = {};
    data.forEach((w) => w.exercises?.forEach((ex) => { c[ex.type] = (c[ex.type] || 0) + 1; }));
    return c;
  }, [data]);

  const total = useMemo(() => Object.values(counts).reduce((s, v) => s + v, 0) || 1, [counts]);
  const sorted = useMemo(() => Object.entries(counts).sort((a, b) => b[1] - a[1]), [counts]);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, [data]);

  if (!sorted.length) return <div style={styles.empty}>No exercise data</div>;

  return (
    <div>
      {sorted.map(([name, count], i) => (
        <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", width: 54, textAlign: "right", flexShrink: 0 }}>{name}</div>
          <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3,
              background: `linear-gradient(90deg, ${ACCENT_COLORS[i % ACCENT_COLORS.length]}, ${ACCENT_COLORS[(i + 1) % ACCENT_COLORS.length]})`,
              width: mounted ? `${Math.round((count / total) * 100)}%` : "0%",
              transition: "width 1s cubic-bezier(.4,0,.2,1)",
            }} />
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", width: 28, flexShrink: 0 }}>{count}</div>
        </div>
      ))}
    </div>
  );
}

// === SESSIONS FEED ===
function SessionsFeed({ data }) {
  const recent = useMemo(() => data.slice(0, 6), [data]);
  if (!recent.length) return <div style={styles.empty}>No sessions in this period</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
      {recent.map((w, idx) => (
        <div key={w._id} style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12, padding: "12px 14px",
          animation: "fadeUp 0.4s ease both",
          animationDelay: `${idx * 50}ms`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              {new Date(w.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#818cf8" }}>{w.totalCalories} kcal</div>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginBottom: 8 }}>{fmtDuration(w.totalDuration)} active</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {(w.exercises || []).map((ex, i) => (
              <span key={i} style={{
                fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 500,
                background: idx % 2 === 0 ? "rgba(99,102,241,0.15)" : "rgba(168,85,247,0.15)",
                color: idx % 2 === 0 ? "#a5b4fc" : "#d8b4fe",
                border: `1px solid ${idx % 2 === 0 ? "rgba(99,102,241,0.25)" : "rgba(168,85,247,0.25)"}`,
              }}>
                {(exerciseConfig.find(e => e.name === ex.type)?.label) || ex.type}{ex.reps ? ` · ${ex.reps}r` : ""}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// === LINE CHART (pure SVG, no library) ===
function CaloriesChart({ data }) {
  const sorted = useMemo(() => [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)), [data]);
  const vals = useMemo(() => sorted.map((w) => w.totalCalories || 0), [sorted]);

  const W = 600, H = 160, PAD = { top: 12, right: 12, bottom: 28, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const maxV = Math.max(...vals, 10);

  const points = useMemo(() =>
    vals.map((v, i) => ({
      x: PAD.left + (vals.length < 2 ? chartW / 2 : (i / (vals.length - 1)) * chartW),
      y: PAD.top + chartH - (v / maxV) * chartH,
    })), [vals, maxV, chartW, chartH]);

  if (!vals.length) return <div style={styles.empty}>No data for this period</div>;

  const pathD = points.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `C ${cpX} ${prev.y} ${cpX} ${p.y} ${p.x} ${p.y}`;
  }).join(" ");

  const areaD = pathD + ` L ${points[points.length - 1].x} ${PAD.top + chartH} L ${points[0].x} ${PAD.top + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((v) => (
        <line key={v} x1={PAD.left} x2={W - PAD.right} y1={PAD.top + chartH * (1 - v)} y2={PAD.top + chartH * (1 - v)}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      {[0, 0.5, 1].map((v) => (
        <text key={v} x={PAD.left - 6} y={PAD.top + chartH * (1 - v) + 4} textAnchor="end"
          fontSize="9" fill="rgba(255,255,255,0.25)">{Math.round(maxV * v)}</text>
      ))}
      <path d={areaD} fill="url(#lineGrad)" />
      <path d={pathD} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#818cf8" stroke="#0d0820" strokeWidth="2">
          <title>{sorted[i] ? new Date(sorted[i].createdAt).toLocaleDateString("en", { month: "short", day: "numeric" }) + ": " + vals[i] + " kcal" : ""}</title>
        </circle>
      ))}
      {sorted.length <= 10 && sorted.map((w, i) => (
        <text key={i} x={points[i].x} y={H - 4} textAnchor="middle" fontSize="8.5" fill="rgba(255,255,255,0.22)">
          {new Date(w.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
        </text>
      ))}
    </svg>
  );
}

// === DONUT CHART ===
function DonutChart({ data }) {
  const counts = useMemo(() => {
    const c = {};
    data.forEach((w) => w.exercises?.forEach((ex) => { c[ex.type] = (c[ex.type] || 0) + 1; }));
    return c;
  }, [data]);

  const slices = useMemo(() => {
    const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
    let startAngle = -Math.PI / 2;
    return Object.entries(counts).map(([name, count], i) => {
      const angle = (count / total) * 2 * Math.PI;
      const endAngle = startAngle + angle;
      const r = 44, cx = 55, cy = 55, ir = 28;
      const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
      const ix1 = cx + ir * Math.cos(startAngle), iy1 = cy + ir * Math.sin(startAngle);
      const ix2 = cx + ir * Math.cos(endAngle), iy2 = cy + ir * Math.sin(endAngle);
      const large = angle > Math.PI ? 1 : 0;
      const d = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1} Z`;
      startAngle = endAngle;
      return { name, count, pct: Math.round((count / total) * 100), d, color: ACCENT_COLORS[i % ACCENT_COLORS.length] };
    });
  }, [counts]);

  if (!slices.length) return <div style={styles.empty}>No exercises</div>;

  return (
    <div>
      <svg viewBox="0 0 110 110" style={{ width: "100%", maxWidth: 130, display: "block", margin: "0 auto" }}>
        {slices.map((s, i) => (
          <path key={i} d={s.d} fill={s.color} opacity="0.9"
            style={{ transition: "opacity 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.9")}>
            <title>{s.name}: {s.pct}%</title>
          </path>
        ))}
        <circle cx="55" cy="55" r="26" fill="rgba(13,8,32,0.8)" />
        <text x="55" y="51" textAnchor="middle" fontSize="11" fontWeight="700" fill="#c4b5fd">{slices.length}</text>
        <text x="55" y="63" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)">types</text>
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
        {slices.map((s) => (
          <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            {s.name} <span style={{ color: "rgba(255,255,255,0.25)" }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// === STYLES ===
const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #06040f 0%, #0d0820 45%, #080d1f 100%)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: "#e2e8f0",
    position: "relative",
    overflow: "hidden",
  },
  orb1: {
    position: "absolute", width: 500, height: 500, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
    top: -100, left: 80, pointerEvents: "none",
  },
  orb2: {
    position: "absolute", width: 400, height: 400, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)",
    bottom: 60, right: 100, pointerEvents: "none",
  },
  sidebar: {
    width: 210, flexShrink: 0,
    background: "rgba(255,255,255,0.025)",
    borderRight: "1px solid rgba(255,255,255,0.07)",
    display: "flex", flexDirection: "column", gap: 2,
    zIndex: 2, paddingBottom: 0,
  },
  brandWrap: {
    padding: "22px 20px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    marginBottom: 10,
  },
  brandName: {
    fontSize: 18, fontWeight: 700,
    background: "linear-gradient(90deg, #818cf8, #a78bfa)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  brandSub: { fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2, letterSpacing: "0.8px" },
  navSection: { fontSize: 9.5, color: "rgba(255,255,255,0.2)", padding: "10px 20px 4px", letterSpacing: "1px", textTransform: "uppercase" },
  navItem: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 20px", fontSize: 13, cursor: "pointer",
    borderLeft: "2px solid transparent", transition: "all 0.18s",
    color: "rgba(255,255,255,0.38)",
  },
  navItemActive: {
    color: "#a78bfa",
    background: "rgba(139,92,246,0.1)",
    borderLeft: "2px solid #a78bfa",
  },
  sidebarBottom: {
    marginTop: "auto", padding: "16px 20px",
    borderTop: "1px solid rgba(255,255,255,0.07)",
  },
  avatar: {
    width: 32, height: 32, borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #a78bfa)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
  },
  main: { flex: 1, padding: 24, overflowY: "auto", zIndex: 2, minWidth: 0 },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 },
  filterRow: {
    display: "flex", gap: 5,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10, padding: 4,
  },
  bento: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 },
  glass: {
    background: "rgba(255,255,255,0.045)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 16, padding: 18,
    animation: "fadeUp 0.45s ease both",
    position: "relative", overflow: "hidden",
    transition: "border-color 0.2s",
  },
  cardLabel: { fontSize: 10, color: "rgba(255,255,255,0.32)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 },
  sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.82)" },
  empty: { color: "rgba(255,255,255,0.25)", fontSize: 12, padding: "24px 0", textAlign: "center" },
};

// === MAIN DASHBOARD ===
export default function Dashboard() {
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getWorkoutSessions();

        if (Array.isArray(data)) {
          setAllData(data);
        } else {
          setAllData([]);
        }

      } catch (err) {
        console.error("API failed → using mock fallback", err);
        setAllData(generateMockData()); // fallback
      }
    }

    load();
  }, []);
  // Replace the above with your real API call:
  // const [allData, setAllData] = useState([]);
  // useEffect(() => { getWorkoutSessions().then(setAllData); }, []);

  const [filter, setFilter] = useState("week");

  const filtered = useMemo(() => filterByPeriod(allData, filter), [allData, filter]);

  const stats = useMemo(() => ({
    workouts: filtered.length,
    calories: filtered.reduce((s, w) => s + (w.totalCalories || 0), 0),
    duration: filtered.reduce((s, w) => s + (w.totalDuration || 0), 0),
    avgCal: filtered.length ? Math.round(filtered.reduce((s, w) => s + (w.totalCalories || 0), 0) / filtered.length) : 0,
  }), [filtered]);

  const handleFilter = useCallback((f) => setFilter(f), []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        @media (max-width: 768px) {
          .dash-sidebar { display: none !important; }
          .dash-bento { grid-template-columns: 1fr !important; }
          .dash-span2, .dash-span3 { grid-column: span 1 !important; }
        }
      `}</style>

      <div style={styles.root}>
        <div style={styles.orb1} />
        <div style={styles.orb2} />

        {/* === SIDEBAR === */}
        <div style={styles.sidebar} className="dash-sidebar">
          <div style={styles.brandWrap}>
            <div style={styles.brandName}>FitPulse</div>
            <div style={styles.brandSub}>AI FITNESS STUDIO</div>
          </div>

          {NAV_ITEMS.map((item, i) => (
            <div key={item.label}>
              {item.section && <div style={styles.navSection}>{item.section}</div>}
              <div style={{ ...styles.navItem, ...(item.active ? styles.navItemActive : {}) }}
                onMouseEnter={(e) => { if (!item.active) { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; } }}
                onMouseLeave={(e) => { if (!item.active) { e.currentTarget.style.color = "rgba(255,255,255,0.38)"; e.currentTarget.style.background = "transparent"; } }}>
                <Icon name={item.icon} size={15} color={item.active ? "#a78bfa" : "currentColor"} />
                {item.label}
              </div>
            </div>
          ))}

          <div style={styles.sidebarBottom}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={styles.avatar}>AK</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>Aryan K.</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Pro Member</div>
              </div>
            </div>
          </div>
        </div>

        {/* === MAIN CONTENT === */}
        <div style={styles.main}>

          {/* === TOPBAR === */}
          <div style={styles.topbar}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Dashboard</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.32)", marginTop: 2 }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>
            <div style={styles.filterRow}>
              {["week", "month", "year"].map((f) => (
                <button key={f} onClick={() => handleFilter(f)} style={{
                  padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 500,
                  border: "none", cursor: "pointer", transition: "all 0.2s",
                  background: filter === f ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent",
                  color: filter === f ? "#fff" : "rgba(255,255,255,0.38)",
                  boxShadow: filter === f ? "0 2px 12px rgba(99,102,241,0.35)" : "none",
                }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
              ))}
            </div>
          </div>

          {/* === BENTO GRID === */}
          <div style={styles.bento} className="dash-bento">

            {/* === STAT CARDS === */}
            <StatCard label="Total Workouts" value={stats.workouts} sub="sessions tracked"
              icon="activity" gradient="linear-gradient(135deg,#818cf8,#6366f1)"
              accentBg="rgba(99,102,241,0.15)" delay={50} />

            <StatCard label="Calories Burned" value={stats.calories} sub="kcal this period"
              icon="flame" gradient="linear-gradient(135deg,#c084fc,#a855f7)"
              accentBg="rgba(168,85,247,0.15)" delay={100} />

            <div style={{ ...styles.glass, animationDelay: "150ms" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)" }} />
              <div style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="clock" size={17} color="#6ee7b7" />
              </div>
              <div style={styles.cardLabel}>Active Time</div>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px", background: "linear-gradient(135deg,#6ee7b7,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {fmtDuration(stats.duration)}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 6 }}>total duration</div>
            </div>

            {/* === CALORIES LINE CHART === */}
            <div style={{ ...styles.glass, gridColumn: "span 2", animationDelay: "200ms" }} className="dash-span2">
              <div style={styles.sectionHead}>
                <div style={styles.sectionTitle}>Calories over time</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                  <div style={{ width: 20, height: 2, background: "#818cf8", borderRadius: 1 }} />
                  kcal / session
                </div>
              </div>
              <CaloriesChart data={filtered} />
            </div>

            {/* === GOAL RING === */}
            <div style={{ ...styles.glass, animationDelay: "250ms", display: "flex", flexDirection: "column" }}>
              <div style={styles.sectionHead}><div style={styles.sectionTitle}>Weekly goal</div></div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GoalRing totalCal={stats.calories} />
              </div>
            </div>

            {/* === EXERCISE BARS === */}
            <div style={{ ...styles.glass, gridColumn: "span 2", animationDelay: "300ms" }} className="dash-span2">
              <div style={styles.sectionHead}><div style={styles.sectionTitle}>Exercise breakdown</div></div>
              <ExerciseBars data={filtered} />
            </div>

            {/* === DONUT === */}
            <div style={{ ...styles.glass, animationDelay: "350ms" }}>
              <div style={styles.sectionHead}><div style={styles.sectionTitle}>Split</div></div>
              <DonutChart data={filtered} />
            </div>

            {/* === HEATMAP === */}
            <div style={{ ...styles.glass, gridColumn: "span 3", animationDelay: "400ms" }} className="dash-span3">
              <div style={styles.sectionHead}>
                <div style={styles.sectionTitle}>Activity heatmap — last 10 weeks</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                  <span>Low</span>
                  {["rgba(255,255,255,0.05)", "#312e81", "#4f46e5", "#818cf8", "#c4b5fd"].map((c, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                  ))}
                  <span>High</span>
                </div>
              </div>
              <Heatmap allData={allData} />
            </div>

            {/* === SESSIONS FEED === */}
            <div style={{ ...styles.glass, gridColumn: "span 3", animationDelay: "450ms" }} className="dash-span3">
              <div style={styles.sectionHead}>
                <div style={styles.sectionTitle}>Recent sessions</div>
                <div style={{ fontSize: 11, color: "#818cf8", cursor: "pointer", opacity: 0.8 }}>see all</div>
              </div>
              <SessionsFeed data={filtered} />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
