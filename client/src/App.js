import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Dashboard      from "./pages/Dashboard";
import BoardPage      from "./pages/BoardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute    from "./components/PublicRoute";
import AppLayout      from "./components/layout/AppLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<PublicRoute />}>
          <Route path="/"         element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected — shared AppLayout (sidebar + topbar) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/boards/:id" element={<BoardPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
