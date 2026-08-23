import { FIND_SAVING_BY_ID_SUCCESS, GET_ALL_SAVINGS_FAILURE, GET_ALL_SAVINGS_REQUEST, GET_ALL_SAVINGS_SUCCESS, GET_USER_LAST_SAVING_FAILURE, GET_USER_LAST_SAVING_REQUEST, GET_USER_LAST_SAVING_SUCCESS, GET_USER_SAVINGS_FAILURE, GET_USER_SAVINGS_REQUEST, GET_USER_SAVINGS_SUCCESS, NEW_SAVING_FAILURE, NEW_SAVING_REQUEST, NEW_SAVING_SUCCESS } from "./ActionType";

const initialState = {
    data: null,
    loading: false,
    error: null,
    saving: null,
    lastSaving: null,
    savings: []
};

export const savingReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_ALL_SAVINGS_REQUEST:
        case GET_USER_SAVINGS_REQUEST:
        case GET_USER_LAST_SAVING_REQUEST:
        case NEW_SAVING_REQUEST:
            return { ...state, loading: true, error: null };

        case GET_ALL_SAVINGS_FAILURE:
        case GET_USER_SAVINGS_FAILURE:
        case GET_USER_LAST_SAVING_FAILURE:
        case NEW_SAVING_FAILURE:
            return { ...state, loading: false, error: action.payload };

        case GET_ALL_SAVINGS_SUCCESS:
        case GET_USER_SAVINGS_SUCCESS:
            return { ...state, loading: false, error: null, savings: action.payload };

        case NEW_SAVING_SUCCESS:
            return { ...state, loading: false, error: null, savings: [action.payload, ...state.savings] };

        case FIND_SAVING_BY_ID_SUCCESS:
            return { ...state, loading: false, error: null, saving: action.payload };
        case GET_USER_LAST_SAVING_SUCCESS:
            return { ...state, loading: false, error: null, lastSaving: action.payload };

        default:
            return state;
    }
};
