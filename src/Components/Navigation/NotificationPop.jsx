import {
  Popover,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Badge,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../Store/Notis/Action";

const NotificationPop = () => {
  const dispatch = useDispatch();
  const { notifications = [], loading } = useSelector((state) => state.notifications);
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (open) {
      dispatch(getMyNotifications());
    }
  }, [open, dispatch]);

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleMarkSingle = (id) => {
    dispatch(markNotificationAsRead(id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            overflowY: "auto",
            p: 2,
            borderRadius: "25px",
          },
        }}
      >
        <Box className="flex flex-col justify-between h-full space-y-2">
          <Box>
            <Box className="flex justify-between items-center mb-2">
              <Typography variant="h6">Notifications</Typography>
              <IconButton size="small" onClick={handleClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {loading ? (
              <Box className="flex justify-center py-6">
                <CircularProgress size={20} />
              </Box>
            ) : notifications?.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No notifications available.
              </Typography>
            ) : (
              notifications.map((n) => (
                <Box
                  key={n.id}
                  className={`mb-2 p-2 rounded-xl border border-border cursor-pointer ${
                    n.read ? "bg-muted" : "bg-muted"
                  }`}
                  onClick={() => handleMarkSingle(n.id)}
                >
                  <Typography variant="subtitle2">{n.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {n.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    className="text-xs"
                  >
                    {new Date(n.timestamp).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
              ))
            )}
          </Box>

          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="w-full mt-2 bg-red-400 hover:bg-red-500 text-white text-sm py-2 rounded-full"
            >
              Mark All as Read
            </button>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationPop;
