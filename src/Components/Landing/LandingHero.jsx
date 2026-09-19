import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Search } from "lucide-react";

const LandingHero = () => {
  const navigate = useNavigate();
  const [slugSearch, setSlugSearch] = useState("");
  const [slugError, setSlugError] = useState("");

  const handleSlugSubmit = (e) => {
    e.preventDefault();
    const cleanSlug = slugSearch.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!cleanSlug) {
      setSlugError("Please enter a cooperative society code or slug.");
      return;
    }
    navigate(`/o/${cleanSlug}/login`);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[450px] w-[750px] rounded-full bg-gradient-to-tr from-green-500/15 to-emerald-400/10 blur-[100px] pointer-events-none" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Highlight Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-700 dark:text-green-300 backdrop-blur-sm mb-6 animate-pulse">
          <Sparkles className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          <span>Multi-Tenant Operating System for Cooperative Societies</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight sm:leading-none">
          The Smarter Way to Run Your{" "}
          <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Cooperative Society
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Empower members with automated thrift savings, flexible loans, dividend shares, and
          Gemini AI hardcopy form digitization — all inside your cooperative's own isolated,
          white-labeled portal.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 text-base font-semibold shadow-lg shadow-green-600/25 transition-all hover:scale-105"
          >
            <span>Explore Pricing Plans</span>
            <ArrowRight className="h-4 w-4" />
          </a>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground px-6 py-3.5 text-base font-semibold transition-all hover:border-foreground/20 shadow-sm"
          >
            <span>Member / Admin Login</span>
          </Link>
        </div>

        {/* Interactive Cooperative Portal Finder */}
        <div className="mt-14 max-w-xl mx-auto">
          <div className="rounded-2xl border border-border/80 bg-card/90 p-5 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mb-2">
              <Search className="h-3.5 w-3.5" />
              <span>Existing Member Portal Jump</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your society code to go directly to your cooperative's dedicated sign-in page:
            </p>

            <form onSubmit={handleSlugSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-muted-foreground font-mono">
                  coopr8.com/o/
                </div>
                <input
                  type="text"
                  value={slugSearch}
                  onChange={(e) => {
                    setSlugSearch(e.target.value);
                    setSlugError("");
                  }}
                  placeholder="your-coop"
                  className="w-full rounded-xl border border-border bg-background pl-28 pr-3 py-2.5 text-sm font-medium text-foreground focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
              >
                <span>Go to Society</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {slugError && <p className="mt-2 text-xs text-red-500">{slugError}</p>}

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>Example:</span>
              <button
                type="button"
                onClick={() => setSlugSearch("your-coop")}
                className="text-green-600 dark:text-green-400 font-mono hover:underline font-semibold"
              >
                your-coop
              </button>
            </div>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-border/60 pt-10 text-left sm:text-center">
          <div className="p-2">
            <div className="text-2xl sm:text-3xl font-black text-foreground">100%</div>
            <div className="text-xs text-muted-foreground uppercase font-semibold mt-1">
              Ledger Auditability
            </div>
          </div>
          <div className="p-2">
            <div className="text-2xl sm:text-3xl font-black text-foreground">&lt; 5s</div>
            <div className="text-xs text-muted-foreground uppercase font-semibold mt-1">
              AI Form OCR (illustrative)
            </div>
          </div>
          <div className="p-2">
            <div className="text-2xl sm:text-3xl font-black text-foreground">Multi-Tenant</div>
            <div className="text-xs text-muted-foreground uppercase font-semibold mt-1">
              Row-Level Isolation
            </div>
          </div>
          <div className="p-2">
            <div className="text-2xl sm:text-3xl font-black text-foreground">Instant</div>
            <div className="text-xs text-muted-foreground uppercase font-semibold mt-1">
              Paystack Payments
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
