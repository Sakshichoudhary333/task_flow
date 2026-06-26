import { Navigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const location = useLocation();
  const { authLoading, isAuthenticated } = useAuth();

  if (authLoading) {
    return (
      <div style={{ minHeight:"100vh", display:"grid", placeItems:"center", background:"var(--bg)" }}>
        <motion.div className="flex flex-col items-center gap-4"
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background:"linear-gradient(135deg,#4F46E5,#7C3AED)", boxShadow:"0 8px 24px rgba(79,70,229,.4)" }}>
            <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            {[0,1,2].map(i => (
              <motion.div key={i}
                className="w-2 h-2 rounded-full"
                style={{ background:"var(--primary)" }}
                animate={{ y:[0,-8,0], opacity:[1,.4,1] }}
                transition={{ duration:.8, repeat:Infinity, delay: i * .18 }}
              />
            ))}
          </div>
          <p className="text-sm font-medium" style={{ color:"var(--muted)" }}>Loading TaskFlow…</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
