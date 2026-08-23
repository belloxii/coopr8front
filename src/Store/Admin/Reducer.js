import {
  // Admin User Actions
  FIND_USER_BY_ID_REQUEST,
  FIND_USER_BY_ID_SUCCESS,
  FIND_USER_BY_ID_FAILURE,
  ACTIVATE_USER_REQUEST,
  ACTIVATE_USER_SUCCESS,
  ACTIVATE_USER_FAILURE,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAILURE,
  GET_ALL_USERS_REQUEST,
  GET_ALL_USERS_SUCCESS,
  GET_ALL_USERS_FAILURE,

  // User-specific Data
  GET_USERID_SAVINGS_REQUEST,
  GET_USERID_SAVINGS_SUCCESS,
  GET_USERID_SAVINGS_FAILURE,
  GET_USERID_LOANS_REQUEST,
  GET_USERID_LOANS_SUCCESS,
  GET_USERID_LOANS_FAILURE,
  GET_USERID_REPAYS_REQUEST,
  GET_USERID_REPAYS_SUCCESS,
  GET_USERID_REPAYS_FAILURE,

  USER_SHARES_FAILURE,
  USER_SHARES_REQUEST,
  USER_SHARES_SUCCESS,
  ADD_MULTI_USERS_REQUEST,
  ADD_MULTI_USERS_SUCCESS,
  ADD_MULTI_USERS_FAILURE

} from "./ActionType";

// ---------- INITIAL STATE ----------
const initialState = {
  jwt: null,
  profile: null,      // Logged-in user profile
  findUser: null,     // User fetched by admin
  users: [],          // All users (admin)
  savings: [],
  loans: [],
  repays: [],
  batchUploadResult: null,

  loading: {
    auth: false,
    profile: false,
    findUser: false,
    users: false,
    savings: false,
    loans: false,
    repays: false,
  },

  error: {
    auth: null,
    profile: null,
    findUser: null,
    users: null,
    savings: null,
    loans: null,
    repays: null,
  },
};

// ---------- REDUCER ---------- 
export const adminReducer = (state = initialState, action) => {
  switch (action.type) {

    // ===== ADMIN: FIND, ACTIVATE, UPDATE USER =====
    case FIND_USER_BY_ID_REQUEST:
    case ACTIVATE_USER_REQUEST:
    case UPDATE_USER_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, findUser: true }, // Ensure individual loading state
        error: { ...state.error, findUser: null },
      };
    case FIND_USER_BY_ID_SUCCESS:
    case ACTIVATE_USER_SUCCESS:
    case UPDATE_USER_SUCCESS:
      return {
        ...state,
        findUser: action.payload,
        loading: { ...state.loading, findUser: false },
      };
    case FIND_USER_BY_ID_FAILURE:
    case ACTIVATE_USER_FAILURE:
    case UPDATE_USER_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, findUser: false },
        error: { ...state.error, findUser: action.payload },
      };

    // ===== ADMIN: ALL USERS =====
    case GET_ALL_USERS_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, users: true }, // Ensure specific loading state
        error: { ...state.error, users: null },
      };
    case GET_ALL_USERS_SUCCESS:
      return {
        ...state,
        users: action.payload,
        loading: { ...state.loading, users: false },
      };
    case GET_ALL_USERS_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: action.payload },
      };

    // ===== USER SAVINGS =====
    case GET_USERID_SAVINGS_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, savings: true },
        error: { ...state.error, savings: null },
      };
    case GET_USERID_SAVINGS_SUCCESS:
      return {
        ...state,
        savings: action.payload,
        loading: { ...state.loading, savings: false },
      };
    case GET_USERID_SAVINGS_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, savings: false },
        error: { ...state.error, savings: action.payload },
      };

    // ===== USER LOANS =====
    case GET_USERID_LOANS_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, loans: true },
        error: { ...state.error, loans: null },
      };
    case GET_USERID_LOANS_SUCCESS:
      return {
        ...state,
        loans: action.payload,
        loading: { ...state.loading, loans: false },
      };
    case GET_USERID_LOANS_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, loans: false },
        error: { ...state.error, loans: action.payload },
      };

    // ===== USER REPAYS =====
    case GET_USERID_REPAYS_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, repays: true },
        error: { ...state.error, repays: null },
      };
    case GET_USERID_REPAYS_SUCCESS:
      return {
        ...state,
        repays: action.payload,
        loading: { ...state.loading, repays: false },
      };
    case GET_USERID_REPAYS_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, repays: false },
        error: { ...state.error, repays: action.payload },
      };

    // ===== USER SHARES =====
    case USER_SHARES_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, shares: true }, // Specify loading for shares
        error: { ...state.error, shares: null },
      };
    case USER_SHARES_SUCCESS:
      return {
        ...state,
        userShares: action.payload,
        loading: { ...state.loading, shares: false },
      };
    case USER_SHARES_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, shares: false },
        error: { ...state.error, shares: action.payload },
      };

    // ===== ADD MULTI USERS =====
    case ADD_MULTI_USERS_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, users: true },
        error: { ...state.error, users: null },
      };
    case ADD_MULTI_USERS_SUCCESS:
      return {
        ...state,
        batchUploadResult: action.payload,
        loading: { ...state.loading, users: false },
      };
    case ADD_MULTI_USERS_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: action.payload },
      };

    // ===== DEFAULT =====
    default:
      return state;
  }
};
