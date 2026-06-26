import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

const Icon = ({ d, size = 18 }) => (
  <svg
    style={{ width: size, height: size, flexShrink: 0 }}
    viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const GridIcon = () => <Icon d={["M3 3h7v7H3z", "M14 3h7v7h-7z", "M3 14h7v7H3z", "M14 14h7v7h-7z"]} />;
const ListIcon = () => <Icon d={["M8 6h13", "M8 12h13", "M8 18h13", "M3 6h.01", "M3 12h.01", "M3 18h.01"]} />;
const ChartIcon = () => <Icon d={["M18 20V10", "M12 20V4", "M6 20v-6"]} />;
const UsersIcon = () => <Icon d={["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", "M9 7a4 4 0 100-8 4 4 0 000 8z", "M23 21v-2a4 4 0 00-3-3.87", "M16 3.13a4 4 0 010 7.75"]} />;
const CalendarIcon = () => <Icon d={["M8 2v4", "M16 2v4", "M3 10h18", "M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"]} />;
const BookIcon = () => <Icon d={["M4 19.5A2.5 2.5 0 016.5 17H20", "M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"]} />;
const LogoutIcon = () => <Icon d={["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4", "M16 17l5-5-5-5", "M21 12H9"]} />;

const NAV = [
  { to: "/dashboard", label: "Dashboard", Icon: GridIcon },
  { label: "Projects", Icon: ListIcon, expandable: true },
  { to: "/analytics", label: "Analytics", Icon: ChartIcon },
  { to: "/teams", label: "Teams", Icon: UsersIcon },
  { to: "/calendar", label: "Calendar", Icon: CalendarIcon },
  { to: "/reports", label: "Reports", Icon: BookIcon },
];

function Logo({ collapsed }) {
  return (
    <div className="sidebar-logo">
      <div className="sidebar-logo-icon">
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M16 4C10 4 6 9 6 14c0 4 2 7 5 9-1-3 0-6 2-8 2 2 5 3 8 2-1 3-4 5-7 5 5 2 11-1 14-6 2-4 1-9-2-12-2-2-4-2-6-2z" fill="#4FD1C5"/>
          <path d="M20 8c2 1 3 3 3 5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </div>
      <AnimatePresence>
        {!collapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="sidebar-logo-text">TaskFlow</motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar({ collapsed, mobileOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [projectsOpen, setProjectsOpen] = useState(true);

  const { data: boards = [] } = useQuery({
    queryKey: ["boards"],
    queryFn: async () => (await api.get("/boards")).data,
    staleTime: 30_000,
  });

  const isBoardActive = id => location.pathname === `/boards/${id}`;
  const isProjectsSection = location.pathname.startsWith("/boards");

  const handleLogout = () => { logout(); navigate("/", { replace: true }); };

  return (
    <>
      <div className={`sidebar-overlay ${mobileOpen ? "visible" : ""}`} onClick={onClose} />

      <aside className={`sidebar sidebar-dark ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <Logo collapsed={collapsed} />

        <nav className="sidebar-nav">
          {NAV.map(item => {
            if (item.expandable) {
              return (
                <div key={item.label}>
                  <button
                    type="button"
                    className={`sidebar-link ${isProjectsSection ? "active" : ""}`}
                    onClick={() => !collapsed && setProjectsOpen(v => !v)}
                    data-tooltip={collapsed ? item.label : undefined}
                  >
                    <item.Icon />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <svg style={{ width: 14, height: 14, opacity: 0.6, transition: "transform .2s", transform: projectsOpen ? "rotate(180deg)" : "none" }}
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </>
                    )}
                  </button>

                  {!collapsed && projectsOpen && boards.length > 0 && (
                    <div className="sidebar-submenu">
                      {boards.map(b => (
                        <Link
                          key={b._id}
                          to={`/boards/${b._id}`}
                          className={`sidebar-sublink ${isBoardActive(b._id) ? "active" : ""}`}
                          onClick={onClose}
                        >
                          {b.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            const active = item.to && location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to || "/dashboard"}
                className={`sidebar-link ${active ? "active" : ""}`}
                onClick={onClose}
                data-tooltip={collapsed ? item.label : undefined}
              >
                <item.Icon />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            onClick={handleLogout}
            className="sidebar-link sidebar-logout"
            data-tooltip={collapsed ? "Logout" : undefined}
          >
            <LogoutIcon />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
