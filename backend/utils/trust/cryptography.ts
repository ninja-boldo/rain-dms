import * as fs from "fs";
import { createReadStream, createWriteStream } from "fs";
import crypto from "node:crypto";
import path from "path";
import { PasswordWithTimeSalt } from "../types/main";

function stripAppendices(name: string): string {
  return name
    .replace(/_encrypted/g, "")
    .replace(/_decrypted/g, "")
    .replace(/_recrypted/g, "");
}

function appendFilename(inputPath: string, appendix: string): string {
  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath);
  let name = path.basename(inputPath, ext);
  name = stripAppendices(name);

  const appendedPath = path.join(dir, `${name}${appendix}${ext}`);
  return appendedPath;
}

const ALGORITHM = "aes-256-gcm";

const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Format: [IV (12)][Ciphertext][AuthTag (16)]
export function encryptFileStream(
  inputPath: string,
  keyHex: string | undefined | null,
  outputPath: string | null = null,
  deleteUnencrypted: boolean = true,
): Promise<string> {
  if (keyHex === null || keyHex === undefined || keyHex.trim() === "") {
    throw Error("you didnt define the hex key or it was empty");
  }

  return new Promise((resolve, reject) => {
    const key = Buffer.from(keyHex, "hex");
    if (key.length !== 32) return reject(new Error("Key must be 32 bytes"));

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const out = outputPath ?? appendFilename(inputPath, "_encrypted");
    const ws = createWriteStream(out);

    ws.on("error", reject);
    cipher.on("error", reject);
    createReadStream(inputPath).on("error", reject).pipe(cipher);

    ws.write(iv);
    cipher.on("data", (chunk: Buffer) => ws.write(chunk));
    cipher.on("end", () => {
      ws.end(cipher.getAuthTag(), () => {
        if (deleteUnencrypted) fs.unlinkSync(inputPath); // ← after stream closes
        resolve(out);
      });
    });
  });
}

async function toKey(hex: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    Buffer.from(hex, "hex"),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function generateKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
  const raw = await crypto.subtle.exportKey("raw", key);
  return Buffer.from(raw).toString("hex");
}

export async function encryptTxt(
  plaintext: string,
  keyHex: string,
): Promise<string> {
  const key = await toKey(keyHex);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );

  const result = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(ciphertext), iv.byteLength);

  return Buffer.from(result).toString("base64");
}

export function passwordToKeyHex(password: string): string {
  return crypto.createHash("sha256").update(password, "utf8").digest("hex");
}

export async function decryptTxt(b64: string, keyHex: string): Promise<string> {
  const key = await toKey(keyHex);
  const buf = Buffer.from(b64, "base64");
  const iv = buf.subarray(0, 12);
  const ciphertext = buf.subarray(12);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(plaintext);
}

export async function decryptFileStream(
  inputPath: string,
  keyHex: string | undefined | null,
  outputPath: string | null = null,
  deleteEncrypted: boolean = true,
): Promise<string> {
  if (keyHex === null || keyHex === undefined || keyHex.trim() === "") {
    throw Error("you didnt define the hex key or it was empty");
  }
  const key = Buffer.from(keyHex, "hex");
  if (key.length !== 32) throw new Error("Key must be 32 bytes");

  const { size } = await fs.promises.stat(inputPath);

  const fd = await fs.promises.open(inputPath, "r");
  const iv = Buffer.alloc(IV_LENGTH);
  const authTag = Buffer.alloc(TAG_LENGTH);
  await fd.read(iv, 0, IV_LENGTH, 0);
  await fd.read(authTag, 0, TAG_LENGTH, size - TAG_LENGTH);
  await fd.close();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const out = outputPath ?? appendFilename(inputPath, "");

  return new Promise((resolve, reject) => {
    const rs = createReadStream(inputPath, {
      start: IV_LENGTH,
      end: size - TAG_LENGTH - 1,
    });
    const ws = createWriteStream(out);

    rs.on("error", reject);
    ws.on("error", reject);
    decipher.on("error", reject);

    rs.pipe(decipher).pipe(ws);
    ws.on("finish", () => {
      if (deleteEncrypted) fs.unlinkSync(inputPath); // ← after stream closes
      resolve(out);
    });
  });
}

function deriveTimestampKey(password: string, timestampStr: string): Buffer {
  const salt = Buffer.from(timestampStr, "utf8");
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, "sha256");
}
export function decryptWorkerSecretWithTime(
  packedPayload: string,
  password: string,
): string {
  let parsed: PasswordWithTimeSalt;
  try {
    parsed = JSON.parse(packedPayload) as PasswordWithTimeSalt;
  } catch {
    throw new Error(
      "Invalid payload: expected JSON-serialized PasswordWithTimeSalt",
    );
  }

  const {
    timestampStr,
    iv: ivHex,
    authTag: tagHex,
    encrypted: encryptedData,
  } = parsed;
  if (!timestampStr || !ivHex || !tagHex || !encryptedData) {
    throw new Error("Invalid payload: missing required fields");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(tagHex, "hex");
  const key = deriveTimestampKey(password, timestampStr);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export function hashText(
  username: string,
  timestamp: number,
  secret: string,
): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`${username}:${timestamp}`)
    .digest("hex");
}

export function getSpecialKey(): string {
  // random 32 bit key with high entropy
  return crypto.randomBytes(32).toString("hex");
}

export async function hashFile(
  filepath: string,
  bytesToHash: number = 16777216,
): Promise<string> {
  const fileHandle = await fs.promises.open(filepath, "r");
  try {
    const buffer = Buffer.alloc(bytesToHash);
    const { bytesRead } = await fileHandle.read(buffer, 0, bytesToHash, 0);

    const hash = crypto.createHash("sha256");
    hash.update(buffer.subarray(0, bytesRead));
    return hash.digest("hex");
  } finally {
    await fileHandle.close();
  }
}
