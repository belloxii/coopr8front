import { api } from "../../config/api"
import { UPDATE_USER_FAILURE, UPDATE_USER_SUCCESS, USER_BY_ID_SUCCESS, USER_BY_PHONE_FAILURE, USER_BY_PHONE_SUCCESS } from "./ActionType"

export const updateUser = (reqData) => async(dispatch) => {
    try {
        const resData = await api.put(`/api/user/update`, reqData)
        dispatch({type:UPDATE_USER_SUCCESS, payload:resData.data})

    } catch (error) {
        dispatch({type:UPDATE_USER_FAILURE, payload:error.message})
    }
}

export const getUserByPhone = (phone) => async(dispatch) => {
    try {
        const resData = await api.get(`/api/user/phone/${phone}`)
        dispatch({type:USER_BY_PHONE_SUCCESS, payload:resData.data})
        return { payload: resData.data }; // ✅ Return result

    } catch (error) {
        dispatch({type:USER_BY_PHONE_FAILURE, payload:error.message})
    }

};

export const getUserById = (userId) => async(dispatch) => {
    try {
        const resData = await api.get(`/api/user/id/${userId}`)
        dispatch({type:USER_BY_ID_SUCCESS, payload:resData.data})
        return { payload: resData.data }; // ✅ Return result

    } catch (error) {
        dispatch({type:USER_BY_PHONE_FAILURE, payload:error.message})
    }

};