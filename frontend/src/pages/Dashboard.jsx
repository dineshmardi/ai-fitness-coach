import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkoutSessions } from "../api/workoutApi";
import Icon from "./dashboard/icons";
import styles from "./dashboard/styles";
import { EX_TYPES } from "./dashboard/constants";
import { filterByPeriod, fmtDuration } from "./dashboard/utils";
import StatCard from "./dashboard/components/StatCard";
import GoalRing from "./dashboard/components/GoalRing";
import Heatmap from "./dashboard/components/Heatmap";
import ExerciseBars from "./dashboard/components/ExerciseBars";
import SessionsFeed from "./dashboard/components/SessionsFeed";
import CaloriesChart from "./dashboard/components/CaloriesChart";
import DonutChart from "./dashboard/components/DonutChart";
import { SectionHeader } from "../ui";
import { useAuth } from "../auth/AuthContext";

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

// === MAIN DASHBOARD ===
export default function Dashboard() {
  const [allData, setAllData] = useState([]);
  const [authError, setAuthError] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await getWorkoutSessions();

        if (Array.isArray(data)) {
          setAllData(data);
          setAuthError("");
        } else {
          setAllData([]);
        }
      } catch (err) {
        if (err?.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }
        console.error("API failed → using mock fallback", err);
        setAuthError("Unable to load workouts. Showing sample data.");
        setAllData(generateMockData()); // fallback
      }
    }

    load();
  }, []);
  // Replace the above with your real API call:
  // const [allData, setAllData] = useState([]);
  // useEffect(() => { getWorkoutSessions().then(setAllData); }, []);

  const [filter, setFilter] = useState("week");

  const filtered = useMemo(
    () => filterByPeriod(allData, filter),
    [allData, filter],
  );

  const stats = useMemo(
    () => ({
      workouts: filtered.length,
      calories: filtered.reduce((s, w) => s + (w.totalCalories || 0), 0),
      duration: filtered.reduce((s, w) => s + (w.totalDuration || 0), 0),
      avgCal: filtered.length
        ? Math.round(
            filtered.reduce((s, w) => s + (w.totalCalories || 0), 0) /
              filtered.length,
          )
        : 0,
    }),
    [filtered],
  );

  const handleFilter = useCallback((f) => setFilter(f), []);

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        @media (max-width: 980px) {
          .dash-sidebar { display: none !important; }
          .dash-bento { grid-template-columns: 1fr !important; }
          .dash-span2, .dash-span3 { grid-column: span 1 !important; }
        }
      `}</style>

      <div style={styles.root}>
        <div style={styles.orb1} />
        <div style={styles.orb2} />

        {/* === MAIN CONTENT === */}
        <div style={styles.main}>
          {authError && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.7)",
                fontSize: "12px",
                marginBottom: "12px",
              }}
            >
              {authError}
            </div>
          )}
          {/* === TOPBAR === */}
          <div style={styles.topbar}>
            <div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#fff",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Dashboard
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  marginTop: 4,
                }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
            <div style={styles.filterRow}>
              {["week", "month", "year"].map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilter(f)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 500,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background:
                      filter === f
                        ? "linear-gradient(135deg,var(--accent),var(--accent-3))"
                        : "transparent",
                    color: filter === f ? "#03170c" : "rgba(255,255,255,0.5)",
                    boxShadow:
                      filter === f
                        ? "0 8px 18px rgba(var(--accent-3-rgb),0.2)"
                        : "none",
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* === BENTO GRID === */}
          <div style={styles.bento} className="dash-bento">
            {/* === STAT CARDS === */}
            <StatCard
              label="Total Workouts"
              value={stats.workouts}
              sub="sessions tracked"
              icon="activity"
              gradient="linear-gradient(135deg,var(--accent),var(--accent-3))"
              accentBg="rgba(var(--accent-rgb),0.18)"
              delay={50}
            />

            <StatCard
              label="Calories Burned"
              value={stats.calories}
              sub="kcal this period"
              icon="flame"
              gradient="linear-gradient(135deg,var(--accent-2),#7dfcff)"
              accentBg="rgba(var(--accent-2-rgb),0.18)"
              delay={100}
            />

            <div style={{ ...styles.glass, animationDelay: "150ms" }}>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background:
                    "linear-gradient(90deg,transparent,rgba(var(--accent-2-rgb),0.35),transparent)",
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
                  background: "rgba(51,246,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="clock" size={17} color="var(--accent-2)" />
              </div>
              <div style={styles.cardLabel}>Active Time</div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                  background:
                    "linear-gradient(135deg,var(--accent-2),var(--accent))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {fmtDuration(stats.duration)}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                  marginTop: 6,
                }}
              >
                total duration
              </div>
            </div>

            {/* === CALORIES LINE CHART === */}
            <div
              style={{
                ...styles.glass,
                gridColumn: "span 2",
                animationDelay: "200ms",
              }}
              className="dash-span2"
            >
              <SectionHeader
                title="Calories over time"
                meta={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11,
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 2,
                        background: "var(--accent-2)",
                        borderRadius: 1,
                      }}
                    />
                    kcal / session
                  </div>
                }
              />
              <CaloriesChart data={filtered} />
            </div>

            {/* === GOAL RING === */}
            <div
              style={{
                ...styles.glass,
                animationDelay: "250ms",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <SectionHeader title="Weekly goal" />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <GoalRing totalCal={stats.calories} />
              </div>
            </div>

            {/* === EXERCISE BARS === */}
            <div
              style={{
                ...styles.glass,
                gridColumn: "span 2",
                animationDelay: "300ms",
              }}
              className="dash-span2"
            >
              <SectionHeader title="Exercise breakdown" />
              <ExerciseBars data={filtered} />
            </div>

            {/* === DONUT === */}
            <div style={{ ...styles.glass, animationDelay: "350ms" }}>
              <SectionHeader title="Split" />
              <DonutChart data={filtered} />
            </div>

            {/* === HEATMAP === */}
            <div
              style={{
                ...styles.glass,
                gridColumn: "span 3",
                animationDelay: "400ms",
              }}
              className="dash-span3"
            >
              <SectionHeader
                title="Activity heatmap — last 10 weeks"
                meta={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 10,
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    <span>Low</span>
                    {[
                      "rgba(255,255,255,0.05)",
                      "#0c3c3a",
                      "var(--accent-3)",
                      "var(--accent-2)",
                      "var(--accent)",
                    ].map((c, i) => (
                      <div
                        key={i}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          background: c,
                        }}
                      />
                    ))}
                    <span>High</span>
                  </div>
                }
              />
              <Heatmap allData={allData} />
            </div>

            {/* === SESSIONS FEED === */}
            <div
              style={{
                ...styles.glass,
                gridColumn: "span 3",
                animationDelay: "450ms",
              }}
              className="dash-span3"
            >
              <SectionHeader
                title="Recent sessions"
                meta={
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--accent-2)",
                      cursor: "pointer",
                      opacity: 0.8,
                    }}
                  >
                    see all
                  </div>
                }
              />
              <SessionsFeed data={filtered} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
