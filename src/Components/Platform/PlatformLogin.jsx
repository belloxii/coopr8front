import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import { PLATFORM_NAME } from "../../config/branding";
import ShieldCheckIcon from "@mui/icons-material/Shield";
import CircularProgress from "@mui/material/CircularProgress";

export default function PlatformLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/platform/auth/login`, {
        email: email.trim(),
        password,
      });

      if (response.data?.jwt) {
        sessionStorage.setItem("platform_jwt", response.data.jwt);
        sessionStorage.setItem("platform_admin_email", email.trim().toLowerCase());
        navigate("/platform/organizations");
      } else {
        setError("Invalid response received from authentication server.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Invalid credentials or unauthenticated account.";
      setError(typeof msg === "string" ? msg : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg mb-2">
            <ShieldCheckIcon sx={{ fontSize: 32 }} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {PLATFORM_NAME} Super Admin
          </h1>
          <p className="text-sm text-slate-400">
            Platform governance and cooperative subscription management
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Super Admin Email
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@coopr8.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-950/50 transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <CircularProgress size={18} color="inherit" />
                <span>Verifying credentials…</span>
              </>
            ) : (
              <span>Sign in to Platform</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            Unauthorized access is prohibited and strictly monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
