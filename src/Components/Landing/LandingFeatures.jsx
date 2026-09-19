import React from "react";
import { Coins, CreditCard, Sparkles, Store, FileText, ShieldCheck } from "lucide-react";

const LandingFeatures = () => {
  return (
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
  );
};

export default LandingFeatures;
