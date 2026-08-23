import { useOrganization } from "../../Utils/useOrganization";

/**
 * The signed-in cooperative's mark, for tenant surfaces (sidebar, header, dashboard).
 *
 * Resolution order, with no hardcoded cooperative anywhere:
 *   1. the organization's own logo image, when it has one
 *   2. the organization's name, rendered as a wordmark
 *   3. COOPR8, while branding is still loading or if the tenant is unknown
 *
 * @param {{ onClick?: function, className?: string, textClassName?: string, gradientClassName?: string }} props
 */
const OrgBrand = ({
  onClick,
  className = "",
  textClassName = "text-3xl",
  gradientClassName = "from-green-500 to-black dark:to-white",
}) => {
  const { name, logoUrl, isLoaded, platformName } = useOrganization();

  // Until the organization is known, present the platform rather than guessing a
  // cooperative or showing the neutral placeholder.
  const label = isLoaded ? name : platformName;

  return (
    <div
      className={`text-left ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      title={label}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={label}
          className="h-10 max-w-[160px] object-contain"
          loading="lazy"
        />
      ) : (
        <p
          className={`${textClassName} font-bold italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r ${gradientClassName} relative`}
        >
          {label}
          <span
            className={`absolute -bottom-1 left-0 w-28 h-1 bg-gradient-to-r ${gradientClassName} rounded-full`}
          ></span>
        </p>
      )}
    </div>
  );
};

export default OrgBrand;
