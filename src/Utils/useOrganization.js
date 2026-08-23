import { useSelector } from "react-redux";
import { NEUTRAL_ORGANIZATION_NAME, PLATFORM_NAME } from "../config/branding";

/**
 * The signed-in member's organization branding, with safe fallbacks.
 *
 * Read tenant identity through this hook instead of calling the organization API from
 * individual components: it keeps one source of truth (the Redux `organization` slice,
 * populated once from the authenticated endpoint) and guarantees the fallbacks are
 * applied consistently.
 *
 * Fallbacks never name a specific cooperative:
 *   - no name  -> the neutral "Organization"
 *   - no logo  -> `logoUrl` is null and `showPlatformLogoFallback` is true, so the
 *                 caller renders COOPR8 platform branding
 *   - no theme -> `primaryColor`/`secondaryColor` are null; keep the existing styling
 *
 * @returns {{
 *   organization: object|null,
 *   name: string,
 *   legalName: string,
 *   logoUrl: string|null,
 *   ledgerPrefix: string,
 *   primaryColor: string|null,
 *   secondaryColor: string|null,
 *   contactEmail: string,
 *   contactPhone: string,
 *   website: string,
 *   address: string,
 *   isLoaded: boolean,
 *   loading: boolean,
 *   showPlatformLogoFallback: boolean,
 *   initials: string,
 * }}
 */
export const useOrganization = () => {
  const { organization: organizationState } = useSelector((store) => store);
  const organization = organizationState?.organization || null;

  const text = (value) => (typeof value === "string" && value.trim() ? value.trim() : "");

  const name = text(organization?.name) || NEUTRAL_ORGANIZATION_NAME;
  const logoUrl = text(organization?.logoUrl) || null;

  return {
    organization,

    name,
    legalName: text(organization?.legalName) || name,
    logoUrl,
    ledgerPrefix: text(organization?.ledgerPrefix),

    primaryColor: text(organization?.primaryColor) || null,
    secondaryColor: text(organization?.secondaryColor) || null,

    contactEmail: text(organization?.contactEmail),
    contactPhone: text(organization?.contactPhone),
    website: text(organization?.website),
    address: text(organization?.address),

    isLoaded: Boolean(organization),
    loading: Boolean(organizationState?.loading),

    // True when there is no tenant logo to show: fall back to COOPR8, never to a
    // hardcoded cooperative mark.
    showPlatformLogoFallback: !logoUrl,
    platformName: PLATFORM_NAME,

    // Compact monogram for avatars/sidebars when there is no logo image.
    initials: name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((word) => word[0].toUpperCase())
      .join(""),
  };
};

export default useOrganization;
