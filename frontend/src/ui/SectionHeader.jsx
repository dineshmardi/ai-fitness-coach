export default function SectionHeader({ title, meta, style }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: 14,
        ...style,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "rgba(255,255,255,0.86)",
          letterSpacing: "0.4px",
        }}
      >
        {title}
      </div>
      {meta ? meta : null}
    </div>
  );
}
