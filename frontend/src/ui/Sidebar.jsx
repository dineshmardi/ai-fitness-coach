import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Sidebar({
  isMobile = false,
  isOpen = false,
  onToggle,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const displayName = user?.name || user?.email || "Guest";
  const statusLabel = isAuthenticated ? "Signed in" : "Guest";
  const statusPillLabel = isAuthenticated ? "Active" : "Offline";

  const navItems = [
    {
      section: "Workout",
      items: [
        { label: "Home", path: "/", icon: "home" },
        { label: "Workout Builder", path: "/workout/builder", icon: "bolt" },
        { label: "Manual Workout", path: "/workout/manual", icon: "play" },
      ],
    },
    {
      section: "Insights",
      items: [{ label: "Dashboard", path: "/dashboard", icon: "chart" }],
    },
    {
      section: "Settings",
      items: [
        { label: "Profile", path: "/profile", icon: "user" },
        { label: "Preferences", path: "/", icon: "gear" },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNav = (path) => {
    navigate(path);
    if (isMobile && onToggle) onToggle();
  };

  const sidebarStyles = {
    position: "fixed",
    left: 0,
    top: 60,
    width: "210px",
    height: "calc(100vh - 60px)",
    backgroundColor: "rgba(8, 12, 14, 0.95)",
    borderRight: "1px solid rgba(157, 255, 87, 0.1)",
    display: isOpen ? "flex" : "none",
    flexDirection: "column",
    zIndex: 999,
    overflowY: "hidden",
    transition: "all 200ms ease",
  };

  const brandStyles = {
    padding: "20px 16px 14px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  };

  const brandNameStyles = {
    fontFamily: "Teko, sans-serif",
    fontSize: "20px",
    fontWeight: 700,
    color: "var(--accent)",
    letterSpacing: "0.6px",
  };

  const brandSubStyles = {
    fontSize: "10px",
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: "rgba(255, 255, 255, 0.45)",
  };

  const brandBadgeStyles = {
    alignSelf: "flex-start",
    padding: "3px 8px",
    fontSize: "10px",
    fontWeight: 600,
    borderRadius: 999,
    background: "rgba(var(--accent-2-rgb), 0.12)",
    border: "1px solid rgba(var(--accent-2-rgb), 0.35)",
    color: "var(--accent-2)",
  };

  const navStyles = {
    flex: 1,
    padding: "12px 0",
  };

  const sectionLabelStyles = {
    fontSize: "10px",
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: "rgba(255, 255, 255, 0.35)",
    padding: "10px 16px 6px",
  };

  const itemStyles = (active) => ({
    padding: "10px 12px",
    margin: "4px 8px",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: active ? 600 : 500,
    color: active ? "var(--accent)" : "rgba(255, 255, 255, 0.6)",
    background: active
      ? "linear-gradient(90deg, rgba(157, 255, 87, 0.14), rgba(157, 255, 87, 0.02))"
      : "transparent",
    borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
    boxShadow: active ? "0 6px 16px rgba(157, 255, 87, 0.15)" : "none",
    transition: "all 200ms ease",
    userSelect: "none",
    fontFamily: "Manrope, sans-serif",
    display: "flex",
    alignItems: "center",
    gap: 10,
  });

  const iconStyles = (active) => ({
    width: 18,
    height: 18,
    color: active ? "var(--accent)" : "rgba(255, 255, 255, 0.45)",
    flexShrink: 0,
  });

  const quickActionStyles = {
    margin: "14px 12px 8px",
    padding: "10px 12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid rgba(var(--accent-rgb), 0.4)",
    background:
      "linear-gradient(135deg, rgba(157, 255, 87, 0.18), rgba(34, 255, 181, 0.08))",
    color: "var(--accent)",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  };

  const profileStyles = {
    padding: "16px",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "12px",
  };

  const statusPillStyles = {
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: "10px",
    color: "rgba(255,255,255,0.85)",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
  };

  const iconMap = {
    user: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M20 21c0-4-3.6-6-8-6s-8 2-8 6" />
        <circle cx="12" cy="8" r="4" />
      </svg>
    ),
    home: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M3 10.5L12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
    ),
    chart: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 20V6" />
        <path d="M10 20V10" />
        <path d="M16 20V4" />
        <path d="M22 20H2" />
      </svg>
    ),
    bolt: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
      </svg>
    ),
    play: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5l11 7-11 7V5z" />
      </svg>
    ),
    gear: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
        <path d="M3 12h2M19 12h2M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" />
      </svg>
    ),
  };

  return (
    <div style={sidebarStyles}>
      {/* Brand */}
      <div style={brandStyles}>
        <div style={brandNameStyles}>PulseForge</div>
        <div style={brandSubStyles}>Athletic AI Lab</div>
        <div style={brandBadgeStyles}>BETA BUILD</div>
      </div>

      <button
        type="button"
        style={quickActionStyles}
        onClick={() => handleNav("/workout/manual")}
      >
        Start Workout
      </button>

      {/* Nav Items */}
      <nav style={navStyles} role="navigation" aria-label="Main">
        {navItems.map((section) => (
          <div key={section.section}>
            <div style={sectionLabelStyles}>{section.section}</div>
            {section.items.map((item) => {
              const active = isActive(item.path);
              return (
                <div
                  key={item.path}
                  style={itemStyles(active)}
                  onClick={() => handleNav(item.path)}
                  aria-current={active ? "page" : undefined}
                >
                  <span style={iconStyles(active)}>{iconMap[item.icon]}</span>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div style={profileStyles}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: user?.avatarUrl
              ? `url(${user.avatarUrl}) center/cover`
              : "linear-gradient(135deg, var(--accent), var(--accent-2))",
          }}
        />
        <div>
          <div style={{ color: "rgba(255, 255, 255, 0.9)", fontWeight: 500 }}>
            {displayName}
          </div>
          <div style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "11px" }}>
            {statusLabel}
          </div>
        </div>
        <div style={statusPillStyles}>{statusPillLabel}</div>
      </div>
    </div>
  );
}
