import { api } from "../../config/api";
import { FIND_SAVING_BY_ID_FAILURE, FIND_SAVING_BY_ID_SUCCESS, GET_ALL_SAVINGS_FAILURE, GET_ALL_SAVINGS_SUCCESS, GET_USER_LAST_SAVING_FAILURE, GET_USER_LAST_SAVING_SUCCESS, GET_USER_SAVINGS_FAILURE, GET_USER_SAVINGS_SUCCESS, NEW_SAVING_FAILURE, NEW_SAVING_SUCCESS } from "./ActionType";

// Fetch all savings
export const getAllSavings = () => async (dispatch) => {
    try {
        const { data } = await api.get("/api/admin/savings/all");
        dispatch({ type: GET_ALL_SAVINGS_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: GET_ALL_SAVINGS_FAILURE, payload: error.message });
    }
};

// Fetch savings for a specific user
export const mySavings = () => async (dispatch) => {
    try {
        const { data } = await api.get(`/api/savings/mysavings`);
        dispatch({ type: GET_USER_SAVINGS_SUCCESS, payload: {data}.data });
    } catch (error) {
        dispatch({ type: GET_USER_SAVINGS_FAILURE, payload: error.message });
    }
};

// Apply for a saving
export const addSaving = () => async (dispatch) => {
    try {
        const { data } = await api.post(`/api/savings/save`);
        dispatch({ type: NEW_SAVING_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: NEW_SAVING_FAILURE, payload: error.message });
    }
};

// Fetch a saving by ID
export const findSavingById = (savingId) => async (dispatch) => {
    try {
        const { data } = await api.get(`/api/savings/${savingId}`);
        dispatch({ type: FIND_SAVING_BY_ID_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: FIND_SAVING_BY_ID_FAILURE, payload: error.message });
    }
};

// Fetch last saving 
export const getUserLastSaving = () => async (dispatch) => {
    try {
        const { data } = await api.get(`/api/savings/last`);
        dispatch({ type: GET_USER_LAST_SAVING_SUCCESS, payload: data });
    } catch (error) {
        dispatch({ type: GET_USER_LAST_SAVING_FAILURE, payload: error.message });
    }
};
