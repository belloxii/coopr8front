import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const FRONT_END_URL = process.env.REACT_APP_FRONT_END_URL;

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

/**
 * Reads the token per request rather than once at module load.
 *
 * The previous version baked `localStorage.getItem("jwt")` into the default headers when this
 * module was first imported -- which is before anyone has logged in. Every request in that page
 * load then carried `Bearer null`, and the app only worked because a full page reload happened to
 * follow login. It also meant a token replaced in another tab, or dropped by the 401 handler
 * below, kept being sent until the next reload.
 *
 * A request that already sets its own Authorization header is left alone, so the
 * organization-branding fetch on the login page can deliberately send none.
 */
api.interceptors.request.use((config) => {
    const jwt = localStorage.getItem("jwt");
    if (jwt && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${jwt}`;
    }
    return config;
});

/**
 * Drops a token the backend has rejected.
 *
 * The Phase 2 security release rotates the JWT signing secret, so every token issued before it --
 * including the one sitting in this browser's localStorage right now -- is invalid. Without this,
 * a returning member is stuck: the app believes it is logged in because `jwt` is present, and every
 * request fails with a 401 that nothing clears.
 *
 * Deliberately narrow. Only 401 (the token is not acceptable) clears it. A 403 must not: that is a
 * member who is authenticated but reaching for an administrative route, and logging them out on
 * one wrong click would be its own bug. The rejected promise still reaches the caller, so existing
 * per-thunk error handling keeps working.
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem("jwt");
        }
        return Promise.reject(error);
    }
);
