import { useMemo, useState } from "react";
import Pagination from "../../../ui/Pagination";
import styles from "../styles";
import { fmtDuration } from "../utils";
import { exerciseConfig } from "../../../exercises/exerciseConfig";

export default function SessionsFeed({ data }) {
  const pageSize = 6;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const recent = useMemo(
    () => data.slice((safePage - 1) * pageSize, safePage * pageSize),
    [data, safePage],
  );

  if (!data.length)
    return <div style={styles.empty}>No sessions in this period</div>;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        {recent.map((w, idx) => (
          <div
            key={w._id}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: "12px 14px",
              animation: "fadeUp 0.4s ease both",
              animationDelay: `${idx * 50}ms`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 7,
              }}
            >
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                {new Date(w.createdAt).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--accent)",
                }}
              >
                {w.totalCalories} kcal
              </div>
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.28)",
                marginBottom: 8,
              }}
            >
              {fmtDuration(w.totalDuration)} active
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {(w.exercises || []).map((ex, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 20,
                    fontWeight: 500,
                    background:
                      idx % 2 === 0
                        ? "rgba(var(--accent-rgb),0.14)"
                        : "rgba(var(--accent-2-rgb),0.14)",
                    color: idx % 2 === 0 ? "var(--accent)" : "var(--accent-2)",
                    border: `1px solid ${idx % 2 === 0 ? "rgba(var(--accent-rgb),0.3)" : "rgba(var(--accent-2-rgb),0.3)"}`,
                  }}
                >
                  {exerciseConfig.find((e) => e.name === ex.type)?.label ||
                    ex.type}
                  {ex.reps ? ` · ${ex.reps}r` : ""}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Pagination
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </>
  );
}
