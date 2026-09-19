import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { IconButton, Tooltip } from "@mui/material";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { useTheme } from "../../theme/ThemeContext";
import { PLATFORM_NAME, PLATFORM_TAGLINE, PLATFORM_VENDOR } from "../../config/branding";
import { usePublicOrganization } from "../../Utils/usePublicOrganization";

// This page renders BEFORE authentication. Which cooperative a visitor belongs to is therefore
// known only when the URL says so: `/o/{slug}/login` names one, plain `/login` does not.
//
// With a slug, the public branding endpoint supplies that cooperative's name and logo so the
// member can see whose login page they are on -- and the slug is passed to the forms, which send
// it as the `organization` field. Without one, the page stays neutral COOPR8 platform branding and
// says nothing about any particular cooperative; the backend then falls back to deriving the
// cooperative from the membership number's prefix.
const images = [
  {
    src: "https://res.cloudinary.com/ddyzfnmnk/image/upload/v1739675374/89614748-cbfb-4dbb-9629-a57f1d0383e4_lyonma.webp",
    title: "Your Trust, Our Commitment",
    description:
      "COOPR8 puts your cooperative's financial success first. Secure, fast, and reliable transactions at your fingertips.",
  },
  {
    src: "https://res.cloudinary.com/ddyzfnmnk/image/upload/v1739675275/bc4e579d-644f-4518-aebe-e5d12b087325_auqvus.webp",
    title: "Loans Made Simple",
    description:
      "Flexible loan management tailored to how your society actually works. No stress, just growth and opportunities.",
  },
  {
    src: "https://res.cloudinary.com/ddyzfnmnk/image/upload/v1739675309/1b832a8c-cf3b-4dad-998f-f60a12ab6458_xx3tfi.webp",
    title: "Save Smart, Build Wealth",
    description:
      "Help every member save consistently and watch your cooperative's financial future flourish.",
  },
];

const Authentication = () => {
  const location = useLocation();
  const { slug } = useParams();
  const { mode, toggle } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { organization, notFound } = usePublicOrganization(slug);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % images.length),
      7000
    );
    return () => clearInterval(interval);
  }, []);

  // Which form to show is decided by the end of the path, not an exact match, so the same
  // component serves /signup and /o/{slug}/signup.
  const path = location.pathname.replace(/\/+$/, "");
  const form = path.endsWith("/signup") ? (
    <SignUpForm organizationSlug={slug} />
  ) : path.endsWith("/forgot-password") ? (
    <ForgotPasswordForm organizationSlug={slug} />
  ) : (
    <SignInForm organizationSlug={slug} />
  );

  // A slug that no cooperative claims -- or one whose cooperative is suspended -- gets platform
  // branding, not a guess. `notFound` is also the reason nothing here says "this cooperative does
  // not exist": an unauthenticated visitor should not be able to probe which slugs are real.
  const loginPath = slug ? `/o/${slug}/login` : "/login";
  const showTenant = Boolean(organization?.name) && !notFound;

  // Set document title according to tenant branding and restore on unmount
  useEffect(() => {
    const originalTitle = document.title;
    if (showTenant && organization?.name) {
      const action = path.endsWith("/signup")
        ? "Sign Up"
        : path.endsWith("/forgot-password")
        ? "Reset Password"
        : "Sign In";
      document.title = `${organization.name} - ${action} | ${PLATFORM_NAME}`;
    }
    return () => {
      document.title = originalTitle;
    };
  }, [showTenant, organization?.name, path]);

  // If a tenant is active, brand the carousel slides with the cooperative name
  const tenantName = showTenant ? organization.name : null;
  const slideImages = images.map((image, index) => {
    if (!tenantName) return image;
    if (index === 0) {
      return {
        ...image,
        title: `Welcome to ${tenantName}`,
        description: `Secure, fast, and reliable cooperative services at your fingertips.`,
      };
    }
    if (index === 1) {
      return {
        ...image,
        title: "Loans Made Simple",
        description: `Flexible loan management tailored to how ${tenantName} operates.`,
      };
    }
    return {
      ...image,
      title: "Save Smart, Build Wealth",
      description: `Help every member save consistently and watch ${tenantName}'s financial future flourish.`,
    };
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Left Side Carousel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        {slideImages.map((image, index) => (
          <div
            key={index}
            className={`absolute w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {index === currentIndex && (
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="bg-gray-900 bg-opacity-90 p-8 rounded-xl shadow-lg text-center max-w-md">
                  <h2 className="text-2xl font-bold text-white">{image.title}</h2>
                  <p className="text-md text-gray-300 mt-2">{image.description}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right Side Form */}
      <div className="w-full lg:w-1/2 flex flex-col h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mt-5 mx-4 sm:mx-6">
          {showTenant ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Powered by</span>
              <Link
                to="/"
                className="font-bold italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-foreground hover:opacity-80"
              >
                {PLATFORM_NAME}
              </Link>
            </div>
          ) : (
            <Link to={loginPath}>
              <p className="text-2xl pr-1 font-bold italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-foreground relative">
                {PLATFORM_NAME}
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-primary to-foreground rounded-full" />
              </p>
            </Link>
          )}
          <div className="flex items-center gap-3">
            <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              <IconButton onClick={toggle} color="inherit" aria-label="Toggle dark mode">
                {mode === "dark" ? (
                  <LightModeOutlinedIcon fontSize="medium" />
                ) : (
                  <DarkModeOutlinedIcon fontSize="medium" />
                )}
              </IconButton>
            </Tooltip>
            <p className="text-sm text-muted-foreground text-right">
              Developed By:{" "}
              <a
                href="https://wa.me/2348101237991?text=Welcome%20to%20Invo%20Technology%20Limited,%20please%20feel%20free%20to%20make%20your%20enquiries.%0A%0AKindly%20provide%20your%20name%3A"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                {PLATFORM_VENDOR}
              </a>
            </p>
          </div>
        </div>

        {/* The cooperative named in the URL, if any -- otherwise the platform tagline. */}
        {showTenant ? (
          <div className="flex flex-col items-center mt-4 px-4 text-center">
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="h-16 max-w-[220px] object-contain mb-3"
                loading="lazy"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-primary">
                  {organization.name?.slice(0, 2)?.toUpperCase() || "CO"}
                </span>
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
              {organization.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {path.endsWith("/signup")
                ? "Create your member account"
                : path.endsWith("/forgot-password")
                ? "Reset your account password"
                : "Sign in to your cooperative"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center mt-4 px-4 text-center">
            <h1 className="text-xl sm:text-2xl font-bold tracking-normal text-muted-foreground font-serif italic">
              {PLATFORM_TAGLINE}
            </h1>
          </div>
        )}

        {/* Form */}
        <div className="flex-grow flex items-center justify-center">
          <div className="w-full px-6 md:px-[15%] pb-7">
            {form}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authentication;
