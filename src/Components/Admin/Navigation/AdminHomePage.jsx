import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {BottomNavigation,BottomNavigationAction,Avatar,Menu,MenuItem,Button,} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useState, useEffect } from "react";
import AddUserPage from "../Pages/AdminUsers/AddUser";
import AdminDashboard from "../Pages/Dashboard/Dashboard";
import Users from "../Pages/AdminUsers/Users";
import { adminNavigationMenu } from "./NavigationMenu";
import Orders from "../Pages/Orders";
import { logout } from "../../../Store/Auth/Action";
import Header from "../../Navigation/Header";
import Shares from "../Pages/Shares/Shares";
import Savings from "../Pages/Savings/Savings";
import AddSavings from "../Pages/Savings/AddSavings";
import Loan from "../Pages/Loan/Loan";
import Repayments from "../Pages/Repayment/Repayments";
import Products from "../Pages/Products";
import Purchases from "../Pages/Purchases";
import AdminLoanDetails from "../Pages/Loan/AdminLoanDetails";
import AdminProfile from "../Pages/AdminUsers/Profile/AdminProfile";
import OrgBrand from "../../Branding/OrgBrand";
import { PLATFORM_ATTRIBUTION } from "../../../config/branding";

const AdminHomePage = () => {
  const { auth } = useSelector((store) => store);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [navValue, setNavValue] = useState(0);
  const open = Boolean(anchorEl);

  const filteredMenu = adminNavigationMenu.filter((item) => item.title !== "Profile");

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    dispatch(logout());
    handleClose();
  };

  // Sync BottomNav with location
  useEffect(() => {
    const index = adminNavigationMenu.findIndex((item) =>
      location.pathname.startsWith(item.path)
    );
    setNavValue(index >= 0 ? index : 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen ">
          {/* Sidebar */}
          <div className="hidden lg:flex flex-col justify-between w-1/6 bg-card shadow-xl px-4 py-3 h-screen sticky top-0 text-muted-foreground z-50">
            <div className="">
              {/* The cooperative's own mark, with COOPR8 as the neutral fallback */}
              <OrgBrand
                className="mb-8 ml-3"
                gradientClassName="from-red-500 to-black dark:to-white"
                onClick={() => navigate("/admin/home")}
              />
    
              <div className="space-y-2">
                {adminNavigationMenu.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
    
                  return (
                    <div
                      key={item.title}
                      className={`cursor-pointer flex space-x-5 items-center px-5 py-2 rounded-3xl transition duration-200 ${
                        isActive ? "bg-red-500 text-white" : "hover:bg-muted"
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

        {/* Profile + Menu */}
        <div className="flex items-center justify-between w-full mb-8">
          <div className="flex flex-col items-start space-y-2 w-full">
            <div className="flex items-center space-x-3 w-full">
            <Avatar alt="username" src={auth?.user?.user?.passport || auth?.user?.user?.image} />
            <div className="flex justify-between w-full">
              <p className="font-semibold text-sm truncate">
                {`${auth?.user?.user?.firstName} ${auth?.user?.user?.lastName}`}
              </p>
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

        <div className="pt-20 lg:px-4 pb-10 mb-10">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="/home" element={<AdminDashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/loans" element={<Loan />} />
            <Route path="/repayments" element={<Repayments />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/shares" element={<Shares />} />
            <Route path="/loans/:loanId" element={<AdminLoanDetails />} />
            <Route path="/users/profile/:userId" element={<AdminProfile />} />
            <Route path="/users/add-user" element={<AddUserPage />} />
            <Route path="/savings/add-savings" element={<AddSavings />} />
          </Routes>
        </div>

        {/* Mobile Bottom Navigation */}
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
      borderTop: '2px solid #c23519',
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
            color: "#c23519",
          },
        }}
      />
    ))}
  </BottomNavigation>
</div>

      </div>
    </div>
  );
};

export default AdminHomePage;
