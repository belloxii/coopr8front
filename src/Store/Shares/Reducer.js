// Store/Shares/Reducer.js

import {
  ADD_SHARE_REQUEST,
  ADD_SHARE_SUCCESS,
  ADD_SHARE_FAILURE,
  WITHDRAW_SHARE_REQUEST,
  WITHDRAW_SHARE_SUCCESS,
  WITHDRAW_SHARE_FAILURE,
  MY_SHARES_REQUEST,
  MY_SHARES_SUCCESS,
  MY_SHARES_FAILURE,
  ALL_SHARES_REQUEST,
  ALL_SHARES_SUCCESS,
  ALL_SHARES_FAILURE,
  APPROVE_WITHDRAW_REQUEST,
  APPROVE_WITHDRAW_SUCCESS,
  APPROVE_WITHDRAW_FAILURE,
  DECLINE_WITHDRAW_REQUEST,
  DECLINE_WITHDRAW_SUCCESS,
  DECLINE_WITHDRAW_FAILURE
} from "./ActionType";

const initialState = {
  loading: false,
  error: null,
  myShares: [],
  userShares: [],
  allShares: [],
  successMessage: null,
};

export const sharesReducer = (state = initialState, action) => {
  switch (action.type) {
    // Add share
    case ADD_SHARE_REQUEST:
      return { ...state, loading: true, error: null };
    case ADD_SHARE_SUCCESS:
      return {
        ...state,
        loading: false,
        successMessage: "Share added successfully",
        myShares: [action.payload, ...state.myShares],
      };
    case ADD_SHARE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Withdraw share
    case WITHDRAW_SHARE_REQUEST:
      return { ...state, loading: true, error: null };
    case WITHDRAW_SHARE_SUCCESS:
      return {
        ...state,
        loading: false,
        successMessage: "Share withdrawn successfully",
        myShares: [action.payload, ...state.myShares],
      };
    case WITHDRAW_SHARE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // My shares
    case MY_SHARES_REQUEST:
      return { ...state, loading: true, error: null };
    case MY_SHARES_SUCCESS:
      return { ...state, loading: false, myShares: action.payload };
    case MY_SHARES_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // All shares
    case ALL_SHARES_REQUEST:
      return { ...state, loading: true, error: null };
    case ALL_SHARES_SUCCESS:
      return { ...state, loading: false, allShares: action.payload };
    case ALL_SHARES_FAILURE:
      return { ...state, loading: false, error: action.payload };


    case APPROVE_WITHDRAW_REQUEST:
    case DECLINE_WITHDRAW_REQUEST:
      return { ...state, loading: true, success: false, error: null };

    case APPROVE_WITHDRAW_SUCCESS:
    case DECLINE_WITHDRAW_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        updatedShare: action.payload
      };

    case APPROVE_WITHDRAW_FAILURE:
    case DECLINE_WITHDRAW_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload
      };

    default:
      return state;
  }
};
