import { PLATFORM_ATTRIBUTION } from "../config/branding";

/**
 * Branding for member-facing documents: PDF statements, receipts and Excel exports.
 *
 * A document belongs to the cooperative that produced it, so the organization's own name
 * heads every export and drives its filename. COOPR8 appears only as the small
 * "Powered by" attribution in the footer -- the platform never presents itself as the
 * author of a cooperative's statement, and no cooperative is hardcoded here.
 *
 * Pass `useOrganization()` values in; the hook already applies neutral fallbacks.
 */

/** "Ilorin Staff Coop" -> "ilorin-staff-coop", safe for a download filename. */
export const slugifyForFilename = (value) => {
  if (typeof value !== "string") return "";

  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
};

/**
 * Download name for an export, prefixed with the cooperative.
 *
 * @param {string} organizationName the signed-in organization's name
 * @param {string} base e.g. "savings-statement"
 * @param {string} extension e.g. "pdf" or "xlsx"
 */
export const exportFileName = (organizationName, base, extension) => {
  const slug = slugifyForFilename(organizationName);
  return `${slug ? `${slug}-` : ""}${base}.${extension}`;
};

/**
 * Writes the cooperative's letterhead and the document title onto a jsPDF document.
 *
 * @returns {number} the y coordinate at which to start writing document content
 */
export const drawDocumentHeader = (doc, { organizationName, organizationAddress, title }) => {
  let y = 14;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(organizationName || "", 14, y);

  if (organizationAddress) {
    y += 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(110);
    doc.text(organizationAddress, 14, y);
    doc.setTextColor(0);
  }

  y += 9;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, y);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  return y + 10;
};

/**
 * Stamps "Powered by COOPR8" and pagination on every page. Call last, after the tables
 * have been laid out, so the page count is final.
 */
export const drawPlatformFooter = (doc) => {
  const pageCount = doc.getNumberOfPages();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(130);
    doc.text(PLATFORM_ATTRIBUTION, 14, height - 8);
    doc.text(`Page ${page} of ${pageCount}`, width - 14, height - 8, { align: "right" });
    doc.setTextColor(0);
  }
};
