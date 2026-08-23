import { api } from "../../config/api";
import { GET_ALL_REPAYS_FAILURE, GET_ALL_REPAYS_SUCCESS, GET_USER_REPAYS_FAILURE, GET_USER_REPAYS_SUCCESS, NEW_REPAY_FAILURE, NEW_REPAY_SUCCESS } from "./ActionType";

// Fetch all repays
export const getAllRepays = () => async (dispatch) => {
    try {
        const { data } = await api.get("/api/admin/repays/all");
        dispatch({ type: GET_ALL_REPAYS_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: GET_ALL_REPAYS_FAILURE, payload: error.message });
    }
};

// Fetch repays for a specific user
export const myRepays = () => async (dispatch) => {
    try {
        const { data } = await api.get(`/api/loan/myrepays`);
        dispatch({ type: GET_USER_REPAYS_SUCCESS, payload: {data}.data });
    } catch (error) {
        dispatch({ type: GET_USER_REPAYS_FAILURE, payload: error.message });
    }
};

// Apply for a repay
export const addRepay = (loanId, repayData) => async (dispatch) => {
    try {
        const { data } = await api.post(`/api/loan/${loanId}/repay`, repayData);
        dispatch({ type: NEW_REPAY_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: NEW_REPAY_FAILURE, payload: error.message });
    }
};
