import {
  GET_ORGANIZATION_REQUEST,
  GET_ORGANIZATION_SUCCESS,
  GET_ORGANIZATION_FAILURE,
  CLEAR_ORGANIZATION,
} from "./ActionType";
import { LOGOUT } from "../Auth/ActionType";

const initialState = {
  organization: null,
  loading: false,
  error: null,
};

export const organizationReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ORGANIZATION_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_ORGANIZATION_SUCCESS:
      return { ...state, organization: action.payload, loading: false, error: null };

    case GET_ORGANIZATION_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Signing out drops the tenant's branding, so the next member to sign in on this
    // browser never sees the previous cooperative's name or logo.
    case CLEAR_ORGANIZATION:
    case LOGOUT:
      return initialState;

    default:
      return state;
  }
};

export default organizationReducer;
