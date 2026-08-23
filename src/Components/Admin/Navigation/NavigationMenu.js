import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import StorefrontIcon from '@mui/icons-material/Storefront';
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
// import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

export const adminNavigationMenu = [
  {title: "Dashboard",icon: <DashboardIcon />,path: "/admin/home"},
  {title: "Users",icon: <PeopleAltIcon />,path: "/admin/users"},
  {title: "Savings",icon: <AccountBalanceWalletIcon />,path: "/admin/savings"},
  {title: "Loans",icon: <VolunteerActivismIcon />,path: "/admin/loans"},
  {title: "Repays",icon: <CreditScoreIcon />,path: "/admin/repayments"},
  {title: "Shares",icon: <WorkHistoryIcon />,path: "/admin/shares"},
  {title: "Products",icon: <StorefrontIcon />,path: "/admin/products"},
  // {title: "Orders",icon: <ShoppingCartIcon />,path: "/admin/orders"},
  // {title: "Purchases",icon: <ShoppingBasketIcon />,path: "/admin/purchases"},
];
