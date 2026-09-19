import React, { useState, useEffect } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import { ONBOARD_HREF } from "./constants";

const getPlanBlurb = (plan) => {
  if (plan.aiScanningEnabled && plan.ecommerceEnabled) {
    return "Full cooperative automation with AI form scanning and integrated member store.";
  }
  if (plan.aiScanningEnabled) {
    return "Core cooperative management with Gemini AI hardcopy form digitization.";
  }
  return "Core cooperative management: member registers, savings, loans, and shares.";
};

const LandingPricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const url = API_BASE_URL ? `${API_BASE_URL}/api/plans` : `/api/plans`;
        const res = await axios.get(url);
        if (Array.isArray(res.data) && res.data.length > 0) {
          setPlans(res.data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <section id="pricing" className="py-20 bg-muted/30 border-y border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400 mb-2">
            Transparent SaaS Plans
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Annual Subscriptions for Every Society
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Predictable plans designed to scale with your cooperative membership.
          </p>
        </div>

        {loading ? (
          /* Loading skeleton */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-8 animate-pulse space-y-4"
              >
                <div className="h-6 w-1/2 bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-10 w-2/3 bg-muted rounded mt-4" />
                <div className="space-y-2 pt-6">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-5/6 bg-muted rounded" />
                  <div className="h-4 w-4/6 bg-muted rounded" />
                </div>
                <div className="h-10 w-full bg-muted rounded pt-4" />
              </div>
            ))}
          </div>
        ) : error || plans.length === 0 ? (
          /* Error state when GET /api/plans fails */
          <div className="rounded-2xl border border-border bg-card p-8 text-center max-w-md mx-auto shadow-sm">
            <p className="text-base font-semibold text-foreground">
              Pricing is unavailable right now. Contact us.
            </p>
            <div className="mt-5">
              <a
                href={ONBOARD_HREF}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-xl bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors"
              >
                Request onboarding
              </a>
            </div>
          </div>
        ) : (
          /* Real plan data mapped from PlanResponse */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => {
              const billingPeriod = plan.billingPeriod ? plan.billingPeriod.toLowerCase() : "year";
              const formattedPrice = `₦${Number(plan.price || 0).toLocaleString("en-NG")} / ${billingPeriod}`;

              return (
                <div
                  key={plan.id}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-lg"
                >
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground min-h-[40px]">
                      {getPlanBlurb(plan)}
                    </p>

                    <div className="mt-6 border-b border-border pb-6">
                      <div className="text-3xl sm:text-4xl font-extrabold text-foreground">
                        {formattedPrice}
                      </div>

                      {/* Show per-user text only when perUserPrice is non-null, and never show member limits otherwise */}
                      {plan.perUserPrice != null && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Includes up to{" "}
                          <strong className="text-foreground font-semibold">
                            {plan.includedUsers != null ? plan.includedUsers.toLocaleString() : "unlimited"} members
                          </strong>
                          {Number(plan.perUserPrice) > 0 && (
                            <span>
                              . Additional members: ₦{Number(plan.perUserPrice).toLocaleString("en-NG")}/user/yr.
                            </span>
                          )}
                        </p>
                      )}
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

                      {/* AI Scanning Flag */}
                      <li
                        className={`flex items-center gap-3 ${
                          plan.aiScanningEnabled ? "text-foreground font-medium" : "text-muted-foreground/60"
                        }`}
                      >
                        {plan.aiScanningEnabled ? (
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                        )}
                        <span>Gemini AI Form OCR Scanner</span>
                      </li>

                      {/* eCommerce Flag */}
                      <li
                        className={`flex items-center gap-3 ${
                          plan.ecommerceEnabled ? "text-foreground font-medium" : "text-muted-foreground/60"
                        }`}
                      >
                        {plan.ecommerceEnabled ? (
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
                    <a
                      href={ONBOARD_HREF}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full block text-center rounded-xl bg-green-600 hover:bg-green-700 text-white py-3 text-sm font-semibold shadow-sm transition-colors"
                    >
                      Request onboarding
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default LandingPricing;
