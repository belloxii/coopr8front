import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useDispatch } from "react-redux";
import { ledgerBatchUpload, getAllUsers } from "../../../../Store/Admin/Action";
import { getAllSavings } from "../../../../Store/Saving/Action";
import BackButton from "../../../Navigation/BackButton";
import { useOrganization } from "../../../../Utils/useOrganization";
import { exportFileName } from "../../../../Utils/exportBranding";

// ---------------------------------------------------------------------------
// Salary-deduction ledger upload (TESCOM staff / PSN members).
//
// The ministry sends a monthly schedule: for each PSN, how much was deducted
// for savings and how much for loan repayment. The backend matches by PSN and
// posts with channel SALARY. Contract:
//   rows: [{ rowNumber, psn, savingAmount, repayAmount }]
// This screen mirrors the member-import screen: a batch tab with a strict
// template + preflight, and a normalize tab that maps messy column names.
// ---------------------------------------------------------------------------

const SUPPORTED_HEADERS = ["psn", "savingAmount", "repayAmount"];
const REQUIRED_HEADERS = ["psn"];

// Canonical button styles (reused from the member-import screen for parity).
const PRIMARY_BTN =
  "rounded-full bg-green-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50";
const OUTLINE_BTN =
  "rounded-full border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50 dark:hover:bg-green-950/40";

const MAX_ROWS = 500;

const text = (value) => (value == null ? "" : String(value).trim());

// ---------------------------------------------------------------------------
// Header normalisation — maps messy/aliased column names to canonical headers.
// ---------------------------------------------------------------------------
const HEADER_ALIASES = {
  psn: "psn", pensionnumber: "psn", payroll: "psn", payrollnumber: "psn",
  staffnumber: "psn", ippis: "psn", ippisnumber: "psn", pfnumber: "psn",
  savingamount: "savingAmount", saving: "savingAmount", savings: "savingAmount",
  savingsamount: "savingAmount", monthlysaving: "savingAmount",
  monthlysavings: "savingAmount", deduction: "savingAmount",
  savingdeduction: "savingAmount", amountsaved: "savingAmount",
  repayamount: "repayAmount", repay: "repayAmount", repayment: "repayAmount",
  repaymentamount: "repayAmount", loanrepayment: "repayAmount",
  loandeduction: "repayAmount", loan: "repayAmount", amountrepaid: "repayAmount",
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

// Parse a currency-ish cell ("₦10,000", "10000.50", "") to a number string.
const normalizeAmount = (value) => {
  const raw = text(value).replace(/[₦,\s]/g, "");
  if (!raw) return "";
  const num = Number(raw);
  return Number.isFinite(num) ? String(num) : raw;
};

const isBlankAmount = (value) => text(value) === "";

function validateRows(rows) {
  const seenPsn = new Set();
  return rows.map(({ rowNumber, row }) => {
    const errors = [];
    const psn = text(row.psn);
    if (!psn) errors.push("psn is required");

    const saving = text(row.savingAmount);
    const repay = text(row.repayAmount);

    if (saving && (!Number.isFinite(Number(saving)) || Number(saving) < 0)) {
      errors.push("savingAmount must be a number ≥ 0");
    }
    if (repay && (!Number.isFinite(Number(repay)) || Number(repay) < 0)) {
      errors.push("repayAmount must be a number ≥ 0");
    }
    if (!saving && !repay) {
      errors.push("row has no savingAmount or repayAmount (nothing to post)");
    }
    if (psn && seenPsn.has(psn.toLowerCase())) {
      errors.push("duplicate PSN in this spreadsheet");
    }
    if (psn) seenPsn.add(psn.toLowerCase());

    return { rowNumber, row, errors };
  });
}

export default function AddSavings() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("bulk");

  // Downloads carrying this cooperative's data are named after it.
  const { name: orgName } = useOrganization();

  // Batch tab state
  const [rows, setRows] = useState([]); // [{ rowNumber, row: { psn, savingAmount, repayAmount } }]
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploadPhase, setUploadPhase] = useState("idle"); // idle | uploading | processing
  const [result, setResult] = useState(null);

  // Normalize tab state
  const [normFileName, setNormFileName] = useState("");
  const [normError, setNormError] = useState("");
  const [normMapping, setNormMapping] = useState([]); // [{ original, mapped }]
  const [normRows, setNormRows] = useState([]); // [{ rowNumber, row }]

  const validatedRows = useMemo(() => validateRows(rows), [rows]);
  const invalidRows = validatedRows.filter((r) => r.errors.length > 0);
  const validRows = validatedRows.filter((r) => r.errors.length === 0);

  // -----------------------------------------------------------------------
  // Template.
  // -----------------------------------------------------------------------
  const downloadTemplate = () => {
    const sampleRows = [
      { psn: "PSN001", savingAmount: 10000, repayAmount: 5000 },
      { psn: "PSN002", savingAmount: 15000, repayAmount: 0 },
      { psn: "PSN003", savingAmount: 0, repayAmount: 8000 },
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleRows, { header: SUPPORTED_HEADERS });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
    // A blank template is a platform artifact (it defines the import contract), so it
    // carries no cooperative's name.
    XLSX.writeFile(workbook, "ledger-upload-template.xlsx");
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
  // Batch tab — strict headers.
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
          if (unsupported.length) messages.push(`Unsupported columns: ${unsupported.join(", ")}. Use the Normalize file tab to clean it, or download the template.`);
          throw new Error(messages.join(" "));
        }
        const data = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false, blankrows: false });
        if (!data.length) throw new Error("The spreadsheet contains no rows.");
        if (data.length > MAX_ROWS) throw new Error(`A batch may contain at most ${MAX_ROWS} rows.`);
        setRows(data.map((source, index) => ({
          rowNumber: index + 2,
          row: {
            psn: text(source.psn),
            savingAmount: normalizeAmount(source.savingAmount),
            repayAmount: normalizeAmount(source.repayAmount),
          },
        })));
      } catch (err) {
        setRows([]);
        setFileError(err.message || "The spreadsheet could not be processed.");
      }
    });
  };

  const handleBulkSubmit = async () => {
    if (!validRows.length || invalidRows.length) return;
    setIsUploading(true);
    setResult(null);
    setUploadPct(0);
    setUploadPhase("uploading");
    try {
      const payload = validRows.map(({ rowNumber, row }) => ({
        rowNumber,
        psn: row.psn,
        savingAmount: isBlankAmount(row.savingAmount) ? null : Number(row.savingAmount),
        repayAmount: isBlankAmount(row.repayAmount) ? null : Number(row.repayAmount),
      }));
      const response = await dispatch(
        ledgerBatchUpload(payload, {
          onUploadProgress: (progress) => {
            const pct = progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0;
            setUploadPct(pct);
            if (pct >= 100) setUploadPhase("processing");
          },
        })
      );
      setUploadPct(100);
      setUploadPhase("idle");
      setResult(response);
      // Refresh the savings list + member balances behind this screen.
      dispatch(getAllSavings());
      dispatch(getAllUsers());
    } catch (error) {
      setUploadPhase("idle");
      setFileError(error.response?.data?.message || error.response?.data?.detail || error.response?.data || "The batch could not be submitted. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // -----------------------------------------------------------------------
  // Normalize tab.
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
        if (data.length > MAX_ROWS) throw new Error(`A batch may contain at most ${MAX_ROWS} rows.`);

        const built = data.map((source, index) => {
          const row = { psn: "", savingAmount: "", repayAmount: "" };
          Object.entries(source).forEach(([rawKey, value]) => {
            const mapped = mapHeader(rawKey);
            if (mapped === "psn") row.psn = text(value);
            else if (mapped) row[mapped] = normalizeAmount(value);
          });
          return { rowNumber: index + 2, row };
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
      normRows.map(({ row }) => ({ psn: row.psn, savingAmount: row.savingAmount, repayAmount: row.repayAmount })),
      { header: SUPPORTED_HEADERS }
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
    XLSX.writeFile(workbook, exportFileName(orgName, "ledger-normalized", "xlsx"));
  };

  const sendNormalizedToBatch = () => {
    if (!normRows.length) return;
    setRows(normRows.map(({ row }, index) => ({ rowNumber: index + 2, row })));
    setFileName("normalized file");
    setFileError("");
    setResult(null);
    setActiveTab("bulk");
  };

  const unmappedCount = normMapping.filter((m) => !m.mapped).length;

  const downloadResults = () => {
    if (!result?.results?.length) return;
    const worksheet = XLSX.utils.json_to_sheet(result.results.map((row) => ({
      rowNumber: row.rowNumber,
      psn: row.psn,
      memberName: row.memberName || "",
      ledgerId: row.ledgerId || "",
      status: row.matched ? "Matched" : "Rejected",
      savingPosted: row.savingPosted ?? 0,
      repayPosted: row.repayPosted ?? 0,
      message: row.message,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger results");
    XLSX.writeFile(workbook, exportFileName(orgName, "ledger-results", "xlsx"));
  };

  const tabClass = (tab) =>
    `px-4 py-2 font-semibold ${activeTab === tab ? "border-b-2 border-green-700 text-green-700" : "text-muted-foreground"}`;

  const money = (v) => `₦${Number(v || 0).toLocaleString()}`;

  return (
    <div className="m-3 text-left bg-card">
      <BackButton />
      <div className="w-full space-y-5 rounded-2xl border bg-card p-5 shadow-xl md:p-7">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add savings (salary deduction)</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload the ministry's monthly schedule for TESCOM staff (PSN) members. Rows are
            matched by PSN and posted with channel <span className="font-semibold">SALARY</span>.
            Use the Normalize tab first if your columns are named differently.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 border-b">
          <button onClick={() => setActiveTab("bulk")} className={tabClass("bulk")}>Batch upload</button>
          <button onClick={() => setActiveTab("normalize")} className={tabClass("normalize")}>Normalize file</button>
        </div>

        {/* ---------------------------------------------------------------- Bulk */}
        {activeTab === "bulk" && (
          <>
            <div className="flex flex-col gap-3 rounded-xl bg-green-50 p-4 dark:bg-green-950/30 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-foreground">Use the template</p>
                <p className="text-sm text-muted-foreground">
                  Required: <b>psn</b>. Optional: <b>savingAmount</b>, <b>repayAmount</b> (at least one per row).
                </p>
              </div>
              <button onClick={downloadTemplate} className={PRIMARY_BTN}>Download template</button>
            </div>

            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="block w-full rounded-xl border-0 bg-input px-4 py-3 text-foreground outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-green-600 file:px-4 file:py-2 file:font-semibold file:text-white focus:ring-2 focus:ring-green-600/50" />
            {fileName && <p className="text-sm text-muted-foreground">Selected: {fileName}</p>}
            {fileError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{fileError}</p>}

            {rows.length > 0 && (
              <>
                <div className="rounded-lg border p-4">
                  <p className="font-semibold text-foreground">Preflight check</p>
                  <p className="text-sm text-muted-foreground">
                    {validRows.length} valid of {rows.length} rows.{" "}
                    {invalidRows.length ? "Correct the highlighted rows before submission." : "All rows are ready to submit."}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PSNs that don't match a member will be reported as rejected after upload — they will not stop the batch.
                  </p>
                </div>
                <div className="max-h-64 overflow-auto rounded-lg border">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-muted">
                      <tr>
                        <th className="p-2 text-left">Row</th>
                        <th className="p-2 text-left">PSN</th>
                        <th className="p-2 text-left">Saving</th>
                        <th className="p-2 text-left">Repay</th>
                        <th className="p-2 text-left">Validation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validatedRows.map((r) => (
                        <tr key={r.rowNumber} className={r.errors.length ? "bg-red-50 dark:bg-red-950/30" : ""}>
                          <td className="p-2">{r.rowNumber}</td>
                          <td className="p-2">{r.row.psn}</td>
                          <td className="p-2">{r.row.savingAmount ? money(r.row.savingAmount) : "—"}</td>
                          <td className="p-2">{r.row.repayAmount ? money(r.row.repayAmount) : "—"}</td>
                          <td className="p-2">{r.errors.length ? r.errors.join("; ") : "Ready"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {isUploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-semibold text-foreground">
                      <span>{uploadPhase === "processing" ? "Processing on server…" : "Uploading…"}</span>
                      <span>{uploadPhase === "processing" ? "" : `${uploadPct}%`}</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full bg-green-600 transition-all duration-300 ${uploadPhase === "processing" ? "animate-pulse" : ""}`}
                        style={{ width: `${uploadPhase === "processing" ? 100 : uploadPct}%` }}
                      />
                    </div>
                  </div>
                )}

                <button disabled={isUploading || invalidRows.length > 0} onClick={handleBulkSubmit} className={`${PRIMARY_BTN} w-full`}>
                  {isUploading ? "Posting…" : `Post ${validRows.length} ledger rows`}
                </button>
              </>
            )}
          </>
        )}

        {/* ---------------------------------------------------------------- Normalize */}
        {activeTab === "normalize" && (
          <>
            <div className="rounded-xl bg-green-50 p-4 dark:bg-green-950/30">
              <p className="font-semibold text-foreground">Normalize an uploaded file</p>
              <p className="text-sm text-muted-foreground">
                Upload a schedule whose columns are named differently (e.g. "Pension No.",
                "Monthly Savings", "Loan Deduction"). We map them to <b>psn</b>, <b>savingAmount</b>,
                and <b>repayAmount</b>, then you can download the cleaned file or send it straight to
                the batch uploader.
              </p>
            </div>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleNormalizeUpload} className="block w-full rounded-xl border-0 bg-input px-4 py-3 text-foreground outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-green-600 file:px-4 file:py-2 file:font-semibold file:text-white focus:ring-2 focus:ring-green-600/50" />
            {normFileName && <p className="text-sm text-muted-foreground">Selected: {normFileName}</p>}
            {normError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{normError}</p>}

            {normMapping.length > 0 && (
              <div className="rounded-lg border p-4">
                <p className="font-semibold text-foreground">Column mapping</p>
                <p className="mb-2 text-sm text-muted-foreground">
                  {normMapping.length - unmappedCount} of {normMapping.length} columns matched.
                  {unmappedCount ? ` ${unmappedCount} unmatched column(s) will be ignored.` : ""}
                </p>
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
                    <thead className="sticky top-0 bg-muted">
                      <tr>
                        <th className="p-2 text-left">Row</th>
                        <th className="p-2 text-left">PSN</th>
                        <th className="p-2 text-left">Saving</th>
                        <th className="p-2 text-left">Repay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {normRows.map((r) => (
                        <tr key={r.rowNumber}>
                          <td className="p-2">{r.rowNumber}</td>
                          <td className="p-2">{r.row.psn}</td>
                          <td className="p-2">{r.row.savingAmount || "—"}</td>
                          <td className="p-2">{r.row.repayAmount || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={downloadNormalized} className={OUTLINE_BTN}>Download cleaned file</button>
                  <button onClick={sendNormalizedToBatch} className={PRIMARY_BTN}>Send {normRows.length} rows to Batch upload</button>
                </div>
              </>
            )}
          </>
        )}

        {/* ---------------------------------------------------------------- Results */}
        {result?.results?.length > 0 && (
          <div className="space-y-3 rounded-xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">
                  Result: {result.matchedCount} matched, {result.rejectedCount} rejected
                </p>
                <p className="text-sm text-muted-foreground">
                  Saved {money(result.totalSaved)} across {result.savingCount} member(s);
                  repaid {money(result.totalRepaid)} across {result.repayCount} member(s).
                </p>
              </div>
              <button onClick={downloadResults} className={OUTLINE_BTN}>Download results</button>
            </div>
            <div className="max-h-64 overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="p-2 text-left">Row</th>
                    <th className="p-2 text-left">PSN</th>
                    <th className="p-2 text-left">Member</th>
                    <th className="p-2 text-left">Saved</th>
                    <th className="p-2 text-left">Repaid</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((row) => (
                    <tr key={`${row.rowNumber}-${row.psn}`} className={row.matched ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"}>
                      <td className="p-2">{row.rowNumber}</td>
                      <td className="p-2">{row.psn || "—"}</td>
                      <td className="p-2">{row.memberName || "—"}</td>
                      <td className="p-2">{money(row.savingPosted)}</td>
                      <td className="p-2">{money(row.repayPosted)}</td>
                      <td className="p-2">{row.matched ? "Matched" : "Rejected"}</td>
                      <td className="p-2">{row.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
