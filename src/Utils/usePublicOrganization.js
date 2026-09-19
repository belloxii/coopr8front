import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

const PUBLIC_BRAND_KEY = (slug) => `coopr8_public_brand_${slug}`;

const getCachedPublicBrand = (slug) => {
  if (!slug || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PUBLIC_BRAND_KEY(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      name: parsed.name || "",
      slug: parsed.slug || slug,
      logoUrl: parsed.logoUrl || null,
      primaryColor: parsed.primaryColor || null,
      secondaryColor: parsed.secondaryColor || null,
    };
  } catch {
    return null;
  }
};

const setCachedPublicBrand = (slug, data) => {
  if (!slug || !data || typeof window === "undefined") return;
  try {
    const safe = {
      name: data.name || "",
      slug: data.slug || slug,
      logoUrl: data.logoUrl || null,
      primaryColor: data.primaryColor || null,
      secondaryColor: data.secondaryColor || null,
    };
    window.localStorage.setItem(PUBLIC_BRAND_KEY(slug), JSON.stringify(safe));
  } catch {
    // Ignore quota errors
  }
};

const clearCachedPublicBrand = (slug) => {
  if (!slug || typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PUBLIC_BRAND_KEY(slug));
  } catch {
    // Ignore errors
  }
};

/**
 * Fetches the public branding of one cooperative, by slug, for pages that render before login.
 *
 * To avoid the neutral COOPR8 branding flash, this hook reads the last known public branding
 * from localStorage immediately, using only public fields, and refreshes in the background.
 */
export const usePublicOrganization = (slug) => {
  const cached = getCachedPublicBrand(slug);
  const [organization, setOrganization] = useState(cached);
  const [loading, setLoading] = useState(!cached && Boolean(slug));
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setOrganization(null);
      setLoading(false);
      setNotFound(false);
      return;
    }

    const currentCached = getCachedPublicBrand(slug);
    if (currentCached) {
      setOrganization(currentCached);
    }

    let active = true;
    if (!currentCached) {
      setLoading(true);
    }
    setNotFound(false);

    axios
      .get(`${API_BASE_URL}/api/organization/public/${encodeURIComponent(slug)}`)
      .then(({ data }) => {
        if (active) {
          setOrganization(data);
          setCachedPublicBrand(slug, data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          clearCachedPublicBrand(slug);
          setOrganization(null);
          setNotFound(true);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  return { organization, loading, notFound };
};

export default usePublicOrganization;
