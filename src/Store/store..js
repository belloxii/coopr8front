import { applyMiddleware, combineReducers, legacy_createStore } from "redux";
import { thunk } from "redux-thunk";
import { authReducer } from "./Auth/Reducer";
import { loanReducer } from "./Loan/Reducer";
import { userReducer } from "./User/Reducer";
import { repayReducer } from "./Repay/Reducer";
import { savingReducer } from "./Saving/Reducer";
import { adminReducer } from "./Admin/Reducer";
import { paystackReducer } from "./PaystackPay/Reducer";
import { sharesReducer } from "./Shares/Reducer";
import notificationReducer from "./Notis/Reducer";
import guarantorReducer from "./Guarantor/Reducer";
import { organizationReducer } from "./Organization/Reducer";

const rootReducers = combineReducers({

    auth:authReducer,
    admin:adminReducer,
    loan:loanReducer,
    user:userReducer,
    repay:repayReducer,
    saving:savingReducer,
    paystack: paystackReducer,
    shares: sharesReducer,
    notifications: notificationReducer,
    guarantor: guarantorReducer,
    organization: organizationReducer

});

export const store = legacy_createStore(rootReducers, applyMiddleware(thunk));