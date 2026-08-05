import { PKPass } from "passkit-generator";
import sharp from "sharp";
import crypto from "crypto";

// ── Tiny PNG image generators (via sharp + SVG) ─────────────────────

async function makeIcon(size: number): Promise<Buffer> {
  const r = Math.round(size * 0.2);
  const fs = Math.round(size * 0.55);
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${r}" fill="#1C2B6E"/>
    <text x="50%" y="53%" font-family="Arial,sans-serif" font-weight="bold"
      font-size="${fs}" fill="#33B27C"
      text-anchor="middle" dominant-baseline="middle">O</text>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function makeLogo(w: number, h: number): Promise<Buffer> {
  const fs = Math.round(h * 0.52);
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="#1C2B6E"/>
    <text x="${w / 2}" y="53%" font-family="Arial,sans-serif" font-weight="800"
      font-size="${fs}" letter-spacing="4"
      fill="#33B27C" text-anchor="middle" dominant-baseline="middle">OFOQ</text>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function makeThumbnail(initial: string, size: number): Promise<Buffer> {
  const fs = Math.round(size * 0.5);
  const cx = size / 2;
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cx}" r="${cx}" fill="#33B27C"/>
    <text x="50%" y="53%" font-family="Arial,sans-serif" font-weight="bold"
      font-size="${fs}" fill="#fff"
      text-anchor="middle" dominant-baseline="middle">${initial}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// ── Main export ─────────────────────────────────────────────────────

export interface WalletPassUser {
  fullName:    string;
  fullNameAr?: string;
  position?:   string;
  department?: string;
  employeeCode: string;
  email:       string;
}

function certificateBuffer(value: string): Buffer {
  // Accept both PEM text and Base64-encoded PEM so Render secrets can use
  // either format without requiring certificate files on the server.
  if (value.includes("-----BEGIN")) {
    return Buffer.from(value, "utf8");
  }

  const decoded = Buffer.from(value, "base64");
  return decoded.toString("utf8").includes("-----BEGIN")
    ? decoded
    : Buffer.from(value, "utf8");
}

export async function generateWalletPass(user: WalletPassUser): Promise<Buffer> {
  const certValue = process.env.APPLE_WALLET_CERT_B64 || process.env.APPLE_PASS_CERT;
  const keyValue  = process.env.APPLE_WALLET_KEY_B64  || process.env.APPLE_PASS_KEY;
  const wwdrValue = process.env.APPLE_WALLET_WWDR_B64 || process.env.APPLE_WWDR_CERT;
  const passId    = process.env.APPLE_WALLET_PASS_ID;
  const teamId    = process.env.APPLE_WALLET_TEAM_ID || process.env.APPLE_TEAM_ID;

  if (!certValue || !keyValue || !wwdrValue) {
    throw new Error(
      "Apple Wallet certificates not configured: set APPLE_PASS_CERT, APPLE_PASS_KEY, and APPLE_WWDR_CERT"
    );
  }
  if (!passId || !teamId) {
    throw new Error(
      "Apple Wallet identifiers not configured: set APPLE_WALLET_PASS_ID and APPLE_TEAM_ID"
    );
  }

  const signerCert = certificateBuffer(certValue).toString("utf8");
  const signerKey  = certificateBuffer(keyValue).toString("utf8");
  const wwdr       = certificateBuffer(wwdrValue).toString("utf8");

  const displayName = user.fullNameAr || user.fullName;
  const initial     = displayName.charAt(0);

  // ── pass.json ─────────────────────────────────────────────────────
  const passJson: Record<string, unknown> = {
    formatVersion: 1,
    passTypeIdentifier: passId,
    serialNumber: `${user.employeeCode}-${crypto.randomBytes(3).toString("hex")}`,
    teamIdentifier: teamId,
    organizationName: "Ofoq Business Solutions",
    description: "OFOQ Employee Card",
    logoText: "أفق",
    foregroundColor: "rgb(255, 255, 255)",
    backgroundColor: "rgb(28, 43, 110)",
    labelColor:      "rgb(51, 178, 124)",
    generic: {
      primaryFields: [
        { key: "name", label: "الاسم", value: displayName, textAlignment: "PKTextAlignmentNatural" },
      ],
      secondaryFields: [
        { key: "position",   label: "المسمى الوظيفي", value: user.position   || "موظف" },
        { key: "department", label: "القسم",           value: user.department || "" },
      ],
      auxiliaryFields: [
        { key: "code", label: "EMPLOYEE CODE", value: user.employeeCode, textAlignment: "PKTextAlignmentNatural" },
      ],
      backFields: [
        { key: "email", label: "EMAIL",        value: user.email },
        { key: "org",   label: "ORGANIZATION", value: "Ofoq for Business Solutions | ofoqhc.com" },
      ],
    },
    barcodes: [
      { message: user.employeeCode, format: "PKBarcodeFormatQR", messageEncoding: "iso-8859-1", altText: user.employeeCode },
    ],
    barcode: {
      message: user.employeeCode, format: "PKBarcodeFormatQR", messageEncoding: "iso-8859-1", altText: user.employeeCode,
    },
  };

  // ── Build images in parallel ───────────────────────────────────────
  const [icon, icon2x, logo, logo2x, thumb, thumb2x] = await Promise.all([
    makeIcon(29),
    makeIcon(58),
    makeLogo(160, 50),
    makeLogo(320, 100),
    makeThumbnail(initial, 90),
    makeThumbnail(initial, 180),
  ]);

  const buffers: Record<string, Buffer> = {
    "pass.json":        Buffer.from(JSON.stringify(passJson)),
    "icon.png":         icon,
    "icon@2x.png":      icon2x,
    "logo.png":         logo,
    "logo@2x.png":      logo2x,
    "thumbnail.png":    thumb,
    "thumbnail@2x.png": thumb2x,
  };

  // ── Sign & pack ────────────────────────────────────────────────────
  const pass = new PKPass(buffers, { wwdr, signerCert, signerKey });
  // getAsBuffer() may be sync or async depending on passkit-generator version
  const buf = pass.getAsBuffer();
  return buf instanceof Promise ? await buf : buf;
}
