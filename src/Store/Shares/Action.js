// Store/Shares/Action.js

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
import { api } from "../../config/api";

// Add shares (credit)
export const addShare = (shareData) => async (dispatch) => {
  try {
    dispatch({ type: ADD_SHARE_REQUEST });
    const { data } = await api.post(`/api/shares/add`, shareData);
    dispatch({ type: ADD_SHARE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ADD_SHARE_FAILURE,
      payload: error?.response?.data?.message || "Add Share Failed",
    });
  }
};

// Withdraw shares (debit)
export const withdrawShare = (shareData) => async (dispatch) => {
  try {
    dispatch({ type: WITHDRAW_SHARE_REQUEST });
    const { data } = await api.post(`/api/shares/withdraw`, shareData);

    localStorage.setItem("resMsg", data.responseMessage);
    localStorage.setItem("resCode", data.responseCode);

    dispatch({ type: WITHDRAW_SHARE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: WITHDRAW_SHARE_FAILURE,
      payload: error?.response?.data?.message || "Withdraw Share Failed",
    });
  }
};

// Get logged-in user's shares
export const myShares = () => async (dispatch) => {
  try {
    dispatch({ type: MY_SHARES_REQUEST });
    const { data } = await api.get(`/api/shares/my`);
    dispatch({ type: MY_SHARES_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: MY_SHARES_FAILURE,
      payload: error?.response?.data?.message || "Failed to load your shares",
    });
  }
};

// Get all share records
export const getAllShares = () => async (dispatch) => {
  try {
    dispatch({ type: ALL_SHARES_REQUEST });
    const { data } = await api.get(`/api/admin/shares/all`);
    dispatch({ type: ALL_SHARES_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ALL_SHARES_FAILURE,
      payload: error?.response?.data?.message || "Failed to fetch all shares",
    });
  }
};

// Approve Withdrawal
export const approveWithdraw = (shareId) => async (dispatch) => {
  try {
    dispatch({ type: APPROVE_WITHDRAW_REQUEST });

    const res = await api.put(`/api/shares/${shareId}/approve`);
    dispatch({
      type: APPROVE_WITHDRAW_SUCCESS,
      payload: res.data
    });

  } catch (error) {
    dispatch({
      type: APPROVE_WITHDRAW_FAILURE,
      payload: error.response?.data?.message || error.message
    });
  }
};

// Decline Withdrawal
export const declineWithdraw = (shareId, remark) => async (dispatch) => {
  try {
    dispatch({ type: DECLINE_WITHDRAW_REQUEST });

    const res = await api.post(`/api/shares/${shareId}/decline`, { remark });

    dispatch({
      type: DECLINE_WITHDRAW_SUCCESS,
      payload: res.data
    });
  } catch (error) {
    dispatch({
      type: DECLINE_WITHDRAW_FAILURE,
      payload: error.response?.data?.message || error.message
    });
  }
};
