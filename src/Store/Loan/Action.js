import { api } from "../../config/api";
import {
    GET_ALL_LOANS_SUCCESS, GET_ALL_LOANS_FAILURE,
     GET_MY_LOANS_SUCCESS, GET_MY_LOANS_FAILURE,
     APPLY_LOAN_SUCCESS,
     APPROVE_LOAN_SUCCESS, APPROVE_LOAN_FAILURE,
     REJECT_LOAN_FAILURE,
     REJECT_LOAN_SUCCESS,
     FIND_LOAN_BY_ID_SUCCESS,
     FIND_LOAN_BY_ID_FAILURE,
     APPLY_LOAN_FAILURE
} from "./ActionType";

// Fetch all loans
export const getAllLoans = () => async (dispatch) => {
    try {
        const { data } = await api.get("/api/admin/loan/all");
        dispatch({ type: GET_ALL_LOANS_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: GET_ALL_LOANS_FAILURE, payload: error.message });
    }
};

// Fetch loans for a specific user
export const myLoans = () => async (dispatch) => {
    try {
        const { data } = await api.get(`/api/loan/myloans`);
        dispatch({ type: GET_MY_LOANS_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: GET_MY_LOANS_FAILURE, payload: error.message });
    }
};

// Apply for a loan
export const applyLoan = (loanData) => async (dispatch) => {
    try {
        const { data } = await api.post("/api/loan/apply", loanData);
        dispatch({ type: APPLY_LOAN_SUCCESS, payload: data });
        return(data);
    } catch (error) {
        dispatch({ type: APPLY_LOAN_FAILURE, payload: error.message });
    }
};

// Approve a loan
export const approveLoan = (loanId) => async (dispatch) => {
    try {
        const { data } = await api.put(`/api/loan/${loanId}/approve`);
        dispatch({ type: APPROVE_LOAN_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: APPROVE_LOAN_FAILURE, payload: error.message });
    }
};

// Reject a loan
export const rejectLoan = (loanId, reason) => async (dispatch) => {
    try {
        const { data } = await api.put(`/api/loan/${loanId}/reject`, reason);
        dispatch({ type: REJECT_LOAN_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: REJECT_LOAN_FAILURE, payload: error.message });
    }
};

// Fetch a loan by ID
export const findLoanById = (loanId) => async (dispatch) => {
    try {
        const { data } = await api.get(`/api/loan/${loanId}`);
        dispatch({ type: FIND_LOAN_BY_ID_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: FIND_LOAN_BY_ID_FAILURE, payload: error.message });
    }
};
