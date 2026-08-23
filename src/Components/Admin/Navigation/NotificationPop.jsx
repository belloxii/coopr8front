import { Popover, Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const NotificationPop = ({ anchorEl, open, handleClose, notifications = [], onClearAll }) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: { width: 300, maxHeight: 400, overflowY: 'auto', p: 2, borderRadius:"25px" },
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

          {notifications?.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No notifications available.
            </Typography>
          ) : (
            notifications.map((n, i) => (
              <Box key={i} className="mb-2 p-2 bg-muted rounded-xl border border-border">
                <Typography variant="subtitle2">{n.title}</Typography>
                <Typography variant="body2" color="text.secondary">{n.message}</Typography>
              </Box>
            ))
          )}
        </Box>

        {/* Clear All button */}
        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="w-full mt-2 bg-red-400 hover:bg-red-500 text-white text-sm py-2 rounded-full">
            Read All
          </button>
        )}
      </Box>
    </Popover>
  );
};

export default NotificationPop;
