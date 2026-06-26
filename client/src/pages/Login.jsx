import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async p => (await api.post("/auth/login", p)).data,
    onSuccess: data => {
      login(data.token);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    },
    onError: err => setError(err.response?.data?.message || "Unable to sign in."),
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="auth-page">
      <motion.div
        className="auth-wrap"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M16 4C10 4 6 9 6 14c0 4 2 7 5 9-1-3 0-6 2-8 2 2 5 3 8 2-1 3-4 5-7 5 5 2 11-1 14-6 2-4 1-9-2-12-2-2-4-2-6-2z" fill="#fff"/>
            </svg>
          </div>
          <p className="auth-brand-name">TaskFlow</p>
          <p className="auth-brand-tagline">Project management, simplified</p>
        </div>

        <div className="auth-card-clean">
          <h1>Sign in</h1>
          <p className="auth-subtitle">Welcome back. Enter your details below.</p>

          <form
            className="auth-form"
            onSubmit={e => {
              e.preventDefault();
              setError("");
              mutation.mutate({ email: form.email.trim(), password: form.password });
            }}
          >
            <div className="field-group">
              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="field-input"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={set("email")}
                autoComplete="email"
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="field-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set("password")}
                autoComplete="current-password"
                required
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <span className="auth-spinner" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="auth-footer">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
