import React from "react";
import { Sparkles, Check } from "lucide-react";
import { ONBOARD_HREF } from "./constants";

const LandingAiSpotlight = () => {
  return (
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
              <a
                href={ONBOARD_HREF}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-xl bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-sm font-semibold shadow-md transition-colors"
              >
                Request onboarding
              </a>
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
                  Sample Result (illustrative)
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
                  <span className="text-muted-foreground">Monthly Thrift Target (illustrative)</span>
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
                Simulated extraction (illustrative): form parsed with zero manual typing required.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingAiSpotlight;
