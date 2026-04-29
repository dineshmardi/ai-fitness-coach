export default function PageShell({
  children,
  maxWidth = "1200px",
  style,
  ...props
}) {
  return (
    <div
      {...props}
      style={{
        position: "relative",
        width: "100%",
        maxWidth,
        margin: "0 auto",
        padding: "20px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
