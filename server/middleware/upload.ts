import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Ensure upload dirs exist
["images", "documents", "avatars", "temp"].forEach((dir) => {
  const p = path.join(UPLOAD_DIR, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const type = req.query.type || "documents";
    const dest = path.join(UPLOAD_DIR, String(type));
    cb(null, fs.existsSync(dest) ? dest : path.join(UPLOAD_DIR, "documents"));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const hash = crypto.randomBytes(8).toString("hex");
    cb(null, `${Date.now()}-${hash}${ext}`);
  },
});

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowed = [
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "application/zip",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("نوع الملف غير مسموح به"));
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE || "10485760"), // 10MB
    files: 10,
  },
});

export const uploadSingle = upload.single("file");
export const uploadMultiple = upload.array("files", 10);
export const uploadAvatar = upload.single("avatar");
