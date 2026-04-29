const variantStyles = {
  glass: {
    background: "rgba(12,18,20,0.85)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  panel: {
    background: "rgba(10,16,19,0.9)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "var(--shadow)",
  },
  surface: {
    background: "rgba(17,24,28,0.8)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  outline: {
    background: "transparent",
    border: "1px dashed rgba(var(--accent-2-rgb),0.35)",
  },
};

export default function Card({
  children,
  variant = "glass",
  padding = "16px",
  style,
  ...props
}) {
  return (
    <div
      {...props}
      style={{
        borderRadius: "var(--radius-lg)",
        padding,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
