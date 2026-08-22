/**
 * Private candidate document upload.
 * Files are stored outside the public `uploads/` folder so they are
 * NEVER served by the static middleware in app.ts.
 * Access is controlled through authenticated download endpoints only.
 */
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// ── Private storage root (NOT under /uploads which is served statically) ──
export const CANDIDATE_DOCS_DIR = path.join(process.cwd(), "private_candidate_docs");

// Ensure the directory exists
if (!fs.existsSync(CANDIDATE_DOCS_DIR)) {
  fs.mkdirSync(CANDIDATE_DOCS_DIR, { recursive: true });
}

// ── Allowed MIME types (allowlist) ───────────────────────────────
const ALLOWED_MIMES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

// 5 MB per file
export const CANDIDATE_DOC_MAX_SIZE = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, CANDIDATE_DOCS_DIR);
  },
  filename: (_req, _file, cb) => {
    // Random name — extension derived from MIME, never from original filename
    const hash = crypto.randomBytes(16).toString("hex");
    cb(null, `${Date.now()}-${hash}`);
  },
});

function candidateFileFilter(
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (ALLOWED_MIMES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("نوع الملف غير مسموح به. يُسمح فقط بـ PDF أو JPEG أو PNG"));
  }
}

export const candidateUpload = multer({
  storage,
  fileFilter: candidateFileFilter,
  limits: {
    fileSize: CANDIDATE_DOC_MAX_SIZE,
    files: 5,
  },
});

/**
 * Sanitize an original filename for safe display (strip path components).
 * The stored filename is always random — this is only for the label we
 * record in the database.
 */
export function sanitizeOriginalName(original: string): string {
  return path.basename(original).replace(/[^\w.\-\u0600-\u06FF ]/g, "_").slice(0, 200);
}
