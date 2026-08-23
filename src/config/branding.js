/**
 * COOPR8 platform identity.
 *
 * COOPR8 is the product (owned and developed by Invo Technologies Limited). It is NOT
 * the name of any cooperative using the product -- a tenant's own name, logo and
 * colours come from its Organization record via `useOrganization`.
 *
 * Use these constants only on platform surfaces (pre-login pages, "Powered by"
 * attribution) and as the neutral fallback when no tenant is known.
 */
export const PLATFORM_NAME = "COOPR8";
export const PLATFORM_VENDOR = "Invo Technologies Limited";
export const PLATFORM_ATTRIBUTION = `Powered by ${PLATFORM_NAME}`;
export const PLATFORM_TAGLINE = "Cooperative society management, simplified.";

/** Shown where a tenant name is expected but none is available yet. Never a real society. */
export const NEUTRAL_ORGANIZATION_NAME = "Organization";

/**
 * COOPR8 platform support line, used only when the signed-in organization has published
 * no contact phone of its own. A cooperative's members should reach their cooperative.
 */
export const PLATFORM_SUPPORT_WHATSAPP = "2348101237991";
