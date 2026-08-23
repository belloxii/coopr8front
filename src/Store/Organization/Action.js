import { api } from "../../config/api";
import {
  GET_ORGANIZATION_REQUEST,
  GET_ORGANIZATION_SUCCESS,
  GET_ORGANIZATION_FAILURE,
  CLEAR_ORGANIZATION,
} from "./ActionType";

/**
 * Load the branding of the organization the signed-in member belongs to.
 *
 * The organization is never named by the client: the backend derives it from the
 * authenticated JWT. There is deliberately no `getOrganizationById` here.
 */
export const getCurrentOrganization = () => async (dispatch) => {
  dispatch({ type: GET_ORGANIZATION_REQUEST });
  try {
    const res = await api.get("/api/organization/current");
    dispatch({ type: GET_ORGANIZATION_SUCCESS, payload: res.data });
    return res.data;
  } catch (err) {
    // Branding is non-critical: the UI falls back to neutral COOPR8 platform
    // presentation rather than blocking the member out of the app.
    dispatch({ type: GET_ORGANIZATION_FAILURE, payload: err.message });
    return null;
  }
};

/** Drop the cached tenant branding, e.g. on logout. */
export const clearOrganization = () => (dispatch) => {
  dispatch({ type: CLEAR_ORGANIZATION });
};
