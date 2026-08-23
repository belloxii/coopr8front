import { api } from "../../config/api";
import {
  GET_MY_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATIONS,
  MARK_NOTIFICATION_AS_READ,
  MARK_ALL_NOTIFICATIONS_AS_READ,
  DELETE_NOTIFICATION,
  DELETE_ALL_NOTIFICATIONS,
  NOTIFICATIONS_ERROR,
  SET_NOTIFICATIONS_LOADING,
} from "./ActionType";

export const getMyNotifications = () => async (dispatch) => {
  dispatch({ type: SET_NOTIFICATIONS_LOADING });
  try {
    const res = await api.get("/api/notis/mynotis");
    dispatch({ type: GET_MY_NOTIFICATIONS, payload: res.data });

  } catch (err) {
    dispatch({ type: NOTIFICATIONS_ERROR, payload: err.message });
  }
};

export const getUnreadNotifications = () => async (dispatch) => {
  dispatch({ type: SET_NOTIFICATIONS_LOADING });
  try {
    const res = await api.get("/api/notis/user/unread");
    dispatch({ type: GET_UNREAD_NOTIFICATIONS, payload: res.data });
  } catch (err) {
    dispatch({ type: NOTIFICATIONS_ERROR, payload: err.message });
  }
};

export const markNotificationAsRead = (id) => async (dispatch) => {
  try {
    await api.put(`/api/notis/mark-read/${id}`);
    dispatch({ type: MARK_NOTIFICATION_AS_READ, payload: id });
  } catch (err) {
    dispatch({ type: NOTIFICATIONS_ERROR, payload: err.message });
  }
};

export const markAllNotificationsAsRead = () => async (dispatch) => {
  try {
    await api.put("/api/notis/mark-all-read");
    dispatch({ type: MARK_ALL_NOTIFICATIONS_AS_READ });
  } catch (err) {
    dispatch({ type: NOTIFICATIONS_ERROR, payload: err.message });
  }
};

export const deleteNotification = (id) => async (dispatch) => {
  try {
    await api.delete(`/api/notis/${id}`);
    dispatch({ type: DELETE_NOTIFICATION, payload: id });
  } catch (err) {
    dispatch({ type: NOTIFICATIONS_ERROR, payload: err.message });
  }
};

export const deleteAllNotifications = () => async (dispatch) => {
  try {
    await api.delete("/notis/user/delete");
    dispatch({ type: DELETE_ALL_NOTIFICATIONS });
  } catch (err) {
    dispatch({ type: NOTIFICATIONS_ERROR, payload: err.message });
  }
};
