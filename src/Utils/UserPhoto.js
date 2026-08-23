import { Avatar } from "@mui/material";

/**
 * Renders a user's photo when a link is present, otherwise falls back to an
 * initials avatar. Used in member lists and profile headers so uploaded
 * passports show as real images instead of the generic avatar placeholder.
 * Handles both direct image URLs and Google Drive share links.
 */

// Convert Google Drive share link to direct image URL
const convertGoogleDriveUrl = (url) => {
  if (!url) return null;

  // Match Google Drive share links: https://drive.google.com/file/d/{FILE_ID}/view
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  // Match Google Drive open links: https://drive.google.com/open?id={FILE_ID}
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch) {
    const fileId = openMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  // Return original URL if not a Google Drive link
  return url;
};

const UserPhoto = ({ src, name = "", size = 40, className = "", ring = false }) => {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") || null;

  const ringClass = ring ? "ring-2 ring-border" : "";

  // Convert Google Drive links to direct image URLs
  const imageUrl = convertGoogleDriveUrl(src);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name || "user"}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover ${ringClass} ${className}`}
      />
    );
  }

  return (
    <Avatar alt={name} className={className} sx={{ width: size, height: size }}>
      {initials || "🧑"}
    </Avatar>
  );
};

export default UserPhoto;
