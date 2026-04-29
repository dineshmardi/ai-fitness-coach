export function fmtDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function filterByPeriod(data, filter) {
  const now = new Date();
  return data.filter((w) => {
    const d = new Date(w.createdAt);
    if (filter === "week") return (now - d) / 864e5 < 7;
    if (filter === "month") {
      return now.getMonth() === d.getMonth() && now.getFullYear() === d.getFullYear();
    }
    return now.getFullYear() === d.getFullYear();
  });
}
