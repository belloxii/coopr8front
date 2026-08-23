import { api } from "../../config/api";
import {
  FIND_USER_BY_ID_SUCCESS,
  FIND_USER_BY_ID_FAILURE,
  ACTIVATE_USER_SUCCESS,
  ACTIVATE_USER_FAILURE,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAILURE,
  GET_ALL_USERS_SUCCESS,
  GET_ALL_USERS_FAILURE,
  GET_USERID_LOANS_SUCCESS,
  GET_USERID_LOANS_FAILURE,
  GET_USERID_SAVINGS_SUCCESS,
  GET_USERID_SAVINGS_FAILURE,
  GET_USERID_REPAYS_SUCCESS,
  GET_USERID_REPAYS_FAILURE,
  ADD_MULTI_USERS_REQUEST,
  ADD_MULTI_USERS_SUCCESS,
  ADD_MULTI_USERS_FAILURE,

  LEDGER_BATCH_REQUEST,
  LEDGER_BATCH_SUCCESS,
  LEDGER_BATCH_FAILURE,
  MANUAL_SAVING_REQUEST,
  MANUAL_SAVING_SUCCESS,
  MANUAL_SAVING_FAILURE,
  MANUAL_REPAY_REQUEST,
  MANUAL_REPAY_SUCCESS,
  MANUAL_REPAY_FAILURE,

  USER_SHARES_FAILURE,
  USER_SHARES_REQUEST,
  USER_SHARES_SUCCESS

} from "./ActionType";
import {  } from "../Shares/ActionType";

export const findUserById = (userId) => async (dispatch) => {
  try {
    const { data } = await api.get(`/api/admin/user/id/${userId}`);
    dispatch({ type: FIND_USER_BY_ID_SUCCESS, payload: data });
  } catch (error) {
    console.error("Find user by ID error:", error);
    dispatch({ type: FIND_USER_BY_ID_FAILURE, payload: error.message });
  }
};

export const activateUser = (userId) => async (dispatch) => {
  try {
    const { data } = await api.put(`/api/admin/user/${userId}/activate`);
    dispatch({ type: ACTIVATE_USER_SUCCESS, payload: data });
  } catch (error) {
    console.error("Activate user error:", error);
    dispatch({ type: ACTIVATE_USER_FAILURE, payload: error.message });
  }
};

export const getAllUsers = () => async (dispatch) => {
  try {
    const { data } = await api.get(`/api/admin/users`);
    dispatch({ type: GET_ALL_USERS_SUCCESS, payload: data });
  } catch (error) {
    console.error("Get all users error:", error);
    dispatch({ type: GET_ALL_USERS_FAILURE, payload: error.message });
  }
};

/**
 * Edits another member's record, as an administrator.
 *
 * This is a different endpoint from the member's own `updateUser`, not a convenience wrapper.
 * `/api/user/update` only ever edits the caller's own record and refuses privileged fields;
 * `/api/admin/user/update` takes a `userId` and is the only route that may set `role`, `status`
 * or `paymentType`. Sending an admin edit to the self-service endpoint silently edited the
 * administrator's own profile instead, which is what this replaces.
 *
 * `userId` is required. The cooperative is never sent -- the backend takes it from the token, and
 * would ignore it here anyway.
 */
export const adminUpdateUser = (reqData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_USER_REQUEST });
    const { data } = await api.put(`/api/admin/user/update`, reqData);
    dispatch({ type: UPDATE_USER_SUCCESS, payload: data });
    return data;
  } catch (error) {
    console.error("Admin update user error:", error);
    dispatch({
      type: UPDATE_USER_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const findLoansByUserId = (userId) => async (dispatch) => {
  try {
    // Administrative, so it goes through /api/admin: that route scopes the query to the
    // administrator's own cooperative. The old /api/loan/user/{id} had no backend mapping at all.
    const { data } = await api.get(`/api/admin/loan/loansbyuserid/${userId}`);
    dispatch({ type: GET_USERID_LOANS_SUCCESS, payload: data });
  } catch (error) {
    console.error("Fetch loans error:", error);
    dispatch({ type: GET_USERID_LOANS_FAILURE, payload: error.message });
  }
};

// Savings
export const findSavingsByUserId = (userId) => async (dispatch) => {
  try {
    const { data } = await api.get(`/api/admin/savings/user/${userId}`);
    dispatch({ type: GET_USERID_SAVINGS_SUCCESS, payload: data });
  } catch (error) {
    console.error("Fetch savings error:", error);
    dispatch({ type: GET_USERID_SAVINGS_FAILURE, payload: error.message });
  }
};

// Repayments
export const findRepaysByUserId = (userId) => async (dispatch) => {
  try {
    const { data } = await api.get(`/api/admin/repays/user/${userId}`);
    dispatch({ type: GET_USERID_REPAYS_SUCCESS, payload: data });
  } catch (error) {
    console.error("Fetch repayments error: ", error);
    dispatch({ type: GET_USERID_REPAYS_FAILURE, payload: error.message });
  }
};

// Get shares for a specific user by ID
export const findSharesByUserId = (userId) => async (dispatch) => {
  try {
    dispatch({ type: USER_SHARES_REQUEST });
    // Was /api/shares/user/{id}, which any member could call for any id. That endpoint is gone;
    // the administrative equivalent checks both the role and the cooperative.
    const { data } = await api.get(`/api/admin/shares/user/${userId}`);
    dispatch({ type: USER_SHARES_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: USER_SHARES_FAILURE,
      payload: error?.response?.data?.message || "Failed to fetch user shares",
    });
  }
};

export const addMultiUsers = (users, config = {}) => async (dispatch) => {
  try {
    dispatch({ type: ADD_MULTI_USERS_REQUEST });
    const { data } = await api.post("/api/admin/users/multi", { rows: users }, config);
    dispatch({ type: ADD_MULTI_USERS_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({
      type: ADD_MULTI_USERS_FAILURE,
      payload: error.response?.data || error.message
    });
    throw error;
  }
};

// ===== LEDGER: ministry salary-deduction batch (PSN-matched) =====
export const ledgerBatchUpload = (rows, config = {}) => async (dispatch) => {
  try {
    dispatch({ type: LEDGER_BATCH_REQUEST });
    const { data } = await api.post("/api/admin/ledger/batch", { rows }, config);
    dispatch({ type: LEDGER_BATCH_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({
      type: LEDGER_BATCH_FAILURE,
      payload: error.response?.data || error.message
    });
    throw error;
  }
};

// ===== MANUAL: post a saving from a transfer receipt (self-pay member) =====
export const adminPostSaving = (payload) => async (dispatch) => {
  try {
    dispatch({ type: MANUAL_SAVING_REQUEST });
    const { data } = await api.post("/api/admin/savings/manual", payload);
    dispatch({ type: MANUAL_SAVING_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({
      type: MANUAL_SAVING_FAILURE,
      payload: error.response?.data || error.message
    });
    throw error;
  }
};

// ===== MANUAL: post a repayment from a transfer receipt (self-pay member) =====
export const adminPostRepay = (payload) => async (dispatch) => {
  try {
    dispatch({ type: MANUAL_REPAY_REQUEST });
    const { data } = await api.post("/api/admin/repays/manual", payload);
    dispatch({ type: MANUAL_REPAY_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({
      type: MANUAL_REPAY_FAILURE,
      payload: error.response?.data || error.message
    });
    throw error;
  }
};
