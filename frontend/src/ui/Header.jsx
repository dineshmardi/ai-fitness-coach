export default function Header({
  onToggleSidebar,
  isMobileMenuOpen,
  isMobile = false,
}) {
  const hamburgerStyles = {
    display: "block",
    background: "none",
    border: "none",
    color: "var(--accent)",
    fontSize: "20px",
    cursor: "pointer",
    padding: "8px 12px",
    opacity: isMobile ? 1 : 0.75,
  };

  const headerStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "60px",
    backgroundColor: "rgba(8, 12, 14, 0.95)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(157, 255, 87, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: "16px",
    paddingRight: "16px",
    zIndex: 1000,
  };

  const leftSectionStyles = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
  };

  const logoStyles = {
    fontFamily: "Teko, sans-serif",
    fontSize: "16px",
    fontWeight: 600,
    color: "var(--accent)",
    letterSpacing: "0.5px",
    display: isMobile ? "block" : "none",
  };

  const centerSectionStyles = {
    flex: 1,
    textAlign: "center",
  };

  const titleStyles = {
    fontFamily: "Manrope, sans-serif",
    fontSize: "14px",
    fontWeight: 600,
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: "0.3px",
  };

  const rightSectionStyles = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
    justifyContent: "flex-end",
  };

  const notificationIconStyles = {
    width: "32px",
    height: "32px",
    borderRadius: "var(--radius-md)",
    backgroundColor: "rgba(157, 255, 87, 0.08)",
    border: "1px solid rgba(157, 255, 87, 0.2)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    color: "var(--accent)",
    transition: "all 200ms ease",
  };

  return (
    <div style={headerStyles}>
      {/* Left: Hamburger & Logo */}
      <div style={leftSectionStyles}>
        <button
          onClick={onToggleSidebar}
          style={hamburgerStyles}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
        <div style={logoStyles}>PulseForge</div>
      </div>

      {/* Center: Title */}
      <div style={centerSectionStyles}>
        <div style={titleStyles}>Fitness Coach</div>
      </div>

      {/* Right: Icons */}
      <div style={rightSectionStyles}>
        <div style={notificationIconStyles} title="Notifications">
          🔔
        </div>
      </div>
    </div>
  );
}
