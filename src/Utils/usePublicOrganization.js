import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

/**
 * Fetches the public branding of one cooperative, by slug, for pages that render before login.
 *
 * A member arriving at `/o/lagos-staff-coop/login` needs to see whose login page they are on
 * before they have a token. `GET /api/organization/public/{slug}` is the only unauthenticated
 * organization endpoint and answers with name, logo and colours only -- no member counts, no
 * balances, no contact details, nothing administrative.
 *
 * Two deliberate choices:
 *
 * 1. Plain `axios`, not the shared `api` instance, and no Authorization header. This is a public
 *    read; it must behave identically for a signed-out visitor and for someone whose token has
 *    just been rejected.
 *
 * 2. The result is kept in component state and is NOT dispatched into the Redux `organization`
 *    slice. That slice holds the *authenticated* member's own cooperative, derived from their JWT.
 *    Writing this into it would let a signed-in member of one cooperative repaint their session
 *    with another cooperative's identity just by visiting its login URL.
 *
 * An unknown or suspended slug answers 404, which surfaces here as `notFound` -- the caller falls
 * back to neutral platform branding rather than guessing at a cooperative.
 */
export const usePublicOrganization = (slug) => {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setOrganization(null);
      setLoading(false);
      setNotFound(false);
      return;
    }

    let active = true;
    setLoading(true);
    setNotFound(false);

    axios
      .get(`${API_BASE_URL}/api/organization/public/${encodeURIComponent(slug)}`)
      .then(({ data }) => {
        if (active) {
          setOrganization(data);
          setLoading(false);
        }
      })
      .catch(() => {
        // Includes the 404 an unknown or suspended cooperative gets. Nothing is logged about
        // which slug failed: this is an unauthenticated endpoint and the console is not the
        // place to build a list of valid cooperative names.
        if (active) {
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
