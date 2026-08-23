import { FIND_REPAY_BY_ID_SUCCESS, GET_ALL_REPAYS_FAILURE, GET_ALL_REPAYS_REQUEST, GET_ALL_REPAYS_SUCCESS, GET_USER_REPAYS_FAILURE, GET_USER_REPAYS_REQUEST, GET_USER_REPAYS_SUCCESS, NEW_REPAY_FAILURE, NEW_REPAY_REQUEST, NEW_REPAY_SUCCESS } from "./ActionType";

const initialState = {
    data: null,
    loading: false,
    error: null,
    repay: null,
    repays: []
};

export const repayReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_ALL_REPAYS_REQUEST:
        case GET_USER_REPAYS_REQUEST:
        case NEW_REPAY_REQUEST:
            return { ...state, loading: true, error: null };

        case GET_ALL_REPAYS_FAILURE:
        case GET_USER_REPAYS_FAILURE:
        case NEW_REPAY_FAILURE:
            return { ...state, loading: false, error: action.payload };

        case GET_ALL_REPAYS_SUCCESS:
        case GET_USER_REPAYS_SUCCESS:
            return { ...state, loading: false, error: null, repays: action.payload };

        case NEW_REPAY_SUCCESS:
            return { ...state, loading: false, error: null, repays: [action.payload, ...state.repays] };

        case FIND_REPAY_BY_ID_SUCCESS:
            return { ...state, loading: false, error: null, repay: action.payload };

        default:
            return state;
    }
};
