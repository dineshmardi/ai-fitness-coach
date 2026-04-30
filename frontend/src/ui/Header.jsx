import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Header({
  onToggleSidebar,
  isMobileMenuOpen,
  isMobile = false,
}) {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const displayName = user?.name || user?.email || "User";
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    function handleClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);
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

  const avatarButtonStyles = {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "1px solid rgba(157, 255, 87, 0.4)",
    background: user?.avatarUrl
      ? `url(${user.avatarUrl}) center/cover`
      : "linear-gradient(135deg, rgba(157, 255, 87, 0.2), rgba(51, 246, 255, 0.12))",
    color: "var(--accent)",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const menuStyles = {
    position: "absolute",
    top: "44px",
    right: 0,
    width: "200px",
    padding: "10px",
    borderRadius: "12px",
    background: "rgba(8, 12, 14, 0.95)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    zIndex: 1200,
  };

  const menuItemStyles = {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid transparent",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.85)",
    fontSize: "12px",
    cursor: "pointer",
    textAlign: "left",
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
        {isAuthenticated && (
          <div style={{ position: "relative" }} ref={menuRef}>
            <button
              type="button"
              style={avatarButtonStyles}
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Open user menu"
            >
              {!user?.avatarUrl && initial}
            </button>
            {menuOpen && (
              <div style={menuStyles} role="menu">
                <div
                  style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
                >
                  Signed in as
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>
                  {displayName}
                </div>
                <button
                  type="button"
                  style={menuItemStyles}
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                >
                  Profile
                </button>
                <button
                  type="button"
                  style={menuItemStyles}
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/dashboard");
                  }}
                >
                  Go to dashboard
                </button>
                <button
                  type="button"
                  style={menuItemStyles}
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                    navigate("/", { replace: true });
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
        <div style={notificationIconStyles} title="Notifications">
          🔔
        </div>
      </div>
    </div>
  );
}
