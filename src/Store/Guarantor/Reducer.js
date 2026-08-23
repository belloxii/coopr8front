import {
  FETCH_GUARANTOR_REQUESTS_SUCCESS,
  FETCH_GUARANTOR_REQUESTS_REQUEST,
  ACCEPT_GUARANTOR_REQUEST_REQUEST,
  DECLINE_GUARANTOR_REQUEST_REQUEST,
  ACCEPT_GUARANTOR_REQUEST_SUCCESS,
  DECLINE_GUARANTOR_REQUEST_SUCCESS,
  FETCH_GUARANTOR_REQUESTS_FAILURE,
  ACCEPT_GUARANTOR_REQUEST_FAILURE,
  DECLINE_GUARANTOR_REQUEST_FAILURE,
} from "./ActionType";

const initialState = {
  requests: [],
  loading: false,
  error: null,
  message: null,
};

const guarantorReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_GUARANTOR_REQUESTS_REQUEST:
    case ACCEPT_GUARANTOR_REQUEST_REQUEST:
    case DECLINE_GUARANTOR_REQUEST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        message: null,
      };

    case FETCH_GUARANTOR_REQUESTS_SUCCESS:
      return {
        ...state,
        loading: false,
        requests: action.payload,
      };

    case ACCEPT_GUARANTOR_REQUEST_SUCCESS:
    case DECLINE_GUARANTOR_REQUEST_SUCCESS:
      return {
        ...state,
        loading: false,
        message: action.payload.message,
        request: action.payload,
      };

    case FETCH_GUARANTOR_REQUESTS_FAILURE:
    case ACCEPT_GUARANTOR_REQUEST_FAILURE:
    case DECLINE_GUARANTOR_REQUEST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default guarantorReducer;
