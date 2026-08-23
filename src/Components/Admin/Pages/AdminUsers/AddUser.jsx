import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addMultiUsers, getAllUsers } from "../../../../Store/Admin/Action";
import { regUser } from "../../../../Store/Auth/Action";
import { API_BASE_URL } from "../../../../config/api";
import BackButton from "../../../Navigation/BackButton";
import { useOrganization } from "../../../../Utils/useOrganization";
import { exportFileName } from "../../../../Utils/exportBranding";

// ---------------------------------------------------------------------------
// Field definitions — single source of truth for the single-user form, the
// template, and the header validation. `paymentType` distinguishes TESCOM staff
// (GOVERNMENT — salary deduction, no online payment) from SELF_PAY members.
// ---------------------------------------------------------------------------
const GENDER_OPTIONS = ["male", "female"];
const MARITAL_OPTIONS = ["Single", "Married", "Divorced", "Widowed"];
const PAYMENT_TYPE_OPTIONS = [
  { value: "GOVERNMENT", label: "TESCOM staff (salary deduction)" },
  { value: "SELF_PAY", label: "Self-pay (transfer / payment gateway)" },
];

const FIELD_GROUPS = [
  {
    title: "Personal information",
    fields: [
      { key: "firstName", label: "First name", required: true },
      { key: "middleName", label: "Middle name" },
      { key: "lastName", label: "Last name", required: true },
      { key: "gender", label: "Gender", required: true, type: "select", options: GENDER_OPTIONS, placeholder: "Select gender" },
      { key: "marital", label: "Marital status", type: "select", options: MARITAL_OPTIONS },
    ],
  },
  {
    title: "Contact",
    fields: [
      { key: "email", label: "Email", required: true, type: "email" },
      { key: "phone", label: "Phone", required: true },
      { key: "address", label: "Residential address", required: true },
      { key: "homeTown", label: "Home town" },
      { key: "lga", label: "LGA" },
      { key: "state", label: "State" },
      { key: "station", label: "Station" },
    ],
  },
  {
    title: "Identification & payment",
    fields: [
      {
        key: "paymentType",
        label: "Payment type",
        required: true,
        type: "select",
        options: PAYMENT_TYPE_OPTIONS,
      },
      { key: "psn", label: "PSN (required for TESCOM staff)" },
      { key: "verNo", label: "Verification number" },
      { key: "occupation", label: "Occupation" },
    ],
  },
  {
    title: "Financial plans",
    fields: [
      { key: "savingPlan", label: "Monthly saving plan (₦)", required: true, type: "number" },
      { key: "specialSavingPlan", label: "Special saving plan (₦)", type: "number" },
      { key: "sharePlan", label: "Share plan (₦)", type: "number" },
    ],
  },
  {
    title: "Next of kin",
    fields: [
      { key: "nextOfKin", label: "Next of kin" },
      { key: "nextOfKinRelationship", label: "Relationship" },
      { key: "nextOfKinAddress", label: "Address" },
      { key: "nextOfKinPhone", label: "Phone" },
    ],
  },
];

const ALL_FIELDS = FIELD_GROUPS.flatMap((group) => group.fields);

const REQUIRED_HEADERS = ["firstName", "lastName", "gender", "email", "phone", "address", "savingPlan"];
const SUPPORTED_HEADERS = [
  "firstName", "middleName", "lastName", "gender", "marital", "occupation", "email", "phone", "address",
  "psn", "verNo", "station", "homeTown", "state", "lga", "passport", "paymentType", "savingPlan",
  "specialSavingPlan", "sharePlan", "nextOfKin", "nextOfKinRelationship", "nextOfKinAddress",
  "nextOfKinPhone",
];

const emptySingleUser = Object.fromEntries(
  ALL_FIELDS.map((field) => [field.key, field.key === "paymentType" ? "GOVERNMENT" : ""])
);

// Canonical button style (green rounded-full pill) reused across this screen.
const PRIMARY_BTN =
  "rounded-full bg-green-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50";
const OUTLINE_BTN =
  "rounded-full border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-950/40";

const text = (value) => (value == null ? "" : String(value).trim());

// ---------------------------------------------------------------------------
// Header normalisation — maps messy/aliased column names to canonical headers.
// ---------------------------------------------------------------------------
const HEADER_ALIASES = {
  firstname: "firstName", fname: "firstName", givenname: "firstName",
  middlename: "middleName", othername: "middleName", othernames: "middleName",
  lastname: "lastName", surname: "lastName", familyname: "lastName",
  gender: "gender", sex: "gender",
  marital: "marital", maritalstatus: "marital",
  occupation: "occupation", job: "occupation", profession: "occupation", work: "occupation",
  email: "email", emailaddress: "email", mail: "email",
  phone: "phone", phonenumber: "phone", mobile: "phone", mobilenumber: "phone", tel: "phone", gsm: "phone", msisdn: "phone",
  address: "address", residentialaddress: "address", homeaddress: "address", contactaddress: "address",
  psn: "psn", pensionnumber: "psn", payroll: "psn", payrollnumber: "psn", staffnumber: "psn",
  verno: "verNo", verificationnumber: "verNo", ippisverificationnumber: "verNo",
  station: "station", office: "station", posting: "station", dutystation: "station",
  hometown: "homeTown", town: "homeTown",
  state: "state", stateoforigin: "state",
  lga: "lga", localgovernment: "lga", localgovernmentarea: "lga",
  passport: "passport", photo: "passport", picture: "passport", image: "passport", passporturl: "passport", passportphotograph: "passport",
  paymenttype: "paymentType", paymentmethod: "paymentType", membertype: "paymentType", category: "paymentType",
  areyouatescomstaff: "paymentType", tescomstaff: "paymentType", tescom: "paymentType",
  savingplan: "savingPlan", monthlysaving: "savingPlan", monthlysavings: "savingPlan", monthlysavingplan: "savingPlan", monthlysavingsplan: "savingPlan", savings: "savingPlan", tsaving: "savingPlan", tsavings: "savingPlan",
  specialsavingplan: "specialSavingPlan", specialsaving: "specialSavingPlan", specialsavings: "specialSavingPlan",
  shareplan: "sharePlan", sharesplan: "sharePlan", shares: "sharePlan", share: "sharePlan",
  nextofkin: "nextOfKin", kin: "nextOfKin", nok: "nextOfKin",
  nextofkinrelationship: "nextOfKinRelationship", kinrelationship: "nextOfKinRelationship", relationship: "nextOfKinRelationship",
  nextofkinaddress: "nextOfKinAddress", kinaddress: "nextOfKinAddress",
  nextofkinphone: "nextOfKinPhone", kinphone: "nextOfKinPhone", nextofkinphonenumber: "nextOfKinPhone",
};

const normalizeKey = (value) => text(value).toLowerCase().replace(/[^a-z0-9]/g, "");

const mapHeader = (header) => {
  const key = normalizeKey(header);
  if (!key) return null;
  if (SUPPORTED_HEADERS.some((h) => h.toLowerCase() === key)) {
    return SUPPORTED_HEADERS.find((h) => h.toLowerCase() === key);
  }
  return HEADER_ALIASES[key] || null;
};

// Coerce a messy paymentType value to GOVERNMENT / SELF_PAY.
const normalizePaymentType = (value) => {
  const key = normalizeKey(value);
  if (!key) return "SELF_PAY";
  // "yes"/"true" come from the "Are you a TESCOM staff?" form question → salary deduction.
  if (["government", "gov", "govt", "salary", "salarydeduction", "psn", "civilservant", "yes", "true"].includes(key)) return "GOVERNMENT";
  return "SELF_PAY";
};

function validateRows(rows) {
  const emails = new Set();
  const phones = new Set();
  return rows.map(({ rowNumber, user }) => {
    const errors = [];
    REQUIRED_HEADERS.forEach((header) => {
      if (!text(user[header])) errors.push(`${header} is required`);
    });
    if (user.email && !/^\S+@\S+\.\S+$/.test(text(user.email))) errors.push("email must be valid");
    if (user.savingPlan && (!Number.isFinite(Number(user.savingPlan)) || Number(user.savingPlan) <= 0)) errors.push("savingPlan must be greater than zero");
    if (user.paymentType && !["GOVERNMENT", "SELF_PAY"].includes(text(user.paymentType))) errors.push("paymentType must be GOVERNMENT or SELF_PAY");
    if (text(user.paymentType) === "GOVERNMENT" && !text(user.psn)) errors.push("psn is required for TESCOM staff");
    const email = text(user.email).toLowerCase();
    const phone = text(user.phone).toLowerCase();
    if (email && emails.has(email)) errors.push("duplicate email in this spreadsheet");
    if (phone && phones.has(phone)) errors.push("duplicate phone number in this spreadsheet");
    emails.add(email);
    phones.add(phone);
    return { rowNumber, user, errors };
  });
}

// ---------------------------------------------------------------------------
// Hardcopy form scanning (Gemini vision, server-side). A scanned/photographed
// membership form is downscaled in the browser first — this caps the upload
// size and per-scan cost, and guarantees the backend receives a JPEG ImageIO
// can decode — then POSTed to the admin scan endpoint, which returns the
// member fields keyed by the same column names the form/template already use.
// ---------------------------------------------------------------------------
const SCAN_MAX_EDGE = 2200; // px on the long edge — small enough to be cheap, large enough to keep handwriting legible
const SCAN_JPEG_QUALITY = 0.85;
const SCAN_MAX_FORMS = 200; // matches the batch-import ceiling

// Whether a picked file is an image we can scan. A folder pick (webkitdirectory)
// surfaces every file, and browsers — especially on Windows — often report an
// empty `type` for a perfectly good JPG/PNG when the registry MIME association is
// missing, so fall back to matching the file extension. Keep this in step with the
// formats Gemini + the backend accept.
const IMAGE_EXT = /\.(jpe?g|png|webp|heic|heif|bmp|tiff?)$/i;
const isImageFile = (f) =>
  (f.type && f.type.startsWith("image/")) || IMAGE_EXT.test(f.name || "");

// Draw the image onto a canvas capped at SCAN_MAX_EDGE and export a JPEG blob.
const downscaleToJpeg = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, SCAN_MAX_EDGE / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("The image could not be processed."))),
        "image/jpeg",
        SCAN_JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The file is not a readable image."));
    };
    img.src = url;
  });

// POST one downscaled form image to the admin scan endpoint. Uses bare axios (not
// the shared `api` instance, which forces application/json and would break the
// multipart upload) with a manual Bearer token. Returns { fields, passport,
// passportDetected, note }.
const scanFormImage = async (file) => {
  const blob = await downscaleToJpeg(file);
  const form = new FormData();
  form.append("file", blob, "form.jpg");
  const response = await axios.post(`${API_BASE_URL}/api/admin/forms/scan`, form, {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  });
  return response.data;
};

// The scan endpoint returns plain-string error bodies; surface them cleanly.
const scanErrorMessage = (error) => {  const data = error.response?.data;
  if (typeof data === "string" && data) return data;
  if (data?.message) return data.message;
  if ([401, 403].includes(error.response?.status)) return "Your session has expired — sign in as an admin again.";
  return error.message || "The form could not be scanned.";
};

// Human-friendly stage label for the single-scan progress bar, derived from the
// faux-progress percentage so the wait reads as distinct steps.
const scanStageLabel = (pct) =>
  pct >= 100
    ? "Done"
    : pct > 70
    ? "Cropping the passport photo…"
    : pct > 35
    ? "Reading the fields…"
    : "Uploading the form…";

// Overlay scanned fields onto a blank single-user form, coercing the enumerated
// fields (gender / marital / paymentType) to the exact option values the selects
// expect so the dropdowns show the scanned value instead of falling back blank.
const applyScanToSingle = (fields) => {
  const next = { ...emptySingleUser };
  Object.entries(fields || {}).forEach(([key, value]) => {
    if (key in next && text(value)) next[key] = text(value);
  });
  if (next.gender) {
    const g = next.gender.toLowerCase();
    next.gender = GENDER_OPTIONS.includes(g) ? g : "";
  }
  if (next.marital) {
    const m = MARITAL_OPTIONS.find((o) => o.toLowerCase() === next.marital.toLowerCase());
    next.marital = m || "";
  }
  next.paymentType = normalizePaymentType(next.paymentType);
  // Keep PSN / Occupation consistent with the payment type (mirrors setSingleField).
  if (next.paymentType === "GOVERNMENT") next.occupation = "";
  else next.psn = "";
  return next;
};

export default function AddUser() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("single");

  // Downloads carrying this cooperative's data are named after it.
  const { name: orgName } = useOrganization();
  const [singleUser, setSingleUser] = useState(emptySingleUser);
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState("");
  const [passportFile, setPassportFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploadPhase, setUploadPhase] = useState("idle"); // idle | uploading | processing
  const [submittedCount, setSubmittedCount] = useState(0);
  const [result, setResult] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const uploadPhaseRef = useRef("idle");

  // Normalize tab state
  const [normFileName, setNormFileName] = useState("");
  const [normError, setNormError] = useState("");
  const [normMapping, setNormMapping] = useState([]); // [{ original, mapped }]
  const [normRows, setNormRows] = useState([]); // [{ rowNumber, user }]

  // Single-tab hardcopy scan state
  const [scanLoading, setScanLoading] = useState(false);
  const [scanPct, setScanPct] = useState(0); // 0 = hidden; drives the scan progress bar
  const [scanError, setScanError] = useState("");
  const [scanNote, setScanNote] = useState("");
  const [scannedPassport, setScannedPassport] = useState(""); // Cloudinary URL from the scan
  const scanInputRef = useRef(null);
  const scanCameraRef = useRef(null);
  const scanTimerRef = useRef(null);

  // Stop the faux-progress ticker if the user navigates away mid-scan.
  useEffect(() => () => clearInterval(scanTimerRef.current), []);

  // Forms → Excel tab state
  const [formsScanning, setFormsScanning] = useState(false);
  const [formsProgress, setFormsProgress] = useState({ done: 0, total: 0 });
  const [formsRows, setFormsRows] = useState([]); // [{ rowNumber, user }]
  const [formsErrors, setFormsErrors] = useState([]); // [{ name, message }]
  const [formsError, setFormsError] = useState("");

  const validatedRows = useMemo(() => validateRows(rows), [rows]);
  const invalidRows = validatedRows.filter((row) => row.errors.length > 0);
  const validRows = validatedRows.filter((row) => row.errors.length === 0);

  const setSingleField = (key, value) =>
    setSingleUser((current) => {
      const next = { ...current, [key]: value };
      // PSN and Occupation are mutually exclusive: TESCOM staff (GOVERNMENT) use
      // a PSN, self-pay members use an Occupation. Clear the now-hidden field so a
      // stale value from the other branch isn't submitted.
      if (key === "paymentType") {
        if (value === "GOVERNMENT") next.occupation = "";
        else next.psn = "";
      }
      return next;
    });

  // -----------------------------------------------------------------------
  // Template — accurate sample rows covering both payment types.
  // -----------------------------------------------------------------------
  const downloadTemplate = () => {
    const sampleRows = [
      {
        firstName: "John", middleName: "A.", lastName: "Smith", gender: "male",
        marital: "Single", email: "john.smith@example.com", phone: "08011131111", address: "12 Palm Street",
        psn: "PSN001", verNo: "VER001", station: "Station A", homeTown: "Ibadan", state: "Oyo", lga: "Ibadan North",
        passport: "", paymentType: "GOVERNMENT", savingPlan: 10000, specialSavingPlan: 2000, sharePlan: 5000,
        nextOfKin: "Jane Smith", nextOfKinRelationship: "Spouse", nextOfKinAddress: "12 Palm Street",
        nextOfKinPhone: "08022222222",
      },
      {
        firstName: "Grace", middleName: "", lastName: "Okoro", gender: "female",
        marital: "Married", email: "grace.okoro@example.com", phone: "08055551212", address: "5 Unity Road",
        psn: "", verNo: "", station: "", homeTown: "Enugu", state: "Enugu", lga: "Enugu East",
        passport: "", paymentType: "SELF_PAY", savingPlan: 15000, specialSavingPlan: 0, sharePlan: 0,
        nextOfKin: "Emeka Okoro", nextOfKinRelationship: "Brother", nextOfKinAddress: "5 Unity Road",
        nextOfKinPhone: "08066666666",
      },
    ];
    // Force the canonical column order so the header row matches SUPPORTED_HEADERS.
    const worksheet = XLSX.utils.json_to_sheet(sampleRows, { header: SUPPORTED_HEADERS });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    // A blank template is a platform artifact (it defines the import contract), so it
    // carries no cooperative's name.
    XLSX.writeFile(workbook, "member-import-template.xlsx");
  };

  const readSheet = (file, onSheet) => {
    const reader = new FileReader();
    reader.onerror = () => onSheet(null, "The spreadsheet could not be read.");
    reader.onload = (loadEvent) => {
      try {
        const workbook = XLSX.read(new Uint8Array(loadEvent.target.result), { type: "array", cellDates: false });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!sheet) throw new Error("The workbook has no worksheet.");
        onSheet(sheet, null);
      } catch (error) {
        onSheet(null, error.message || "The spreadsheet could not be processed.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // -----------------------------------------------------------------------
  // Batch import tab — strict headers.
  // -----------------------------------------------------------------------
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    setFileError("");
    setResult(null);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setFileError("The spreadsheet must be 5 MB or smaller.");
    setFileName(file.name);
    readSheet(file, (sheet, error) => {
      if (error) { setRows([]); return setFileError(error); }
      try {
        const headerRow = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false })[0] || [];
        const headers = headerRow.map((value) => text(value).replace(/^﻿/, ""));
        const missing = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
        const unsupported = headers.filter((header) => header && !SUPPORTED_HEADERS.includes(header));
        if (missing.length || unsupported.length) {
          const messages = [];
          if (missing.length) messages.push(`Missing required columns: ${missing.join(", ")}.`);
          if (unsupported.length) messages.push(`Unsupported columns: ${unsupported.join(", ")}. Use the Normalize file tab to clean it, or download the current template.`);
          throw new Error(messages.join(" "));
        }
        const data = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false, blankrows: false });
        if (!data.length) throw new Error("The spreadsheet contains no users.");
        if (data.length > 200) throw new Error("A batch may contain at most 200 users.");
        setRows(data.map((source, index) => ({
          rowNumber: index + 2,
          user: Object.fromEntries(SUPPORTED_HEADERS.map((header) => [header, text(source[header])])),
        })));
      } catch (err) {
        setRows([]);
        setFileError(err.message || "The spreadsheet could not be processed.");
      }
    });
  };

  const handleBulkSubmit = async () => {
    if (!validRows.length || invalidRows.length) return;
    const total = validRows.length;
    setIsUploading(true);
    setResult(null);
    setUploadPct(0);
    setSubmittedCount(total);
    setUploadPhase("uploading");
    uploadPhaseRef.current = "uploading";

    try {
      const response = await dispatch(
        addMultiUsers(
          validRows.map(({ rowNumber, user }) => ({ rowNumber, user })),
          {
            onUploadProgress: (progress) => {
              const pct = progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0;
              setUploadPct(pct);
              // Once every byte is sent, the server creates the members in a
              // single request with no per-row events — there is no honest
              // percentage left to show, so switch to the indeterminate bar.
              if (pct >= 100 && uploadPhaseRef.current !== "processing") {
                setUploadPhase("processing");
                uploadPhaseRef.current = "processing";
              }
            },
          }
        )
      );
      setUploadPct(100);
      setUploadPhase("idle");
      uploadPhaseRef.current = "idle";
      setResult(response);
      setShowSuccess(true);
      await dispatch(getAllUsers());
    } catch (error) {
      setUploadPhase("idle");
      uploadPhaseRef.current = "idle";
      setFileError(error.response?.data?.message || error.response?.data?.detail || "The batch could not be submitted. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // -----------------------------------------------------------------------
  // Single user tab — hardcopy scan.
  // -----------------------------------------------------------------------
  // Scan a photographed/scanned form: prefill every recognised field and, if a
  // passport photo was found, keep its uploaded Cloudinary URL for submission.
  const handleScanForm = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!isImageFile(file)) return setScanError("Please choose an image of the form (JPG, PNG, WEBP or HEIC).");
    setScanError("");
    setScanNote("");
    setScanLoading(true);
    // Faux progress: the scan is one opaque round-trip we can't measure, so ease the
    // bar toward ~92% while it runs, then snap to 100% when the result lands. Motion
    // without pretending to know real progress. The step shrinks as it climbs, so it
    // glides in and never stalls at the top.
    setScanPct(8);
    clearInterval(scanTimerRef.current);
    scanTimerRef.current = setInterval(() => {
      setScanPct((p) => (p >= 92 ? p : p + Math.max(1, Math.round((92 - p) / 12))));
    }, 400);
    try {
      const data = await scanFormImage(file);
      setSingleUser(applyScanToSingle(data.fields));
      setPassportFile(null); // a manual pick would override the scanned passport; start clean
      setScannedPassport(data.passport || "");
      if (data.note) setScanNote(data.note);
      else if (!data.passportDetected) setScanNote("No passport photo was detected on the form — add one below if you have it.");
    } catch (error) {
      setScanError(scanErrorMessage(error));
    } finally {
      clearInterval(scanTimerRef.current);
      setScanPct(100); // complete the bar before it fades
      setScanLoading(false);
      setTimeout(() => setScanPct(0), 600);
    }
  };

  // -----------------------------------------------------------------------
  // Single user tab.
  // -----------------------------------------------------------------------
  // Returns a specific validation message, or "" when the form is ready. Being
  // specific matters: previously every failure blamed a missing PSN even when
  // the real problem was, say, the email or savings plan.
  const singleFormError = () => {
    for (const field of ALL_FIELDS) {
      if (field.required && !text(singleUser[field.key])) return `${field.label} is required.`;
    }
    if (!/^\S+@\S+\.\S+$/.test(text(singleUser.email))) return "Enter a valid email address.";
    if (!(Number(singleUser.savingPlan) > 0)) return "Monthly saving plan must be greater than zero.";
    if (singleUser.paymentType === "GOVERNMENT" && !text(singleUser.psn)) return "PSN is required for TESCOM staff (salary deduction).";
    return "";
  };

  // Optional passport photo. Validate on selection so the user sees the problem
  // immediately rather than at submit time.
  const selectPassport = (event) => {
    const file = event.target.files?.[0];
    setSingleError("");
    if (!file) return setPassportFile(null);
    if (!isImageFile(file)) {
      event.target.value = "";
      return setSingleError("Passport must be an image file.");
    }
    if (file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      return setSingleError("Passport image must be 5 MB or less.");
    }
    setPassportFile(file);
  };

  const uploadPassport = async () => {
    const uploadData = new FormData();
    uploadData.append("image", passportFile);
    const response = await axios.post(`${API_BASE_URL}/api/images/upload`, uploadData);
    if (!response.data?.url) throw new Error("Passport upload did not return an image URL.");
    return response.data.url;
  };

  const handleSingleSubmit = async (event) => {
    event.preventDefault();
    setSingleError("");
    const validationError = singleFormError();
    if (validationError) {
      setSingleError(validationError);
      return;
    }
    setSingleLoading(true);
    try {
      // Strip blank optionals so the backend keeps its own defaults.
      const payload = Object.fromEntries(
        Object.entries(singleUser).filter(([, value]) => text(value) !== "")
      );
      payload.savingPlan = Number(singleUser.savingPlan);
      if (text(singleUser.specialSavingPlan)) payload.specialSavingPlan = Number(singleUser.specialSavingPlan);
      if (text(singleUser.sharePlan)) payload.sharePlan = Number(singleUser.sharePlan);

      // Passport: a manually chosen file wins; otherwise use the photo the scan
      // already cropped and uploaded to Cloudinary.
      if (passportFile) payload.passport = await uploadPassport();
      else if (scannedPassport) payload.passport = scannedPassport;

      const response = await dispatch(regUser(payload));
      const created = response?.responseCode === "100";
      setResult({
        totalRows: 1,
        createdCount: created ? 1 : 0,
        rejectedCount: created ? 0 : 1,
        results: [{
          rowNumber: 1, email: singleUser.email, created,
          responseCode: response?.responseCode, message: response?.responseMessage || "No response from server.",
          ledgerId: response?.user?.ledgerID,
        }],
      });
      if (created) {
        setSingleUser(emptySingleUser);
        setPassportFile(null);
        setScannedPassport("");
        setScanNote("");
      }
    } catch (error) {
      setSingleError(error.response?.data?.message || error.message || "The member could not be created.");
    } finally {
      setSingleLoading(false);
    }
  };

  // -----------------------------------------------------------------------
  // Normalize file tab.
  // -----------------------------------------------------------------------
  const handleNormalizeUpload = (event) => {
    const file = event.target.files?.[0];
    setNormError("");
    setNormMapping([]);
    setNormRows([]);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setNormError("The spreadsheet must be 5 MB or smaller.");
    setNormFileName(file.name);
    readSheet(file, (sheet, error) => {
      if (error) return setNormError(error);
      try {
        const headerRow = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false })[0] || [];
        const originals = headerRow.map((value) => text(value).replace(/^﻿/, "")).filter(Boolean);
        const mapping = originals.map((original) => ({ original, mapped: mapHeader(original) }));
        setNormMapping(mapping);

        const data = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false, blankrows: false });
        if (!data.length) throw new Error("The spreadsheet contains no data rows.");
        if (data.length > 200) throw new Error("A batch may contain at most 200 users.");

        const built = data.map((source, index) => {
          const user = Object.fromEntries(SUPPORTED_HEADERS.map((header) => [header, ""]));
          Object.entries(source).forEach(([rawKey, value]) => {
            const mapped = mapHeader(rawKey);
            if (mapped) user[mapped] = text(value);
          });
          user.paymentType = normalizePaymentType(user.paymentType);
          return { rowNumber: index + 2, user };
        });
        setNormRows(built);
      } catch (err) {
        setNormMapping([]);
        setNormRows([]);
        setNormError(err.message || "The spreadsheet could not be processed.");
      }
    });
  };

  const downloadNormalized = () => {
    if (!normRows.length) return;
    const worksheet = XLSX.utils.json_to_sheet(
      normRows.map(({ user }) => Object.fromEntries(SUPPORTED_HEADERS.map((h) => [h, user[h]]))),
      { header: SUPPORTED_HEADERS }
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, exportFileName(orgName, "member-import-normalized", "xlsx"));
  };

  const sendNormalizedToBatch = () => {
    if (!normRows.length) return;
    setRows(normRows.map(({ rowNumber, user }, index) => ({ rowNumber: index + 2, user })));
    setFileName("normalized file");
    setFileError("");
    setResult(null);
    setActiveTab("bulk");
  };

  const unmappedCount = normMapping.filter((m) => !m.mapped).length;

  // -----------------------------------------------------------------------
  // Forms → Excel tab — scan a folder (or selection) of hardcopy forms into an
  // uploadable batch: each form's fields become a row and its passport photo is
  // cropped, uploaded to Cloudinary, and linked in the `passport` column.
  // -----------------------------------------------------------------------
  const scanForms = async (fileList) => {
    const selected = Array.from(fileList || []);
    const files = selected.filter(isImageFile);
    setFormsError("");
    setFormsRows([]);
    setFormsErrors([]);
    if (!files.length) {
      const hadPdf = selected.some((f) => /\.pdf$/i.test(f.name || "") || f.type === "application/pdf");
      return setFormsError(
        selected.length
          ? `None of the ${selected.length} selected file${selected.length === 1 ? "" : "s"} look like images.` +
              (hadPdf
                ? " PDFs aren't supported yet — export each form as a JPG or PNG first."
                : " Supported formats: JPG, PNG, WEBP, HEIC.")
          : "No files were selected."
      );
    }
    if (files.length > SCAN_MAX_FORMS) return setFormsError(`Select at most ${SCAN_MAX_FORMS} forms at a time.`);

    // Deterministic order so row numbers are stable regardless of scan finish order.
    files.sort((a, b) => a.name.localeCompare(b.name));
    setFormsScanning(true);
    setFormsProgress({ done: 0, total: files.length });

    const built = new Array(files.length);
    const failures = [];
    let done = 0;
    let cursor = 0;
    const CONCURRENCY = 2; // gentle on the free-tier per-minute quota; the backend retries any 429

    const worker = async () => {
      while (cursor < files.length) {
        const index = cursor++;
        const file = files[index];
        try {
          const data = await scanFormImage(file);
          const user = Object.fromEntries(SUPPORTED_HEADERS.map((h) => [h, text(data.fields?.[h])]));
          user.paymentType = normalizePaymentType(user.paymentType);
          if (data.passport) user.passport = data.passport;
          built[index] = user;
        } catch (error) {
          failures.push({ name: file.name, message: scanErrorMessage(error) });
        } finally {
          done += 1;
          setFormsProgress({ done, total: files.length });
        }
      }
    };

    try {
      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, files.length) }, worker));
      const rowsOut = built
        .filter(Boolean)
        .map((user, index) => ({ rowNumber: index + 2, user }));
      setFormsRows(rowsOut);
      setFormsErrors(failures);
      if (!rowsOut.length) setFormsError("None of the selected forms could be read.");
    } finally {
      setFormsScanning(false);
    }
  };

  const handleFormsSelected = (event) => {
    // Snapshot the File objects out of the live FileList BEFORE clearing the input:
    // event.target.files is not a copy, so clearing value first would empty it.
    const files = Array.from(event.target.files || []);
    event.target.value = ""; // allow re-selecting the same folder/files
    scanForms(files);
  };

  const downloadFormsExcel = () => {
    if (!formsRows.length) return;
    const worksheet = XLSX.utils.json_to_sheet(
      formsRows.map(({ user }) => Object.fromEntries(SUPPORTED_HEADERS.map((h) => [h, user[h]]))),
      { header: SUPPORTED_HEADERS }
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, exportFileName(orgName, "forms-to-excel", "xlsx"));
  };

  const sendFormsToBatch = () => {
    if (!formsRows.length) return;
    setRows(formsRows.map(({ user }, index) => ({ rowNumber: index + 2, user })));
    setFileName(`${formsRows.length} scanned form${formsRows.length === 1 ? "" : "s"}`);
    setFileError("");
    setResult(null);
    setActiveTab("bulk");
  };

  const downloadResults = () => {
    if (!result?.results?.length) return;
    const worksheet = XLSX.utils.json_to_sheet(result.results.map((row) => ({
      rowNumber: row.rowNumber, email: row.email, status: row.created ? "Created" : row.skipped ? "Skipped" : "Rejected", ledgerId: row.ledgerId || "", message: row.message,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Batch results");
    XLSX.writeFile(workbook, exportFileName(orgName, "member-import-results", "xlsx"));
  };

  const tabClass = (tab) =>
    `px-4 py-2 font-semibold ${activeTab === tab ? "border-b-2 border-green-700 text-green-700" : "text-muted-foreground"}`;

  // No-outline "modern feel": filled, borderless, shaded field with a green focus
  // ring instead of a border. bg-input (not bg-muted) so the fill is clearly
  // distinct from the white/dark card behind it. Matches the global MUI filled
  // style so raw HTML <input>/<select> here visually agree with the form modals.
  const inputClass =
    "w-full rounded-xl border-0 bg-input px-4 py-3 text-foreground outline-none transition focus:ring-2 focus:ring-green-600/50";

  const renderField = (field) => {
    // Conditional identity fields: TESCOM staff (GOVERNMENT) enter a PSN; self-pay
    // members enter an Occupation. Show only the one that applies.
    if (field.key === "psn" && singleUser.paymentType !== "GOVERNMENT") return null;
    if (field.key === "occupation" && singleUser.paymentType === "GOVERNMENT") return null;
    const value = singleUser[field.key];
    const common = { value, onChange: (e) => setSingleField(field.key, e.target.value), className: inputClass };
    if (field.type === "select") {
      return (
        <select key={field.key} {...common}>
          {(field.placeholder || !field.required) && (
            <option value="">{field.placeholder || field.label}</option>
          )}
          {field.options.map((opt) =>
            typeof opt === "string"
              ? <option key={opt} value={opt}>{opt}</option>
              : <option key={opt.value} value={opt.value}>{opt.label}</option>
          )}
        </select>
      );
    }
    return (
      <input
        key={field.key}
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "email" ? "email" : "text"}
        placeholder={`${field.label}${field.required ? " *" : ""}`}
        min={field.type === "number" ? "0" : undefined}
        {...common}
      />
    );
  };

  return (
    <div className="m-3 text-left bg-card">
      <BackButton />
      <div className="w-full space-y-5 rounded-2xl border bg-card p-5 shadow-xl md:p-7">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Member import</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create members one at a time, import up to 200 at once, or normalize a messy spreadsheet to fit the template.</p>
        </div>

        <div className="flex flex-wrap gap-3 border-b">
          <button onClick={() => setActiveTab("single")} className={tabClass("single")}>Single user</button>
          <button onClick={() => setActiveTab("bulk")} className={tabClass("bulk")}>Batch import</button>
          <button onClick={() => setActiveTab("normalize")} className={tabClass("normalize")}>Normalize file</button>
          <button onClick={() => setActiveTab("forms")} className={tabClass("forms")}>Forms → Excel</button>
        </div>

        {/* ---------------------------------------------------------------- Single */}
        {activeTab === "single" && (
          <form onSubmit={handleSingleSubmit} className="space-y-6">
            {/* Hardcopy scan — prefill the whole form from a photo/scan of the paper form. */}
            <fieldset className="space-y-3 rounded-xl bg-green-50 p-4 dark:bg-green-950/40">
              <legend className="px-1 text-sm font-bold uppercase tracking-wide text-green-800 dark:text-green-200">Scan a hardcopy form</legend>
              <p className="text-sm text-muted-foreground">
                Upload a photo/scan of a completed membership form, or take one with your camera. Its fields are read automatically and filled in below, and the passport photo is cropped and attached — review everything before saving.
              </p>
              <input ref={scanInputRef} type="file" accept="image/*" onChange={handleScanForm} className="hidden" />
              <input ref={scanCameraRef} type="file" accept="image/*" capture="environment" onChange={handleScanForm} className="hidden" />
              <div className="flex flex-wrap gap-3">
                <button type="button" disabled={scanLoading} onClick={() => scanInputRef.current?.click()} className={OUTLINE_BTN}>
                  {scanLoading ? "Reading form…" : "Upload form image"}
                </button>
                <button type="button" disabled={scanLoading} onClick={() => scanCameraRef.current?.click()} className={OUTLINE_BTN}>
                  Use camera
                </button>
              </div>
              {scanPct > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm font-semibold text-foreground">
                    <span>{scanStageLabel(scanPct)}</span>
                    <span>{scanPct}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-green-600 transition-all duration-300 ease-out"
                      style={{ width: `${scanPct}%` }}
                    />
                  </div>
                </div>
              )}
              {scanError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{scanError}</p>}
              {scanNote && !scanError && <p className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-200">{scanNote}</p>}
              {scannedPassport && !passportFile && (
                <div className="flex items-center gap-3">
                  <img src={scannedPassport} alt="Scanned passport" className="h-20 w-20 rounded-lg object-cover" />
                  <p className="text-sm text-muted-foreground">Passport photo detected and attached.</p>
                </div>
              )}
            </fieldset>
            {FIELD_GROUPS.map((group) => (
              <fieldset key={group.title} className="space-y-3">
                <legend className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{group.title}</legend>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {group.fields.map(renderField)}
                </div>
              </fieldset>
            ))}
            <fieldset className="space-y-3">
              <legend className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Passport photo (optional)</legend>
              <input
                type="file"
                accept="image/*"
                onChange={selectPassport}
                className="block w-full rounded-xl border-0 bg-input px-4 py-3 text-foreground outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-green-600 file:px-4 file:py-2 file:font-semibold file:text-white focus:ring-2 focus:ring-green-600/50"
              />
              {passportFile && <p className="text-sm text-muted-foreground">Selected: {passportFile.name}</p>}
            </fieldset>
            {singleUser.paymentType === "GOVERNMENT" && (
              <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-200">
                TESCOM staff pay via salary deduction — PSN is required and online payment is disabled for them.
              </p>
            )}
            {singleError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{singleError}</p>}
            <button type="submit" disabled={singleLoading} className={`${PRIMARY_BTN} w-full`}>
              {singleLoading ? "Creating…" : "Create member"}
            </button>
          </form>
        )}

        {/* ---------------------------------------------------------------- Bulk */}
        {activeTab === "bulk" && (
          <>
            <div className="flex flex-col gap-3 rounded-xl bg-green-50 p-4 text-green-900 dark:bg-green-950/40 dark:text-green-100 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Use the current template</p>
                <p className="text-sm text-muted-foreground">Required: {REQUIRED_HEADERS.join(", ")}. Optional includes paymentType (GOVERNMENT / SELF_PAY).</p>
              </div>
              <button onClick={downloadTemplate} className={PRIMARY_BTN}>Download template</button>
            </div>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="block w-full rounded-xl border-0 bg-input px-4 py-3 text-foreground outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-green-600 file:px-4 file:py-2 file:font-semibold file:text-white focus:ring-2 focus:ring-green-600/50" />
            {fileName && <p className="text-sm text-muted-foreground">Selected: {fileName}</p>}
            {fileError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{fileError}</p>}
            {rows.length > 0 && (
              <>
                <div className="rounded-lg border p-4">
                  <p className="font-semibold">Preflight check</p>
                  <p className="text-sm text-muted-foreground">{validRows.length} valid of {rows.length} rows. {invalidRows.length ? "Correct the highlighted rows before submission." : "All rows are ready to submit."}</p>
                </div>
                <div className="max-h-64 overflow-auto rounded-lg border">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-muted"><tr><th className="p-2 text-left">Row</th><th className="p-2 text-left">Name</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Type</th><th className="p-2 text-left">Validation</th></tr></thead>
                    <tbody>
                      {validatedRows.map((row) => (
                        <tr key={row.rowNumber} className={row.errors.length ? "bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200" : ""}>
                          <td className="p-2">{row.rowNumber}</td>
                          <td className="p-2">{row.user.firstName} {row.user.lastName}</td>
                          <td className="p-2">{row.user.email}</td>
                          <td className="p-2">{row.user.paymentType || "SELF_PAY"}</td>
                          <td className="p-2">{row.errors.length ? row.errors.join("; ") : "Ready"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {isUploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-semibold text-foreground">
                      <span>{uploadPhase === "processing" ? `Creating ${submittedCount} member${submittedCount === 1 ? "" : "s"}…` : "Uploading file…"}</span>
                      <span>{uploadPhase === "processing" ? "Please wait" : `${uploadPct}%`}</span>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                      {uploadPhase === "processing" ? (
                        <div className="animate-indeterminate absolute inset-y-0 left-0 w-1/3 rounded-full bg-green-600" />
                      ) : (
                        <div
                          className="h-full rounded-full bg-green-600 transition-all duration-300"
                          style={{ width: `${uploadPct}%` }}
                        />
                      )}
                    </div>
                  </div>
                )}
                <button disabled={isUploading || invalidRows.length > 0} onClick={handleBulkSubmit} className={`${PRIMARY_BTN} w-full`}>
                  {isUploading ? "Importing…" : `Import ${validRows.length} members`}
                </button>
              </>
            )}
          </>
        )}

        {/* ---------------------------------------------------------------- Normalize */}
        {activeTab === "normalize" && (
          <>
            <div className="rounded-xl bg-green-50 p-4 text-green-900 dark:bg-green-950/40 dark:text-green-100">
              <p className="font-semibold">Normalize an uploaded file</p>
              <p className="text-sm text-muted-foreground">Upload a spreadsheet with differently-named columns (e.g. "Surname", "Phone Number"). We map them to the required template, then you can download the cleaned file or send it straight to the batch importer.</p>
            </div>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleNormalizeUpload} className="block w-full rounded-xl border-0 bg-input px-4 py-3 text-foreground outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-green-600 file:px-4 file:py-2 file:font-semibold file:text-white focus:ring-2 focus:ring-green-600/50" />
            {normFileName && <p className="text-sm text-muted-foreground">Selected: {normFileName}</p>}
            {normError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{normError}</p>}

            {normMapping.length > 0 && (
              <div className="rounded-lg border p-4">
                <p className="font-semibold">Column mapping</p>
                <p className="mb-2 text-sm text-muted-foreground">{normMapping.length - unmappedCount} of {normMapping.length} columns matched.{unmappedCount ? ` ${unmappedCount} unmatched column(s) will be ignored.` : ""}</p>
                <div className="flex flex-wrap gap-2">
                  {normMapping.map((m, i) => (
                    <span key={i} className={`rounded-full px-3 py-1 text-xs font-semibold ${m.mapped ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" : "bg-muted text-muted-foreground line-through"}`}>
                      {m.original}{m.mapped ? ` → ${m.mapped}` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {normRows.length > 0 && (
              <>
                <div className="max-h-64 overflow-auto rounded-lg border">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-muted"><tr><th className="p-2 text-left">Row</th><th className="p-2 text-left">Name</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Type</th><th className="p-2 text-left">Saving</th></tr></thead>
                    <tbody>
                      {normRows.map((row) => (
                        <tr key={row.rowNumber}>
                          <td className="p-2">{row.rowNumber}</td>
                          <td className="p-2">{row.user.firstName} {row.user.lastName}</td>
                          <td className="p-2">{row.user.email}</td>
                          <td className="p-2">{row.user.paymentType}</td>
                          <td className="p-2">{row.user.savingPlan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={downloadNormalized} className={OUTLINE_BTN}>Download cleaned file</button>
                  <button onClick={sendNormalizedToBatch} className={PRIMARY_BTN}>Send {normRows.length} rows to Batch import</button>
                </div>
              </>
            )}
          </>
        )}

        {/* ---------------------------------------------------------------- Forms → Excel */}
        {activeTab === "forms" && (
          <>
            <div className="rounded-xl bg-green-50 p-4 text-green-900 dark:bg-green-950/40 dark:text-green-100">
              <p className="font-semibold">Turn a folder of hardcopy forms into a batch</p>
              <p className="text-sm text-muted-foreground">
                Pick a folder (or select multiple images) of completed membership forms. Each one is read by Gemini vision, its passport photo is cropped and uploaded, and the whole set becomes an import-ready spreadsheet — the passport column holds each uploaded photo's link. Download the Excel, or send the rows straight to the Batch importer. Up to {SCAN_MAX_FORMS} forms at a time.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-semibold text-foreground">Choose a folder</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={(el) => { if (el) { el.webkitdirectory = true; el.directory = true; } }}
                  onChange={handleFormsSelected}
                  disabled={formsScanning}
                  className="block w-full rounded-xl border-0 bg-input px-4 py-3 text-foreground outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-green-600 file:px-4 file:py-2 file:font-semibold file:text-white focus:ring-2 focus:ring-green-600/50"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-semibold text-foreground">…or select image files</span>                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFormsSelected}
                  disabled={formsScanning}
                  className="block w-full rounded-xl border-0 bg-input px-4 py-3 text-foreground outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-green-600 file:px-4 file:py-2 file:font-semibold file:text-white focus:ring-2 focus:ring-green-600/50"
                />
              </label>
            </div>

            {formsError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{formsError}</p>}

            {formsScanning && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-semibold text-foreground">
                  <span>Reading forms…</span>
                  <span>{formsProgress.done}/{formsProgress.total}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-green-600 transition-all duration-300"
                    style={{ width: `${formsProgress.total ? Math.round((formsProgress.done / formsProgress.total) * 100) : 0}%` }}
                  />
                </div>
              </div>
            )}

            {formsErrors.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                <p className="font-semibold">{formsErrors.length} form{formsErrors.length === 1 ? "" : "s"} could not be read:</p>
                <ul className="mt-1 list-inside list-disc">
                  {formsErrors.map((e, i) => <li key={i}>{e.name}: {e.message}</li>)}
                </ul>
              </div>
            )}

            {formsRows.length > 0 && (
              <>
                <div className="rounded-lg border p-4">
                  <p className="font-semibold">{formsRows.length} form{formsRows.length === 1 ? "" : "s"} read</p>
                  <p className="text-sm text-muted-foreground">Review below, then download the spreadsheet or send the rows to the Batch importer to validate and create the members.</p>
                </div>
                <div className="max-h-64 overflow-auto rounded-lg border">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-muted"><tr><th className="p-2 text-left">Row</th><th className="p-2 text-left">Name</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Type</th><th className="p-2 text-left">Saving</th><th className="p-2 text-left">Passport</th></tr></thead>
                    <tbody>
                      {formsRows.map((row) => (
                        <tr key={row.rowNumber}>
                          <td className="p-2">{row.rowNumber}</td>
                          <td className="p-2">{row.user.firstName} {row.user.lastName}</td>
                          <td className="p-2">{row.user.email}</td>
                          <td className="p-2">{row.user.paymentType}</td>
                          <td className="p-2">{row.user.savingPlan}</td>
                          <td className="p-2">
                            {row.user.passport
                              ? <a href={row.user.passport} target="_blank" rel="noreferrer" className="text-green-700 underline dark:text-green-400">view</a>
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={downloadFormsExcel} className={OUTLINE_BTN}>Download Excel</button>
                  <button onClick={sendFormsToBatch} className={PRIMARY_BTN}>Send {formsRows.length} row{formsRows.length === 1 ? "" : "s"} to Batch import</button>
                </div>
              </>
            )}
          </>
        )}

        {/* ---------------------------------------------------------------- Results */}
        {result?.results?.length > 0 && (
          <div className="space-y-3 rounded-xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">
                Result: {result.createdCount} created
                {result.skippedCount ? `, ${result.skippedCount} skipped` : ""}
                , {result.rejectedCount} rejected
              </p>
              <button onClick={downloadResults} className={OUTLINE_BTN}>Download results</button>
            </div>
            <div className="max-h-64 overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-muted"><tr><th className="p-2 text-left">Row</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Status</th><th className="p-2 text-left">Ledger ID</th><th className="p-2 text-left">Message</th></tr></thead>
                <tbody>
                  {result.results.map((row) => (
                    <tr key={`${row.rowNumber}-${row.email}`} className={row.created ? "bg-green-50 dark:bg-green-950/40" : row.skipped ? "bg-yellow-50 dark:bg-yellow-950/40" : "bg-red-50 dark:bg-red-950/40"}>
                      <td className="p-2">{row.rowNumber}</td>
                      <td className="p-2">{row.email}</td>
                      <td className="p-2">{row.created ? "Created" : row.skipped ? "Skipped" : "Rejected"}</td>
                      <td className="p-2">{row.ledgerId || "—"}</td>
                      <td className="p-2">{row.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Success popup */}
      {showSuccess && result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowSuccess(false)}
        >
          <div
            className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">Upload complete</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.createdCount} of {result.totalRows ?? submittedCount} member
                {(result.totalRows ?? submittedCount) === 1 ? "" : "s"} created
                {result.skippedCount ? `, ${result.skippedCount} skipped` : ""}
                {result.rejectedCount ? `, ${result.rejectedCount} rejected` : ""}.
              </p>
            </div>
            <button onClick={() => setShowSuccess(false)} className={`${PRIMARY_BTN} w-full`}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
