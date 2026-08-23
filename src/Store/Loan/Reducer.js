import {
    GET_ALL_LOANS_REQUEST, GET_ALL_LOANS_SUCCESS, GET_ALL_LOANS_FAILURE,
    GET_MY_LOANS_REQUEST, GET_MY_LOANS_SUCCESS, GET_MY_LOANS_FAILURE,
    APPLY_LOAN_REQUEST, APPLY_LOAN_SUCCESS, APPLY_LOAN_FAILURE,
    APPROVE_LOAN_REQUEST, APPROVE_LOAN_SUCCESS, APPROVE_LOAN_FAILURE,
    FIND_LOAN_BY_ID_REQUEST, FIND_LOAN_BY_ID_SUCCESS, FIND_LOAN_BY_ID_FAILURE,
    REJECT_LOAN_REQUEST,
    REJECT_LOAN_FAILURE,
    REJECT_LOAN_SUCCESS
} from "./ActionType";

const initialState = {
    data: null,
    loading: false,
    error: null,
    loan: null,
    loans: []
};

export const loanReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_ALL_LOANS_REQUEST:
        case GET_MY_LOANS_REQUEST:
        case APPLY_LOAN_REQUEST:
        case APPROVE_LOAN_REQUEST:
        case REJECT_LOAN_REQUEST:
        case FIND_LOAN_BY_ID_REQUEST:
            return { ...state, loading: true, error: null };

        case GET_ALL_LOANS_FAILURE:
        case GET_MY_LOANS_FAILURE:
        case APPLY_LOAN_FAILURE:
        case APPROVE_LOAN_FAILURE:
        case REJECT_LOAN_FAILURE:
        case FIND_LOAN_BY_ID_FAILURE:
            return { ...state, loading: false, error: action.payload };

        case GET_ALL_LOANS_SUCCESS:
        case GET_MY_LOANS_SUCCESS:
            return { ...state, loading: false, error: null, loans: action.payload };

        case APPLY_LOAN_SUCCESS:
            return { ...state, loading: false, error: null, loans: [action.payload, ...state.loans] };

        case APPROVE_LOAN_SUCCESS:
            return { 
                ...state, 
                loading: false, 
                error: null, 
                loans: state.loans.map(loan => 
                    loan.id === action.payload.id ? { ...loan, status: "approved" } : loan
                ) 
            };

        case REJECT_LOAN_SUCCESS:
        return { 
            ...state, 
            loading: false, 
            error: null, 
            loans: state.loans.map(loan => 
                loan.id === action.payload.id ? { ...loan, status: "declined" } : loan
            ) 
        };

        case FIND_LOAN_BY_ID_SUCCESS:
            return { ...state, loading: false, error: null, loan: action.payload };

        default:
            return state;
    }
};
