import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import StorefrontIcon from '@mui/icons-material/Storefront';
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
// import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import PersonIcon from '@mui/icons-material/Person'; 

export const navigationMenu = [
    {title: "Dashboard", icon: <DashboardIcon />, path: "/home"},
    {title: "Savings", icon: <AccountBalanceWalletIcon />, path: "/savings"},
    {title: "Loans", icon: <VolunteerActivismIcon />, path: "/loans"},
    {title: "Repays", icon: <CreditScoreIcon />, path: "/repayments"},
    {title: "Shares", icon: <WorkHistoryIcon />, path: "/shares"},
    {title: "Products", icon: <StorefrontIcon />, path: "/products"},
    // {title:"Orders", icon:<ShoppingCartIcon/>, path:"/orders"},
    // {title:"Purchases", icon:<ShoppingBasketIcon/>, path:"/purchases"},
    {title: "Profile", icon: <PersonIcon />, path: "/profile"}
];
