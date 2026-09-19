import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQS = [
  {
    question: "How does COOPR8 guarantee that our cooperative's data is isolated?",
    answer:
      "Every single cooperative on COOPR8 has a distinct tenant identity. Our backend enforces row-level data segregation at the database layer via automated Hibernate security filters and composite keys. No cooperative, admin, or member can ever read, modify, or leak another society's records.",
  },
  {
    question: "Can our members sign in to our own branded portal?",
    answer:
      "Yes. Every cooperative is assigned a dedicated URL slug (such as coopr8.com/o/your-coop/login). When members visit your portal, they see your cooperative's name, logo, custom theme, and localized ledger prefix.",
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

const LandingFaq = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
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
  );
};

export default LandingFaq;
