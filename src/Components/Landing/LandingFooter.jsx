import React from "react";
import { Link } from "react-router-dom";
import {
  PLATFORM_NAME,
  PLATFORM_TAGLINE,
  PLATFORM_VENDOR,
  PLATFORM_SUPPORT_WHATSAPP,
} from "../../config/branding";

const LandingFooter = () => {
  return (
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
          <a href="#ai-scanner" className="hover:text-foreground">
            AI Scanning
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
  );
};

export default LandingFooter;
