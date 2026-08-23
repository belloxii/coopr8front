import {
  LOGIN_USER_REQUEST,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_FAILURE,
  REGISTER_USER_REQUEST,
  REGISTER_USER_SUCCESS,
  REGISTER_USER_FAILURE,
  GET_USER_PROFILE_REQUEST,
  GET_USER_PROFILE_SUCCESS,
  GET_USER_PROFILE_FAILURE,
  LOGOUT,
  SEND_OTP_SUCCESS,
  SEND_OTP_FAILURE,
  VALIDATE_OTP_SUCCESS,
  VALIDATE_OTP_FAILURE,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAILURE,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILURE,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
} from "./ActionType";


const initialState = {
  user: null,
  jwt: null,
  loading: false,
  error: null,
  otp: null,
  changePass: null,
  passwordReset: null,
  isInitialized: false, // ✅ new flag
};


export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_USER_REQUEST:
    case REGISTER_USER_REQUEST:
      return { ...state, loading: true, error: null };

    case LOGIN_USER_FAILURE:
    case REGISTER_USER_FAILURE:
    case CHANGE_PASSWORD_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case SEND_OTP_SUCCESS:
    case VALIDATE_OTP_SUCCESS:
      return {
        ...state,
        otp: action.payload,
      };

      case CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        changePass: action.payload,
      };

    case SEND_OTP_FAILURE:
    case VALIDATE_OTP_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // A reset attempt never touches `user` or `jwt`: finishing a reset does not sign anyone in,
    // it sends them back to the login page with their new password.
    case FORGOT_PASSWORD_REQUEST:
    case RESET_PASSWORD_REQUEST:
      return { ...state, loading: true, error: null, passwordReset: null };

    case FORGOT_PASSWORD_SUCCESS:
    case RESET_PASSWORD_SUCCESS:
      return { ...state, loading: false, passwordReset: action.payload };

    case FORGOT_PASSWORD_FAILURE:
    case RESET_PASSWORD_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case GET_USER_PROFILE_REQUEST:
      return { ...state, loading: true, error: null, isInitialized: false };

    case GET_USER_PROFILE_SUCCESS:
      return { ...state, user: action.payload, loading: false, error: null, isInitialized: true };

    case GET_USER_PROFILE_FAILURE:
      return { ...state, loading: false, error: action.payload, isInitialized: true };

    case LOGIN_USER_SUCCESS:
    case REGISTER_USER_SUCCESS:
      return { ...state, jwt: action.payload, loading: false, error: null };

    case LOGOUT:
      return { ...initialState, isInitialized: true };

    default:
      return state;

  }
};
