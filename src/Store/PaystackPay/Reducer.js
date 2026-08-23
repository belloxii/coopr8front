import { VERIFY_PAYMENT_SUCCESS } from "./ActionType";

const initialState = {
  verifyResult: null, // or verifyData, or similar
  // other states...
};

export const paystackReducer = (state = initialState, action) => {
  switch (action.type) {
    case VERIFY_PAYMENT_SUCCESS:
      return { ...state, verifyResult: action.payload };
    // ...
    default:
      return state;
  }
};
