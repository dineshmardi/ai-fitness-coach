import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 980);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 980;
      setIsMobile(mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const containerStyles = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  };

  const mainContainerStyles = {
    display: "flex",
    flex: 1,
    marginTop: "60px",
  };

  const sidebarContainerStyles = {
    width: sidebarOpen ? 210 : 0,
    flexShrink: 0,
    transition: "width 200ms ease",
    overflow: "hidden",
  };

  const contentStyles = {
    flex: 1,
    minWidth: 0,
    overflowY: "auto",
    backgroundColor: "var(--bg-0)",
  };

  return (
    <div style={containerStyles}>
      <Header
        onToggleSidebar={toggleSidebar}
        isMobileMenuOpen={sidebarOpen}
        isMobile={isMobile}
      />

      <div style={mainContainerStyles}>
        <div style={sidebarContainerStyles}>
          <Sidebar
            isMobile={isMobile}
            isOpen={sidebarOpen}
            onToggle={toggleSidebar}
          />
        </div>

        <div style={contentStyles}>
          <Outlet />
        </div>

        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 500,
              marginTop: "60px",
            }}
            onClick={toggleSidebar}
          />
        )}
      </div>
    </div>
  );
}
