import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  const location = useLocation();
  const isBoardPage = location.pathname.startsWith("/boards/");

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.add("board-theme");
  }, []);

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleMenuClick = () => {
    if (window.innerWidth < 1024) setMobileOpen(v => !v);
    else setCollapsed(v => !v);
  };

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="main-content">
        {!isBoardPage && <Topbar onMenuClick={handleMenuClick} />}

        <motion.main
          className={`flex-1 overflow-y-auto ${isBoardPage ? "board-main" : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {isBoardPage ? (
            <Outlet context={{ onMenuClick: handleMenuClick }} />
          ) : (
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.25rem 1.5rem 2rem" }}>
              <Outlet context={{ onMenuClick: handleMenuClick }} />
            </div>
          )}
        </motion.main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#fff",
            color: "#1A202C",
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,.12)",
            fontSize: "14px",
            fontWeight: 500,
          },
          success: { iconTheme: { primary: "#38B2AC", secondary: "#fff" } },
          error: { iconTheme: { primary: "#E53E3E", secondary: "#fff" } },
        }}
      />
    </div>
  );
}
