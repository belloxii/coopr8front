import axios from "axios";
import { api, API_BASE_URL } from "../../config/api";
import {
  LOGIN_USER_FAILURE,
  LOGIN_USER_SUCCESS,
  REGISTER_USER_FAILURE,
  REGISTER_USER_SUCCESS,
  GET_USER_PROFILE_SUCCESS,
  GET_USER_PROFILE_FAILURE,
  SEND_OTP_SUCCESS,
  SEND_OTP_FAILURE,
  VALIDATE_OTP_SUCCESS,
  VALIDATE_OTP_FAILURE,
  LOGOUT,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAILURE,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILURE,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
} from "./ActionType";

// LOGIN + FETCH PROFILE
export const loginUser = (loginData) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, loginData);
    const { jwt, responseMessage, responseCode } = res.data;

    localStorage.setItem("resMsg", responseMessage);
    localStorage.setItem("resCode", responseCode);

    if (jwt) {
      sessionStorage.setItem("jwt", jwt);
      dispatch({ type: LOGIN_USER_SUCCESS, payload: jwt });

      // Fetch user profile immediately after login
      await dispatch(getUserProfile(jwt));
    }
  } catch (error) {
    dispatch({
      type: LOGIN_USER_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// REGISTER + FETCH PROFILE
export const regUser = (regData) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, regData, {
      timeout: 30000,
    });
    const { jwt, responseMessage, responseCode } = res.data;

    localStorage.setItem("resMsg", responseMessage || "");
    localStorage.setItem("resCode", responseCode || "");

    if (jwt) {
      sessionStorage.setItem("jwt", jwt);
      dispatch({ type: REGISTER_USER_SUCCESS, payload: jwt });

      // Fetch user profile after successful registration
      await dispatch(getUserProfile(jwt));
    }

    return res.data;

  } catch (error) {
    // Always return a usable {responseCode, responseMessage} so the caller can
    // surface a real message instead of a generic "No response from server".
    const message =
      error.response?.data?.responseMessage ||
      error.response?.data?.message ||
      (error.code === "ECONNABORTED"
        ? "The server took too long to respond. Please try again."
        : error.message) ||
      "The member could not be created.";

    dispatch({ type: REGISTER_USER_FAILURE, payload: message });

    return error.response?.data || { responseCode: "419", responseMessage: message };
  }
};

export const getUserProfile = (jwt) => async (dispatch) => {
  try {
    if (!jwt) {
      dispatch(logout());
      return;
    }

    const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    dispatch({ type: GET_USER_PROFILE_SUCCESS, payload: res.data });

  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message || "Something went wrong.";

    // Handle specific auth failures
    if (status === 401 || status === 403 || status === 500) {
      dispatch(logout());
    }

    // Optionally show alert or toast for 500 errors
    if (status === 500) {
      console.error("Server error while fetching user profile:", message);
    }

    dispatch({
      type: GET_USER_PROFILE_FAILURE,
      payload: message,
    });
  }
};

// SEND OTP TO EMAIL
export const sendOTP = (data) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/otp/sendOTP`, data);

    dispatch({ type: SEND_OTP_SUCCESS, payload: res.data });

    return res.data;

  } catch (error) {
    console.error("Send OTP error:", error);

    const errorData = {
      responseCode: "419",
      responseMessage: error.response?.data?.responseMessage || error.response?.data?.message || error.message || "Failed to send OTP. Please try again.",
    };

    dispatch({
      type: SEND_OTP_FAILURE,
      payload: errorData.responseMessage,
    });

    // Return error data so OtpInputSection can display it
    return errorData;
  }
};

// VALIDATE ENTERED OTP
export const validateOTP = (data) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/otp/validateOTP`, data);

    dispatch({ type: VALIDATE_OTP_SUCCESS, payload: res.data });

    return res.data;

  } catch (error) {
    console.error("Validate OTP error:", error);

    const errorData = {
      responseCode: "419",
      responseMessage: error.response?.data?.responseMessage || error.response?.data?.message || error.message || "OTP validation failed.",
    };

    dispatch({
      type: VALIDATE_OTP_FAILURE,
      payload: errorData.responseMessage,
    });

    // Return error data so OtpInputSection can display it
    return errorData;
  }
};

// change password
export const changePass = (data) => async (dispatch) => {
  try {
    const res = await api.put(`${API_BASE_URL}/api/auth/changepass`, data);

    dispatch({ type: CHANGE_PASSWORD_SUCCESS, payload: res.data });

    localStorage.setItem("cpResMsg", res.data.responseMessage);
    localStorage.setItem("cpResCode", res.data.responseCode);

  } catch (error) {
    console.error("change pass error:", error);
    dispatch({
      type: CHANGE_PASSWORD_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// change the default password on first login (no OTP required)
export const changeDefaultPass = (data) => async (dispatch) => {
  try {
    const jwt = sessionStorage.getItem("jwt");
    const res = await axios.put(
      `${API_BASE_URL}/api/auth/change-default-pass`,
      data,
      { headers: { Authorization: `Bearer ${jwt}` } }
    );

    dispatch({ type: CHANGE_PASSWORD_SUCCESS, payload: res.data });

    localStorage.setItem("cpResMsg", res.data.responseMessage);
    localStorage.setItem("cpResCode", res.data.responseCode);

    return res.data;

  } catch (error) {
    console.error("change default pass error:", error);
    dispatch({
      type: CHANGE_PASSWORD_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// LOGOUT
export const logout = () => (dispatch) => {
  sessionStorage.removeItem("jwt");
  localStorage.removeItem("resMsg");
  localStorage.removeItem("resCode");
  dispatch({ type: LOGOUT });
};

/**
 * Step 1 of a password reset: ask the cooperative to send a code.
 *
 * `{ organization, ledgerID, email }`. All three are required, and the cooperative is not optional
 * -- the same email address can belong to a member of more than one cooperative, so there is no
 * such thing as a reset request for "the account with this email".
 *
 * The response is deliberately the same whether the member exists or not, so nothing here can be
 * used to discover who belongs to a cooperative. The code goes to the address already on the
 * member's record, never to the address typed into this form.
 */
export const requestPasswordReset = (data) => async (dispatch) => {
  try {
    dispatch({ type: FORGOT_PASSWORD_REQUEST });
    const res = await axios.post(
      `${API_BASE_URL}/api/auth/forgot-password/request`,
      data
    );
    dispatch({ type: FORGOT_PASSWORD_SUCCESS, payload: res.data });
    return res.data;
  } catch (error) {
    const errorData = {
      responseCode: "419",
      responseMessage:
        error.response?.data?.responseMessage ||
        error.response?.data?.message ||
        error.message ||
        "Could not start the password reset. Please try again.",
    };
    dispatch({ type: FORGOT_PASSWORD_FAILURE, payload: errorData.responseMessage });
    return errorData;
  }
};

/**
 * Step 2: set a new password using the code.
 *
 * `{ organization, ledgerID, email, otp, newPassword, confirmPassword }`. The code is only valid
 * inside the cooperative it was issued for, so `organization` travels with it here too.
 */
export const resetPassword = (data) => async (dispatch) => {
  try {
    dispatch({ type: RESET_PASSWORD_REQUEST });
    const res = await axios.post(
      `${API_BASE_URL}/api/auth/forgot-password/reset`,
      data
    );
    dispatch({ type: RESET_PASSWORD_SUCCESS, payload: res.data });
    return res.data;
  } catch (error) {
    const errorData = {
      responseCode: "419",
      responseMessage:
        error.response?.data?.responseMessage ||
        error.response?.data?.message ||
        error.message ||
        "Could not reset the password. Please try again.",
    };
    dispatch({ type: RESET_PASSWORD_FAILURE, payload: errorData.responseMessage });
    return errorData;
  }
};
