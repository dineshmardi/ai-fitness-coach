const sizeStyles = {
  sm: { padding: "8px 12px", fontSize: "0.8rem" },
  md: { padding: "12px 20px", fontSize: "0.9rem" },
  lg: { padding: "14px 26px", fontSize: "0.95rem" },
};

const variantStyles = {
  primary: {
    background: "linear-gradient(135deg, var(--accent), var(--accent-3))",
    color: "#03170c",
    border: "none",
    boxShadow: "0 12px 30px rgba(var(--accent-3-rgb),0.2)",
  },
  surface: {
    background: "rgba(17,24,28,0.9)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  outline: {
    background: "transparent",
    border: "1px solid rgba(var(--accent-rgb),0.45)",
  },
};

export default function Button({
  children,
  variant = "surface",
  size = "md",
  style,
  type = "button",
  disabled = false,
  ...props
}) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition:
          "transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease",
        textTransform: "uppercase",
        letterSpacing: "0.6px",
        borderRadius: "12px",
        fontWeight: 700,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
