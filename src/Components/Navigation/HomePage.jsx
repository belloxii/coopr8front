import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  BottomNavigation,
  BottomNavigationAction,
  Avatar,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Store/Auth/Action";

import Dashboard from "../Pages/Dashboard/Dashboard";
import Products from "../Pages/Products";
import Loan from "../Pages/Loan/Loan";
import LoanDetails from "../Pages/Loan/LoanDetails";
import Profile from "../Pages/Profile/Profile";
import { navigationMenu } from "./NavigationMenu";
import Header from "./Header";
import { useEffect, useState } from "react";
import Savings from "../Pages/Savings/Savings";
import Shares from "../Pages/Shares/Shares";
import Repayments from "../Pages/Repayment/Repayments";
import ChangePasswordDialog from "../Authentication/ChangePasswordDialog";
import OrgBrand from "../Branding/OrgBrand";
import { PLATFORM_ATTRIBUTION, PLATFORM_SUPPORT_WHATSAPP } from "../../config/branding";
import { useOrganization } from "../../Utils/useOrganization";

const HomePage = () => {
  const { auth } = useSelector((store) => store);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { name: orgName, isLoaded: orgLoaded, platformName, contactPhone, ecommerceEntitled } = useOrganization();

  const [anchorEl, setAnchorEl] = useState(null);
  const [navValue, setNavValue] = useState(0);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const open = Boolean(anchorEl);

  // Prompt members still using the default password to change it on login.
  useEffect(() => {
    if (auth?.user?.requiresPasswordChange) {
      setShowChangePassword(true);
    }
  }, [auth?.user?.requiresPasswordChange]);

  const visibleMenu = navigationMenu.filter(
    (item) => item.title !== "Products" || ecommerceEntitled
  );
  const filteredMenu = visibleMenu.filter((item) => item.title !== "Profile");

  useEffect(() => {
    const currentRoute = filteredMenu.findIndex(item => 
      location.pathname.startsWith(item.path)
    );
    if (currentRoute !== -1) {
      setNavValue(currentRoute);
    }
  }, [location.pathname, filteredMenu]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
  };

  const user = auth?.user?.user;

  // Support chat is a tenant surface: it names the member's own cooperative and, where
  // the organization has published a contact phone, routes to that cooperative rather
  // than to a number shared across tenants. COOPR8 platform support is the fallback.
  const brandLabel = orgLoaded ? orgName : platformName;
  const supportNumber = (contactPhone || PLATFORM_SUPPORT_WHATSAPP).replace(/[^0-9]/g, "");

  const message = user
    ? `
  ${user.firstName}, welcome to ${brandLabel} feedback WhatsApp chat.

  User Info:
  Name: ${user.firstName} ${user.lastName}
  Ledger ID: ${user.ledgerID}
  Email: ${user.email}

  Feedback/Complaint: __________`
    : `Hello, I would like to send feedback to ${brandLabel}.`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/${supportNumber}?text=${encodedMessage}`;


  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden lg:flex flex-col justify-between w-1/6 bg-card shadow-xl px-4 py-3 h-screen sticky top-0 text-muted-foreground z-50">
        <div className="">
          {/* The cooperative's own mark, with COOPR8 as the neutral fallback */}
          <OrgBrand className="mb-8 ml-3" onClick={() => navigate("/home")} />

          <div className="space-y-2">
            {visibleMenu.map((item) => {
              const isActive = location.pathname.startsWith(item.path);

              return (
                <div
                  key={item.title}
                  className={`cursor-pointer flex space-x-3 items-center px-5 py-2 rounded-3xl transition duration-200 ${
                    isActive ? "bg-primary text-primary-foreground shadow-2xl" : "hover:bg-muted"
                  }`}
                  onClick={() =>
                    item.title === "Profile"
                      ? navigate(`/profile/${auth?.user?.user?.id}`)
                      : navigate(item.path)
                  }
                >
                  {item.icon}
                  <p className="text-lg">{item.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between w-full mt-12">
          <div className="flex flex-col items-start space-y-2 w-full">
            <div className="flex items-center space-x-2 w-full">
            <Avatar alt="username" src={auth?.user?.user?.passport || auth?.user?.user?.image} />
            <div className="flex justify-between w-full">
              <div>
                <p className="font-semibold text-left">
                  {user && (
                    <p className="font-semibold text-left">{`${user.firstName} ${user.middleName} ${user.lastName}`}</p>
                  )}
                </p>
              </div>

              <div>
                <Button
                  id="basic-button"
                  sx={{ textTransform: "none" }}
                  aria-controls={open ? "basic-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleClick}
                >
                  <MoreHorizIcon />
                </Button>
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{ "aria-labelledby": "basic-button" }}
                >
                  <MenuItem onClick={handleLogout}>Switch Account</MenuItem>
                  <MenuItem onClick={handleClose}>Login another account</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </div>
            </div>
            </div>

            {/* Platform attribution: the product under the cooperative's brand */}
            <p className="text-xs text-muted-foreground pl-1">{PLATFORM_ATTRIBUTION}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full">
        <div className="pt-3 fixed bg-card px-3 lg:px-7 z-40 lg:w-[83.3%] w-[100%]">
          <Header />
        </div>

        <div className="pt-20 lg:px-4 pb-10">
          <Routes>
            <Route path="/*" element={<Dashboard />} />
            <Route path="/home" element={<Dashboard />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/loans" element={<Loan />} />
            <Route path="/loans/:loanId" element={<LoanDetails />} />
            <Route path="/repayments" element={<Repayments />} />
            <Route path="/shares" element={<Shares />} />
            <Route path="/products" element={ecommerceEntitled ? <Products /> : <Dashboard />} />
            <Route path="/profile/:userId" element={<Profile />} />
          </Routes>
        </div>

        {/* Bottom Navigation */}
        <div className="block lg:hidden w-full fixed bottom-0 z-40">
          <BottomNavigation
            showLabels
            value={navValue}
            onChange={(event, newValue) => {
              setNavValue(newValue);
              navigate(filteredMenu[newValue].path);
            }}
            sx={{
              px: 1.5,
              py: 0.5,
              backgroundColor: 'background.paper',
              borderTop: '2px solid #55a36c',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              boxShadow: 3,
              display: 'flex',
              justifyContent: 'space-around',
            }}
          >
            {filteredMenu.map((item, index) => (
              <BottomNavigationAction
                key={index}
                label={item.title}
                icon={item.icon}
                sx={{
                  minWidth: 48,
                  padding: 0,
                  margin: 0,
                  "& .MuiBottomNavigationAction-label": {
                    fontSize: '0.8rem',
                    marginTop: '2px',
                  },
                  "&.Mui-selected": {
                    color: "#55a36c",
                  },
                }}
              />
            ))}
          </BottomNavigation>
        </div>

        {/* WhatsApp Chat Icon */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-28 right-5 z-50"
        >
          <div className="flex items-center space-x-3 flex-row-reverse transition-all duration-300">
            <div className="group relative bg-green-500 hover:bg-green-600 transition p-2 rounded-full z-10">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="Chat with us"
                className="w-8 h-8"
              />
              <span
                className="hidden group-hover:flex absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap bg-card text-foreground text-sm font-medium rounded-full px-3 py-2 shadow-lg"
              >
                Drop your feedback and request
              </span>
            </div>
          </div>
        </a>

        {/* Change Password Dialog */}
        <ChangePasswordDialog
          open={showChangePassword}
          onClose={() => setShowChangePassword(false)}
        />

      </div>
    </div>
  );
};

export default HomePage;
