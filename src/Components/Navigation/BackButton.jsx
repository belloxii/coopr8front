import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Sends the user to the immediate previous page. Falls back to a supplied
// route (or the browser default) when there is no history to go back to,
// e.g. when a deeplink is opened directly in a fresh tab.
const BackButton = ({ fallback, label = "Back", className = "" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (fallback) {
      navigate(fallback);
    } else {
      navigate("/");
    }
  };

  return (
    <div className={`sticky top-20 z-30 mb-3 w-fit ${className}`}>
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-1 rounded-full border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-md transition hover:bg-muted"
      >
        <ArrowBackIcon fontSize="small" />
        {label}
      </button>
    </div>
  );
};

export default BackButton;
