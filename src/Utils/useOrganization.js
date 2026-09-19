import { useEffect } from "react";
import { useSelector } from "react-redux";
import { NEUTRAL_ORGANIZATION_NAME, PLATFORM_NAME } from "../config/branding";

const ACTIVE_BRAND_KEY = "coopr8_cached_active_brand";

const getCachedActiveBrand = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_BRAND_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setCachedActiveBrand = (org) => {
  if (!org || typeof window === "undefined") return;
  try {
    const safe = {
      id: org.id,
      name: org.name,
      legalName: org.legalName,
      slug: org.slug,
      logoUrl: org.logoUrl,
      ledgerPrefix: org.ledgerPrefix,
      primaryColor: org.primaryColor,
      secondaryColor: org.secondaryColor,
      contactEmail: org.contactEmail,
      contactPhone: org.contactPhone,
      website: org.website,
      address: org.address,
      planCode: org.planCode,
      aiScanningEntitled: org.aiScanningEntitled,
      ecommerceEntitled: org.ecommerceEntitled,
    };
    window.localStorage.setItem(ACTIVE_BRAND_KEY, JSON.stringify(safe));
  } catch {
    // Ignore storage quota errors
  }
};

/**
 * The signed-in member's organization branding, with safe fallbacks and localStorage caching
 * to prevent branding flash on reload.
 */
export const useOrganization = () => {
  const { organization: organizationState } = useSelector((store) => store);
  const reduxOrg = organizationState?.organization || null;

  // When Redux loads the real organization, update the local cache
  useEffect(() => {
    if (reduxOrg) {
      setCachedActiveBrand(reduxOrg);
    }
  }, [reduxOrg]);

  // Fall back to cached brand until Redux organization loads
  const cachedBrand = getCachedActiveBrand();
  const organization = reduxOrg || cachedBrand || null;

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

    planCode: text(organization?.planCode) || null,
    aiScanningEntitled: Boolean(organization?.aiScanningEntitled),
    ecommerceEntitled: Boolean(organization?.ecommerceEntitled),

    isLoaded: Boolean(organization),
    loading: Boolean(organizationState?.loading),

    showPlatformLogoFallback: !logoUrl,
    platformName: PLATFORM_NAME,

    initials: name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((word) => word[0].toUpperCase())
      .join(""),
  };
};

export default useOrganization;
