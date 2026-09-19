import { PLATFORM_SUPPORT_WHATSAPP } from "../../config/branding";

// TODO(phase3): point to /onboard
export const ONBOARD_HREF = `https://wa.me/${PLATFORM_SUPPORT_WHATSAPP}?text=${encodeURIComponent(
  "Hello Invo Technologies! I would like to request onboarding for our cooperative society onto COOPR8."
)}`;
