import {
  FETCH_GUARANTOR_REQUESTS_SUCCESS,
  ACCEPT_GUARANTOR_REQUEST_SUCCESS,
  DECLINE_GUARANTOR_REQUEST_SUCCESS,
  FETCH_GUARANTOR_REQUESTS_REQUEST,
  FETCH_GUARANTOR_REQUESTS_FAILURE,
  ACCEPT_GUARANTOR_REQUEST_REQUEST,
  ACCEPT_GUARANTOR_REQUEST_FAILURE,
  DECLINE_GUARANTOR_REQUEST_REQUEST,
  DECLINE_GUARANTOR_REQUEST_FAILURE,
} from "./ActionType";

import { api } from "../../config/api";

export const getMyRequests = () => async (dispatch) => {
  dispatch({ type: FETCH_GUARANTOR_REQUESTS_REQUEST });
  try {
    const {data} = await api.get("/api/guarantor/myrequests");
    dispatch({ type: FETCH_GUARANTOR_REQUESTS_SUCCESS, payload: data });

  } catch (err) {
    dispatch({ type: FETCH_GUARANTOR_REQUESTS_FAILURE, payload: err.message });
  }
};
// ✅ Accept guarantor request
export const acceptGuarantorRequest = (loanId) => async (dispatch) => {
  dispatch({ type: ACCEPT_GUARANTOR_REQUEST_REQUEST });

  try {
    const { data } = await api.put(`/api/guarantor/accept?loanId=${loanId}`);
    dispatch({ type: ACCEPT_GUARANTOR_REQUEST_SUCCESS, payload: { loanId, status: "ACCEPTED", message: data } });
    // Optionally refetch
    dispatch(getMyRequests());
  } catch (error) {
    dispatch({
      type: ACCEPT_GUARANTOR_REQUEST_FAILURE,
      payload: error.response?.data || "Error accepting request",
    });
  }
};

// ✅ Decline guarantor request
export const declineGuarantorRequest = (loanId) => async (dispatch) => {
  dispatch({ type: DECLINE_GUARANTOR_REQUEST_REQUEST });

  try {
    const { data } = await api.put(`/api/guarantor/decline?loanId=${loanId}`);
    dispatch({ type: DECLINE_GUARANTOR_REQUEST_SUCCESS, payload: { loanId, status: "DECLINED", message: data } });
    // Optionally refetch
    dispatch(getMyRequests());
  } catch (error) {
    dispatch({
      type: DECLINE_GUARANTOR_REQUEST_FAILURE,
      payload: error.response?.data || "Error declining request",
    });
  }
};
