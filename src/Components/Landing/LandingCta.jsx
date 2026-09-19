import React from "react";
import { Link } from "react-router-dom";
import { PLATFORM_NAME } from "../../config/branding";
import { ONBOARD_HREF } from "./constants";

const LandingCta = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-3xl sm:text-4xl font-black">
          Ready to Modernize Your Cooperative Society?
        </h2>
        <p className="mt-3 text-base text-green-100 max-w-xl mx-auto">
          Join forward-thinking societies on {PLATFORM_NAME}. Onboard your members, streamline
          thrifts, and automate document handling.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={ONBOARD_HREF}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-white text-green-800 hover:bg-green-50 px-6 py-3 text-sm font-bold shadow-lg transition-all"
          >
            Request onboarding
          </a>
          <Link
            to="/login"
            className="rounded-xl border border-white/40 hover:bg-white/10 px-6 py-3 text-sm font-bold text-white transition-all"
          >
            Sign In to Your Society
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LandingCta;
