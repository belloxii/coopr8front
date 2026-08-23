import {
  USER_BY_ID_SUCCESS,
  UPDATE_USER_SUCCESS,
  USER_BY_PHONE_REQUEST,
  USER_BY_PHONE_SUCCESS,
  USER_BY_PHONE_FAILURE,
} from "./ActionType";

const initialState = {
  // user: null,
  findUser: null,
  updateUser: null,
  userByPhone: null,
  loading: false,
  error: null,
  jwt: null,
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        findUser: action.payload,
      };

    case UPDATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        updateUser: action.payload,
      };

    case USER_BY_PHONE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        userByPhone: null,
      };

    case USER_BY_PHONE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        userByPhone: action.payload,
      };

    case USER_BY_PHONE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        userByPhone: null,
      };

    default:
      return state;
  }
};
