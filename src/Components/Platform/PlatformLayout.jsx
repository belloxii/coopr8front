import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PLATFORM_NAME } from "../../config/branding";
import BusinessIcon from "@mui/icons-material/Business";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import LogoutIcon from "@mui/icons-material/Logout";
import ShieldIcon from "@mui/icons-material/Shield";

export default function PlatformLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = sessionStorage.getItem("platform_jwt");
  const adminEmail = sessionStorage.getItem("platform_admin_email") || "Super Admin";

  useEffect(() => {
    if (!token) {
      navigate("/platform/login");
    }
  }, [token, navigate]);

  if (!token) {
    return null;
  }

  const handleLogout = () => {
    sessionStorage.removeItem("platform_jwt");
    sessionStorage.removeItem("platform_admin_email");
    navigate("/platform/login");
  };

  const navItems = [
    { label: "Organizations", path: "/platform/organizations", icon: <BusinessIcon fontSize="small" /> },
    { label: "Subscription Plans", path: "/platform/plans", icon: <SubscriptionsIcon fontSize="small" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-8">
          <Link to="/platform/organizations" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow">
              <ShieldIcon fontSize="small" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">{PLATFORM_NAME}</span>
              <span className="ml-1.5 text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                Platform
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-800 text-emerald-400 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs text-slate-400 font-medium">{adminEmail}</span>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Super Administrator</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-slate-800 hover:border-red-900 transition"
            title="Sign out of Platform"
          >
            <LogoutIcon fontSize="small" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
