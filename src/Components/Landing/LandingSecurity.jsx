import React from "react";
import { ShieldCheck, Lock, Check } from "lucide-react";

const LandingSecurity = () => {
  return (
    <section id="security" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-tr from-slate-900 via-gray-900 to-green-950 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
            <ShieldCheck className="h-96 w-96 text-green-400" />
          </div>

          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-green-300 mb-4 backdrop-blur-sm">
              <Lock className="h-3.5 w-3.5 text-green-400" />
              <span>Multi-Tenant Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Cooperative Security Architecture
            </h2>
            <p className="mt-4 text-gray-300 text-base leading-relaxed">
              Cooperative records demand rigorous accountability. COOPR8's architectural foundation
              ensures member data is completely segregated and safeguarded:
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" /> Row-Level Tenant Isolation
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Automated database security filters guarantee queries never leak data across societies.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" /> Dual-Control Auth Separation
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Platform administration is strictly separated from tenant admin scopes with distinct cryptographic keys.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" /> Price & Ledger Auditing
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Plan adjustments and financial ledger transactions are tracked with immutable audit histories.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" /> Paystack Secured Tokens
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Online transactions are verified through Paystack with zero raw card credentials stored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingSecurity;
