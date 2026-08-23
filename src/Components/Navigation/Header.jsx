import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../Store/Auth/Action';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import NotificationPop from './NotificationPop';
import ChangePasswordModal from './ChangePasswordModal';
import { getMyNotifications } from '../../Store/Notis/Action';
import { useTheme } from '../../theme/ThemeContext';
import OrgBrand from '../Branding/OrgBrand';

const Header = () => {
  const { auth } = useSelector((store) => store);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode, toggle } = useTheme();

  const [anchorEl, setAnchorEl] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const openMenu = Boolean(anchorEl);
  const notifOpen = Boolean(notifAnchorEl);

  const handleNotifClose = () => setNotifAnchorEl(null);
  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    dispatch(logout());
    handleCloseMenu();
  };

  const goToProfile = () => {
    navigate(`/profile/${auth?.user?.user?.id}`);
    handleCloseMenu();
  };

  const handleChangePass = () => {
    setShowPasswordModal(true);
    handleCloseMenu();
  };

  useEffect(() => {
    dispatch(getMyNotifications());
  }, [dispatch]);


  return (
    <div className="p-3 border border-border bg-card shadow-xl h-[4rem] rounded-2xl justify-between flex items-center text-foreground">
      {/* Left: dark mode toggle */}
      <div className="flex items-center gap-2 min-w-0">
        <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton onClick={toggle} color="inherit" aria-label="Toggle dark mode">
            {mode === 'dark' ? (
              <LightModeOutlinedIcon fontSize="medium" />
            ) : (
              <DarkModeOutlinedIcon fontSize="medium" />
            )}
          </IconButton>
        </Tooltip>

        {/*
          The cooperative's mark, for screens too narrow for the sidebar -- otherwise
          mobile members would never see whose app they are in.
        */}
        <div className="lg:hidden min-w-0 truncate">
          <OrgBrand textClassName="text-xl" />
        </div>
      </div>

      {/* Right: notifications, user, menu */}
      <div className="flex space-x-3 items-center">
        <div className="relative cursor-pointer">
          <NotificationPop
            open={notifOpen}
            anchorEl={notifAnchorEl}
            handleClose={handleNotifClose}
          />
        </div>

        <div>
          <p className="font-semibold">
            {`${auth?.user?.user?.firstName} ${auth?.user?.user?.middleName || ''} ${auth?.user?.user?.lastName}`}
          </p>
          <p className="text-sm text-right">
            {auth?.user?.user?.role?.replace(/^ROLE_/, '').toLowerCase().replace(/^./, (c) => c.toUpperCase())}
          </p>
        </div>

        <Avatar
          src={auth?.user?.user?.passport || auth?.user?.user?.image}
          onClick={handleAvatarClick}
          style={{ cursor: 'pointer' }}
        />

        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { borderRadius: '25px' } }}
        >
          <MenuItem onClick={goToProfile}>Profile</MenuItem>
          <MenuItem onClick={handleChangePass}>Change Password</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </div>

      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        email={auth?.user?.user?.email}
      />
    </div>
  );
};

export default Header;
