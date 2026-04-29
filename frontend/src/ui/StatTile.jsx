import Card from "./Card";

export default function StatTile({ label, value, color = "var(--accent)" }) {
  return (
    <Card variant="glass" padding="14px" style={{ borderRadius: "14px" }}>
      <div style={{ fontSize: "22px", fontWeight: 700, color }}>{value}</div>
      <div
        style={{
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "1px",
          color: "rgba(236,241,243,0.6)",
        }}
      >
        {label}
      </div>
    </Card>
  );
}
