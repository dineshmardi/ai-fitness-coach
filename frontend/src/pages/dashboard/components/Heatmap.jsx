export default function Heatmap({ allData }) {
  const getKey = (date) => {
    const d = new Date(date);
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  };

  const calMap = {};
  allData.forEach((w) => {
    const key = getKey(w.createdAt);
    calMap[key] = (calMap[key] || 0) + (w.totalCalories || 0);
  });

  if (!allData.length) {
    return (
      <div style={{ color: "rgba(255,255,255,0.35)" }}>No heatmap data</div>
    );
  }

  const dates = allData.map((w) => new Date(w.createdAt));
  const start = new Date(Math.min(...dates));
  const end = new Date();
  const days = Math.ceil((end - start) / 86400000);

  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const val = calMap[getKey(d)] || 0;

    return { date: d, val };
  });

  const maxCal = Math.max(...cells.map((c) => c.val), 1);
  const getColor = (val) => {
    const i = val / maxCal;
    if (i > 0.75) return "var(--accent)";
    if (i > 0.5) return "var(--accent-2)";
    if (i > 0.25) return "var(--accent-3)";
    if (i > 0) return "#0c3c3a";
    return "rgba(255,255,255,0.05)";
  };

  const weeks = [];
  let week = [];

  cells.forEach((c, i) => {
    const day = c.date.getDay();

    if (i === 0) {
      for (let j = 0; j < day; j++) week.push(null);
    }

    week.push(c);

    if (day === 6) {
      weeks.push(week);
      week = [];
    }
  });

  if (week.length) weeks.push(week);

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 6,
          overflowX: "auto",
        }}
      >
        {weeks.map((week, i) => {
          const first = week.find((d) => d);
          if (!first) return <div key={i} style={{ width: 14 }} />;

          const month = first.date.toLocaleString("default", {
            month: "short",
          });

          return (
            <div
              key={i}
              style={{
                width: 14,
                fontSize: 10,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {i === 0 ||
              month !==
                weeks[i - 1]
                  ?.find((d) => d)
                  ?.date.toLocaleString("default", { month: "short" })
                ? month
                : ""}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            marginRight: 6,
            fontSize: 9,
            color: "rgba(255,255,255,0.25)",
          }}
        >
          <span>Mon</span>
          <span></span>
          <span>Wed</span>
          <span></span>
          <span>Fri</span>
          <span></span>
          <span>Sun</span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 2,
          }}
        >
          {weeks.map((week, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateRows: "repeat(7, 12px)",
                gap: 2,
              }}
            >
              {week.map((c, j) => (
                <div
                  key={j}
                  title={
                    c ? `${c.date.toDateString()} — ${c.val || 0} kcal` : ""
                  }
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    background: c ? getColor(c.val) : "transparent",
                    transition: "all 0.15s",
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
