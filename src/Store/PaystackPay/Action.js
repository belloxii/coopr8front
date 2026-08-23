import { api } from "../../config/api";
import { PAYSTACK_PAYMENT_FAILURE, PAYSTACK_PAYMENT_SUCCESS, VERIFY_PAYMENT_FAILURE, VERIFY_PAYMENT_SUCCESS } from "./ActionType";

// Initialize Paystack payment
export const paystackPay = (payData) => async (dispatch) => {
    try {
        const { data } = await api.post(`/api/payments/initialize`, payData);

        dispatch({ type: PAYSTACK_PAYMENT_SUCCESS, payload: data });

        // Redirect user to Paystack payment page
        if (data?.status && data.data?.authorization_url) {
            window.location.href = data.data.authorization_url;
        }
    } catch (error) {
        dispatch({ type: PAYSTACK_PAYMENT_FAILURE, payload: error.message });
    }
};

// verify Paystack payment
export const verifyPay = (reference) => async (dispatch) => {
  try {
    const { data } = await api.get(`/api/payments/verify/${reference}`);
    dispatch({ type: VERIFY_PAYMENT_SUCCESS, payload: data });
    return { payload: data }; // ✅ return payload for use in component
  } catch (error) {
    dispatch({ type: VERIFY_PAYMENT_FAILURE, payload: error.message });
    return { error }; // ✅ return error too (optional)
  }
};
