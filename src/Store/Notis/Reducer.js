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

const initialState = {
  notifications: [],
  unread: [],
  loading: false,
  error: null,
};

const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_NOTIFICATIONS_LOADING:
      return { ...state, loading: true };

    case GET_MY_NOTIFICATIONS:
      return { ...state, notifications: action.payload, loading: false };

    case GET_UNREAD_NOTIFICATIONS:
      return { ...state, unread: action.payload, loading: false };

    case MARK_NOTIFICATION_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unread: state.unread.filter((n) => n.id !== action.payload),
      };

    case MARK_ALL_NOTIFICATIONS_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unread: [],
      };

    case DELETE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
        unread: state.unread.filter((n) => n.id !== action.payload),
      };

    case DELETE_ALL_NOTIFICATIONS:
      return { ...state, notifications: [], unread: [] };

    case NOTIFICATIONS_ERROR:
      return { ...state, error: action.payload, loading: false };

    default:
      return state;
  }
};

export default notificationReducer;
