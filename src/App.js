import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Authentication from './Components/Authentication/Authentication';
import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile } from './Store/Auth/Action';
import { getCurrentOrganization } from './Store/Organization/Action';
import HomePage from './Components/Navigation/HomePage';
import AdminHomePage from './Components/Admin/Navigation/AdminHomePage';
import VerifyPayment from './Components/Pages/VerifyPayment';
import { Analytics } from "@vercel/analytics/react";
import Skeleton from '@mui/material/Skeleton'; // Import MUI Skeleton
import { PLATFORM_NAME } from './config/branding';
import { useOrganization } from './Utils/useOrganization';
import { usePublicOrganization } from './Utils/usePublicOrganization';
import { useApplyTenantTheme } from './Utils/useApplyTenantTheme';
import OrganizationSelector from './Components/Organizations/OrganizationSelector';
import OrganizationNotFound from './Components/Organizations/OrganizationNotFound';
const PlatformLogin = lazy(() => import('./Components/Platform/PlatformLogin'));
const PlatformLayout = lazy(() => import('./Components/Platform/PlatformLayout'));
const PlatformOrganizations = lazy(() => import('./Components/Platform/PlatformOrganizations'));
const PlatformPlans = lazy(() => import('./Components/Platform/PlatformPlans'));
const LandingPage = lazy(() => import('./Components/Landing/LandingPage'));

function App() {
  const [loading, setLoading] = useState(true); // State to manage loading
  const jwt = sessionStorage.getItem("jwt");
  const { auth } = useSelector(store => store);
  const dispatch = useDispatch();
  const isAuthenticated = Boolean(auth.user?.user);
  const location = useLocation();
  const isPlatformRoute = location.pathname.startsWith('/platform');
  const slugMatch = location.pathname.match(/^\/o\/([^/]+)/);
  const routeSlug = slugMatch ? slugMatch[1] : null;

  const { name: orgName, isLoaded: orgLoaded, primaryColor: authPrimaryColor } = useOrganization();
  const { organization: publicOrg } = usePublicOrganization(routeSlug);


  // Tenant branding applies when authenticated inside a tenant or visiting /o/:slug.
  // Platform admin routes always stay neutral default theme.
  const effectivePrimaryColor = isPlatformRoute
    ? null
    : isAuthenticated
    ? authPrimaryColor
    : routeSlug
    ? publicOrg?.primaryColor
    : null;

  useApplyTenantTheme(effectivePrimaryColor);

  useEffect(() => {
    if (jwt) {
      setLoading(true); // Set loading to true when fetching user profile
      dispatch(getUserProfile(jwt))
        .finally(() => {
          setLoading(false); // Set loading to false once the profile is fetched
        });
    } else {
      setLoading(false); // If no JWT, stop loading
    }
  }, [dispatch, jwt]);

  // Tenant branding is fetched once, from the authenticated endpoint that derives the
  // organization from the JWT. Signed-out visitors see neutral COOPR8 branding because
  // no organization is known before authentication.
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCurrentOrganization());
    }
  }, [dispatch, isAuthenticated]);

  // Inside a tenant the tab shows the cooperative's name; outside it, the platform's.
  // When visiting /o/:slug auth pages, Authentication.jsx sets its own specific title.
  useEffect(() => {
    if (!routeSlug) {
      document.title = isAuthenticated && orgLoaded ? orgName : PLATFORM_NAME;
    }
  }, [isAuthenticated, orgLoaded, orgName, routeSlug]);

  return (
    <div className="App">
      {loading ? (
        // Display a skeleton loader while loading
        <div className="skeleton-loader">
          <Skeleton variant="rectangular" width="100%" height="100vh" />
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="skeleton-loader">
              <Skeleton variant="rectangular" width="100%" height="100vh" />
            </div>
          }
        >
          <Routes>
          {/* Base URL: Landing Page for visitors; dashboard redirect if already logged in */}
          <Route
            path='/'
            element={
              auth.user?.user ? (
                auth.user?.user?.role === "ROLE_ADMIN" ? (
                  <Navigate to="/admin/home" replace />
                ) : (
                  <Navigate to="/home" replace />
                )
              ) : (
                <LandingPage />
              )
            }
          />
          {/* Platform super admin routes */}
          <Route path='/platform/login' element={<Navigate to="/login" replace />} />
          <Route
            path='/platform/organizations'
            element={
              <PlatformLayout>
                <PlatformOrganizations />
              </PlatformLayout>
            }
          />
          <Route
            path='/platform/plans'
            element={
              <PlatformLayout>
                <PlatformPlans />
              </PlatformLayout>
            }
          />
          <Route
            path='/platform'
            element={
              <PlatformLayout>
                <PlatformOrganizations />
              </PlatformLayout>
            }
          />
          <Route
            path='/admin/*'
            element={auth.user?.user?.role === "ROLE_ADMIN" ? <AdminHomePage /> : <Authentication />}
          />
          <Route path='/verify/*' element={auth.user ? <VerifyPayment /> : <Authentication />} />
          <Route path='/login' element={<PlatformLogin />} />
          <Route path='/organizations' element={<OrganizationSelector />} />
          <Route path='/onboard' element={<OrganizationSelector onboarding />} />
          <Route path='/billing' element={<Navigate to="/onboard" replace />} />

          {/*
            The organization-specific entry points. `/o/{slug}/login` is how a member normally
            arrives: the slug in the URL is what tells the backend which cooperative to look their
            membership number up in, so two cooperatives can both issue a number 0001 without
            either login becoming ambiguous.

            Membership authentication is never available on a slug-less route. `/login` belongs
            only to platform administrators; members must start from the organization selector.
          */}
          <Route path='/o/:slug/login' element={<Authentication />} />
          <Route path='/o/:slug/signup' element={<Authentication />} />
          <Route path='/o/:slug/forgot-password' element={<Authentication />} />
          <Route path='/organization-not-found' element={<OrganizationNotFound />} />
          <Route path='/*' element={auth.user?.user ? <HomePage /> : <Navigate to="/organizations" replace />} />
        </Routes>
        </Suspense>
      )}
      <Analytics />
    </div>
  );
}

export default App;
