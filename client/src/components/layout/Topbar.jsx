import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const drop = {
  hidden: { opacity: 0, y: 8, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, y: 8, scale: 0.95, transition: { duration: 0.1 } },
};

function useOutsideClick(ref, cb) {
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button type="button" onClick={() => setOpen(v => !v)} className="dash-topbar-user">
        <div className="dash-topbar-avatar">{initials}</div>
        <div style={{ textAlign: "left" }}>
          <p className="dash-topbar-name">{user?.name || "User"}</p>
          <p className="dash-topbar-plan">Pro Plan</p>
        </div>
        <svg style={{ width: 12, height: 12, color: "#A0AEC0" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div variants={drop} initial="hidden" animate="show" exit="exit"
            className="dropdown" style={{ position: "absolute", right: 0, marginTop: 8, width: 200, zIndex: 50 }}>
            <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #E8ECF1" }}>
              <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1A202C" }}>{user?.name}</p>
              <p style={{ fontSize: "0.75rem", color: "#718096", marginTop: 2 }}>{user?.email}</p>
            </div>
            <div style={{ padding: 6 }}>
              <button type="button" onClick={() => { setOpen(false); onLogout(); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 0.75rem", borderRadius: 8, border: "none", background: "transparent", color: "#E53E3E", fontSize: "0.8125rem", cursor: "pointer" }}>
                <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9"/>
                </svg>
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const handleLogout = () => { logout(); navigate("/", { replace: true }); };

  return (
    <header className="dash-topbar">
      <button type="button" onClick={onMenuClick} className="dash-topbar-btn" aria-label="Menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div className="dash-topbar-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input placeholder="Search tasks…" />
      </div>

      <div className="dash-topbar-spacer" />

      <button type="button" className="dash-topbar-btn" aria-label="Notifications">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
      </button>

      <UserMenu user={user} onLogout={handleLogout} />
    </header>
  );
}
