import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Building, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "../../theme/ThemeContext";
import { PLATFORM_NAME } from "../../config/branding";
import { ONBOARD_HREF } from "./constants";

const LandingNav = () => {
  const { mode, toggle } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-green-600 to-emerald-400 text-white shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-foreground">
                {PLATFORM_NAME}
              </span>
              <span className="hidden sm:inline-block ml-2 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600 dark:text-green-400 border border-green-500/20">
                SaaS OS
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#ai-scanner" className="hover:text-foreground transition-colors">
            AI Scanning
          </a>
          <a href="#pricing" className="hover:text-foreground transition-colors">
            Pricing
          </a>
          <a href="#security" className="hover:text-foreground transition-colors">
            Security
          </a>
          <a href="#faq" className="hover:text-foreground transition-colors">
            FAQ
          </a>
        </nav>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors"
          >
            {mode === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Sign In
          </Link>

          <a
            href={ONBOARD_HREF}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-semibold shadow-sm transition-all hover:shadow-md hover:shadow-green-600/20"
          >
            Request onboarding
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground"
          >
            {mode === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card px-4 py-4 space-y-3">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-foreground py-1"
          >
            Features
          </a>
          <a
            href="#ai-scanner"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-foreground py-1"
          >
            AI Scanning
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-foreground py-1"
          >
            Pricing
          </a>
          <a
            href="#security"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-foreground py-1"
          >
            Security
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-foreground py-1"
          >
            FAQ
          </a>
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center rounded-lg border border-border py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Sign In
            </Link>
            <a
              href={ONBOARD_HREF}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center rounded-lg bg-green-600 text-white py-2 text-sm font-semibold hover:bg-green-700"
            >
              Request onboarding
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNav;
