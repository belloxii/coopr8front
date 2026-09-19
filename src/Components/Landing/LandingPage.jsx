import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Search,
  Building,
  ShieldCheck,
  Sparkles,
  Coins,
  CreditCard,
  FileText,
  Store,
  Moon,
  Sun,
  Menu,
  X,
  Lock,
  PhoneCall,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "../../theme/ThemeContext";
import {
  PLATFORM_NAME,
  PLATFORM_VENDOR,
  PLATFORM_TAGLINE,
  PLATFORM_SUPPORT_WHATSAPP,
} from "../../config/branding";
import { API_BASE_URL } from "../../config/api";

const FALLBACK_PLANS = [
  {
    id: 1,
    code: "BASIC",
    name: "Basic Plan",
    description: "Core cooperative management for small to mid-sized societies.",
    pricePerYear: 120000.0,
    usersIncluded: 200,
    aiScanning: false,
    ecommerce: false,
    active: true,
  },
  {
    id: 2,
    code: "PRO",
    name: "Professional Plan",
    description: "Full cooperative automation with AI hardcopy form digitization.",
    pricePerYear: 240000.0,
    usersIncluded: 1000,
    aiScanning: true,
    ecommerce: false,
    active: true,
  },
  {
    id: 3,
    code: "ENTERPRISE",
    name: "Enterprise Plan",
    description: "Institutional scale with AI scanning, member store, and bespoke support.",
    pricePerYear: 450000.0,
    usersIncluded: 5000,
    aiScanning: true,
    ecommerce: true,
    active: true,
  },
];

const FAQS = [
  {
    question: "How does COOPR8 guarantee that our cooperative's data is isolated?",
    answer:
      "Every single cooperative on COOPR8 has a distinct tenant identity. Our backend enforces row-level data segregation at the database layer via automated Hibernate security filters and composite keys. No cooperative, admin, or member can ever read, modify, or leak another society's records.",
  },
  {
    question: "Can our members sign in to our own branded portal?",
    answer:
      "Yes. Every cooperative is assigned a dedicated URL slug (such as coopr8.com/o/citadel/login). When members visit your portal, they see your cooperative's name, logo, custom theme, and localized ledger prefix.",
  },
  {
    question: "How does the Gemini AI Hardcopy Form Scanner work?",
    answer:
      "Our AI scanner accepts photographs or scans of standard physical paper membership registration forms. Powered by Google Gemini multimodal OCR, it extracts fields (name, phone, next of kin, monthly thrift target) directly into digital inputs and crops the member's passport photo in under 5 seconds.",
  },
  {
    question: "Can we import existing member ledgers from Excel?",
    answer:
      "Absolutely. Admins can bulk-import member registries, historical savings records, share capital allocations, and active loans from Excel (.xlsx) templates in a single operation.",
  },
  {
    question: "What payment channels are supported for member savings and loans?",
    answer:
      "COOPR8 natively integrates with Paystack, allowing members to make real-time contributions, share acquisitions, and loan repayments via bank transfers, cards, and USSD with automatic verification and instant ledger posting.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { mode, toggle } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [slugSearch, setSlugSearch] = useState("");
  const [slugError, setSlugError] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Fetch active commercial plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const url = API_BASE_URL ? `${API_BASE_URL}/api/plans` : `/api/plans`;
        const res = await axios.get(url);
        if (Array.isArray(res.data) && res.data.length > 0) {
          setPlans(res.data);
        }
      } catch (err) {
        // Silently use FALLBACK_PLANS if API is unreachable
        console.warn("Could not fetch live plans, using default plans:", err.message);
      }
    };
    fetchPlans();
  }, []);

  const handleSlugSubmit = (e) => {
    e.preventDefault();
    const cleanSlug = slugSearch.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!cleanSlug) {
      setSlugError("Please enter a cooperative society code or slug.");
      return;
    }
    navigate(`/o/${cleanSlug}/login`);
  };

  const formatNaira = (amount) => {
    if (!amount || amount === 0) return "Custom Quote";
    return `₦${Number(amount).toLocaleString("en-NG")}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* -------------------------------------------------------------
          1. NAVIGATION BAR
      ------------------------------------------------------------- */}
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

            <button
              type="button"
              onClick={() => setContactModalOpen(true)}
              className="rounded-lg bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-semibold shadow-sm transition-all hover:shadow-md hover:shadow-green-600/20"
            >
              Get Started
            </button>
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
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setContactModalOpen(true);
                }}
                className="w-full text-center rounded-lg bg-green-600 text-white py-2 text-sm font-semibold hover:bg-green-700"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* -------------------------------------------------------------
          2. HERO SECTION
      ------------------------------------------------------------- */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle mesh background decoration */}
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

          {/* ---------------------------------------------------------
              INTERACTIVE COOPERATIVE PORTAL FINDER
          --------------------------------------------------------- */}
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
                    placeholder="citadel"
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
                  onClick={() => setSlugSearch("citadel")}
                  className="text-green-600 dark:text-green-400 font-mono hover:underline font-semibold"
                >
                  citadel
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
                AI Form Scanning
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

      {/* -------------------------------------------------------------
          3. CORE CAPABILITIES (FEATURES)
      ------------------------------------------------------------- */}
      <section id="features" className="py-20 bg-muted/40 border-y border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400 mb-2">
              Comprehensive Platform
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Everything Your Cooperative Needs in One Place
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Designed from the ground up to replace error-prone spreadsheets and manual ledgers with
              real-time institutional accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 mb-5">
                <Coins className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Thrift Savings & Dividend Shares
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Automated monthly savings deductions, real-time balance inquiries, share allocations,
                and dividend calculation without manual recalculation errors.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-5">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Flexible Loans & Guarantors
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Member loan applications, multi-guarantor digital approvals, automated repayment
                amortization, and direct Paystack settlements.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-5">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Gemini AI Form Digitization
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Snap photos of paper registration forms. Our Gemini multimodal AI extracts member
                details and auto-crops passport photos directly into the system.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-5">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Cooperative Commodity Store
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Distribute food items, appliances, or cooperative merchandise. Manage stock levels,
                member installment purchases, and sales ledger receipts.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-5">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Institutional Reports & Exports
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Export full society statements, member passbooks, and monthly deductions to
                branded PDF and Excel files in a single click.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Multi-Tenant White-Labeling
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Customize your society's portal with your official logo, localized ledger prefixes
                (e.g., CBMC001), and independent access controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. AI SCANNING SPOTLIGHT
      ------------------------------------------------------------- */}
      <section id="ai-scanner" className="py-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-700 dark:text-green-300 mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Next-Gen OCR Innovation</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                Eliminate Manual Data Entry with Gemini AI Scanning
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                Collecting physical paper membership forms during cooperative registration drives
                used to mean days of tedious typing. With COOPR8's AI form scanner:
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Camera or File Upload:</strong> Take a photo
                    with a smartphone or upload a flatbed scan of any registration sheet.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Automatic Passport Photo Cropping:</strong>{" "}
                    The facial recognition engine detects the attached passport photo and crops it
                    cleanly to the member profile.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Bulk Batch Mode:</strong> Convert a stack of
                    physical forms into a structured Excel spreadsheet in minutes.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  className="rounded-xl bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-sm font-semibold shadow-md transition-colors"
                >
                  See AI Scanning in Action
                </button>
              </div>
            </div>

            {/* Visual Demo Card */}
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xl relative z-10">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                    <span className="text-xs font-mono text-muted-foreground ml-2">
                      Gemini Multimodal OCR
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-500/10 text-green-600">
                    Confidence: 99.4%
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg bg-muted/60 p-3 flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Full Name</span>
                    <span className="font-semibold text-foreground">Bello Ridwan Ayomide</span>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-3 flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Phone Number</span>
                    <span className="font-semibold text-foreground">+234 810 123 7991</span>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-3 flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Monthly Thrift Target</span>
                    <span className="font-semibold text-green-600 dark:text-green-400 font-mono">
                      ₦25,000.00
                    </span>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-3 flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Passport Photo Detection</span>
                    <span className="font-semibold text-foreground">Auto-Cropped (200x200)</span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-xs text-green-700 dark:text-green-300 text-center font-medium">
                  Form parsed in 2.4 seconds with zero manual typing required.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          5. SUBSCRIPTION PRICING SECTION
      ------------------------------------------------------------- */}
      <section id="pricing" className="py-20 bg-muted/30 border-y border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400 mb-2">
              Transparent SaaS Plans
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Predictable Annual Subscriptions for Every Society
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Choose the tier that matches your cooperative's current scale. Upgrade or add member
              capacity as your society expands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => {
              const isPro = plan.code === "PRO";
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-2xl border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-lg ${
                    isPro
                      ? "border-green-500 ring-2 ring-green-500/20 md:-translate-y-2"
                      : "border-border"
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-green-600 to-emerald-500 px-3 py-0.5 text-xs font-bold text-white shadow-md">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground min-h-[40px]">
                      {plan.description}
                    </p>

                    <div className="mt-6 border-b border-border pb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-extrabold text-foreground">
                          {formatNaira(plan.pricePerYear)}
                        </span>
                        {plan.pricePerYear > 0 && (
                          <span className="text-xs text-muted-foreground font-semibold">
                            / year
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Includes up to{" "}
                        <strong className="text-foreground font-semibold">
                          {plan.usersIncluded?.toLocaleString()} members
                        </strong>
                      </p>
                    </div>

                    <ul className="mt-6 space-y-3.5 text-sm">
                      <li className="flex items-center gap-3 text-foreground">
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                        <span>Core Savings & Loan Ledgers</span>
                      </li>
                      <li className="flex items-center gap-3 text-foreground">
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                        <span>Member Self-Service Dashboard</span>
                      </li>
                      <li className="flex items-center gap-3 text-foreground">
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                        <span>Instant Paystack Online Repayments</span>
                      </li>
                      <li className="flex items-center gap-3 text-foreground">
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                        <span>PDF & Excel Statement Exports</span>
                      </li>

                      {/* AI Scanning Feature */}
                      <li
                        className={`flex items-center gap-3 ${
                          plan.aiScanning ? "text-foreground font-medium" : "text-muted-foreground/60"
                        }`}
                      >
                        {plan.aiScanning ? (
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                        )}
                        <span>Gemini AI Form OCR Scanner</span>
                      </li>

                      {/* eCommerce Feature */}
                      <li
                        className={`flex items-center gap-3 ${
                          plan.ecommerce ? "text-foreground font-medium" : "text-muted-foreground/60"
                        }`}
                      >
                        {plan.ecommerce ? (
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                        )}
                        <span>Cooperative Store & eCommerce</span>
                      </li>

                      <li className="flex items-center gap-3 text-foreground">
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                        <span>Dedicated Society Portal (`/o/:slug`)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-8 pt-4">
                    <button
                      type="button"
                      onClick={() => setContactModalOpen(true)}
                      className={`w-full rounded-xl py-3 text-sm font-semibold transition-all ${
                        isPro
                          ? "bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/20"
                          : "border border-border bg-card hover:bg-muted text-foreground"
                      }`}
                    >
                      {plan.code === "ENTERPRISE" ? "Contact Institutional Sales" : "Choose Plan"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center text-xs text-muted-foreground">
            All prices in Nigerian Naira (₦). Custom multi-branch setups or dedicated cloud hosting
            available upon request.
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          6. TRUST & SECURITY
      ------------------------------------------------------------- */}
      <section id="security" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-tr from-slate-900 via-gray-900 to-green-950 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
              <ShieldCheck className="h-96 w-96 text-green-400" />
            </div>

            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-green-300 mb-4 backdrop-blur-sm">
                <Lock className="h-3.5 w-3.5 text-green-400" />
                <span>Bank-Grade Institutional Security</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Built with Zero-Compromise Security Architecture
              </h2>
              <p className="mt-4 text-gray-300 text-base leading-relaxed">
                Cooperative funds demand rigorous accountability. COOPR8's architectural foundation
                ensures that member records are fully safeguarded:
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" /> Row-Level Tenant Isolation
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Automated Hibernate security filters guarantee queries never leak data across
                    societies.
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" /> Dual-Control Auth Separation
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Platform Super Admins are isolated from tenant admin scopes with distinct cryptographic keys.
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" /> Automated Price Auditing
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    All plan adjustments and subscription alterations are logged permanently with reasons.
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" /> Paystack Secured Tokens
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Member and cooperative transactions are cryptographically signed with zero raw card storage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          7. FREQUENTLY ASKED QUESTIONS (FAQ)
      ------------------------------------------------------------- */}
      <section id="faq" className="py-20 bg-muted/40 border-t border-border/60">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400 mb-2">
              Got Questions?
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-card overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-semibold text-foreground hover:bg-muted/50"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          8. CALL TO ACTION STRIP
      ------------------------------------------------------------- */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl sm:text-4xl font-black">
            Ready to Elevate Your Cooperative Society?
          </h2>
          <p className="mt-3 text-base text-green-100 max-w-xl mx-auto">
            Join forward-thinking societies on {PLATFORM_NAME}. Onboard your members, streamline
            thrifts, and automate document handling.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setContactModalOpen(true)}
              className="rounded-xl bg-white text-green-800 hover:bg-green-50 px-6 py-3 text-sm font-bold shadow-lg transition-all"
            >
              Get Started with COOPR8
            </button>
            <Link
              to="/login"
              className="rounded-xl border border-white/40 hover:bg-white/10 px-6 py-3 text-sm font-bold text-white transition-all"
            >
              Sign In to Your Society
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          9. FOOTER
      ------------------------------------------------------------- */}
      <footer className="border-t border-border bg-card py-12 text-sm text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white font-bold text-sm">
              C8
            </div>
            <div>
              <span className="font-bold text-foreground">{PLATFORM_NAME}</span>
              <span className="text-xs text-muted-foreground block">
                {PLATFORM_TAGLINE}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="hover:text-foreground">
              Pricing
            </a>
            <a href="#security" className="hover:text-foreground">
              Security
            </a>
            <Link to="/login" className="hover:text-foreground">
              Member Login
            </Link>
            <Link to="/platform/login" className="hover:text-foreground text-green-600 dark:text-green-400">
              Platform Admin
            </Link>
          </div>

          <div className="text-xs text-center md:text-right">
            <div>
              © {new Date().getFullYear()} {PLATFORM_VENDOR}. All rights reserved.
            </div>
            <div className="mt-1">
              Need assistance? WhatsApp:{" "}
              <a
                href={`https://wa.me/${PLATFORM_SUPPORT_WHATSAPP}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-green-600 dark:text-green-400 hover:underline"
              >
                +{PLATFORM_SUPPORT_WHATSAPP}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* -------------------------------------------------------------
          10. GET STARTED / CONTACT MODAL
      ------------------------------------------------------------- */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">Get Started with {PLATFORM_NAME}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  How would you like to proceed today?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setContactModalOpen(false);
                  navigate("/login");
                }}
                className="w-full rounded-xl border border-border bg-muted/40 hover:bg-muted p-4 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-sm text-foreground">Sign In to Existing Society</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    I am already a member or admin of a cooperative.
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <a
                href={`https://wa.me/${PLATFORM_SUPPORT_WHATSAPP}?text=${encodeURIComponent(
                  "Hello Invo Technologies! I would like to onboard our cooperative society onto COOPR8."
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-xl border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 p-4 text-left transition-colors flex items-center justify-between block"
              >
                <div>
                  <div className="font-semibold text-sm text-green-700 dark:text-green-300 flex items-center gap-1.5">
                    <PhoneCall className="h-4 w-4" />
                    <span>Onboard a New Cooperative</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Chat directly with our institutional onboarding team on WhatsApp.
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-green-600" />
              </a>
            </div>

            <div className="mt-6 pt-4 border-t border-border text-center">
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="text-xs text-muted-foreground hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
