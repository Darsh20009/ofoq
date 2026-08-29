import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const PARTNERS_DIR = path.join(process.cwd(), "uploads", "partners");
const EDGE_TOLERANCE = 52;

function colorDistance(data: Buffer, offset: number, background: [number, number, number]): number {
  const dr = data[offset] - background[0];
  const dg = data[offset + 1] - background[1];
  const db = data[offset + 2] - background[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function backgroundColor(data: Buffer, width: number, height: number): [number, number, number] {
  const counts = new Map<string, { count: number; color: [number, number, number] }>();
  const add = (offset: number) => {
    if (data[offset + 3] === 0) return;
    const color: [number, number, number] = [data[offset], data[offset + 1], data[offset + 2]];
    const key = color.map((channel) => Math.round(channel / 16)).join(":");
    const current = counts.get(key);
    if (current) current.count += 1;
    else counts.set(key, { count: 1, color });
  };
  for (let x = 0; x < width; x += 1) {
    add(x * 4);
    add(((height - 1) * width + x) * 4);
  }
  for (let y = 1; y < height - 1; y += 1) {
    add((y * width) * 4);
    add((y * width + width - 1) * 4);
  }
  return [...counts.values()].sort((a, b) => b.count - a.count)[0]?.color || [255, 255, 255];
}

function removeConnectedBackground(data: Buffer, width: number, height: number): void {
  const background = backgroundColor(data, width, height);
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];
  const enqueue = (pixel: number) => {
    if (visited[pixel]) return;
    const offset = pixel * 4;
    if (data[offset + 3] === 0 || colorDistance(data, offset, background) > EDGE_TOLERANCE) return;
    visited[pixel] = 1;
    queue.push(pixel);
  };
  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const pixel = queue[cursor];
    data[pixel * 4 + 3] = 0;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    if (x > 0) enqueue(pixel - 1);
    if (x < width - 1) enqueue(pixel + 1);
    if (y > 0) enqueue(pixel - width);
    if (y < height - 1) enqueue(pixel + width);
  }
}

export async function processPartnerLogo(input: Buffer): Promise<{ buffer: Buffer; filename: string }> {
  const image = sharp(input, { failOn: "error" });
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height || metadata.width > 3000 || metadata.height > 3000) {
    throw new Error("يجب ألا تتجاوز أبعاد الشعار 3000 بكسل");
  }
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  removeConnectedBackground(data, info.width, info.height);
  const buffer = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();
  await fs.mkdir(PARTNERS_DIR, { recursive: true });
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.png`;
  await fs.writeFile(path.join(PARTNERS_DIR, filename), buffer);
  return { buffer, filename };
}

export async function removePartnerLogoFile(logoUrl?: string): Promise<void> {
  if (!logoUrl || !logoUrl.startsWith("/uploads/partners/")) return;
  const filename = path.basename(logoUrl);
  if (!filename || filename === "." || filename === "..") return;
  await fs.unlink(path.join(PARTNERS_DIR, filename)).catch(() => {});
}