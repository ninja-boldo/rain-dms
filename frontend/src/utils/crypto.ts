const IV_BYTES = 12;

function b64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

export function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(Math.floor(hex.length / 2));
  for (let i = 0; i + 1 < hex.length; i += 2)
    out[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return out;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function toAB(u8: Uint8Array): ArrayBuffer {
  return u8.buffer.slice(
    u8.byteOffset,
    u8.byteOffset + u8.byteLength,
  ) as ArrayBuffer;
}

async function sha256Key(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, [
    "decrypt",
    "encrypt",
  ]);
}

async function rawHexKey(hex: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    toAB(hexToBytes(hex)),
    { name: "AES-GCM" },
    false,
    ["decrypt", "encrypt"],
  );
}

async function tryDecrypt(
  iv: Uint8Array,
  ct: Uint8Array,
  key: CryptoKey,
): Promise<string | null> {
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: toAB(iv) as any },
      key,
      toAB(ct),
    );
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}

/**
 * Decrypt the main encryption key from /auth/signin.
 * Tries SHA-256(password) first (new server), then direct hex interpretation (old server compat).
 */
export async function decryptMainEncryptionKey(
  encryptedFromServer: string,
  password: string,
): Promise<string> {
  let b64 = encryptedFromServer;
  try {
    const p = JSON.parse(b64);
    if (typeof p === "string") b64 = p;
  } catch {}

  const bytes = b64ToBytes(b64);
  const iv = bytes.slice(0, IV_BYTES);
  const ct = bytes.slice(IV_BYTES);

  // Strategy 1: SHA-256 (new server with passwordToKeyHex)
  const r1 = await tryDecrypt(iv, ct, await sha256Key(password));
  if (r1 !== null) return r1;

  // Strategy 2: direct hex (old server compat — only when password is valid 64-char hex)
  if (/^[0-9a-fA-F]{64}$/.test(password)) {
    const r2 = await tryDecrypt(iv, ct, await rawHexKey(password));
    if (r2 !== null) {
      console.info("[crypto] used direct-hex fallback (old server format)");
      return r2;
    }
  }

  throw new Error(
    "Failed to decrypt the main encryption key. Wrong password or incompatible server format.",
  );
}

/** Decrypt a per-file key using the main encryption key (hex string). */
export async function decryptFileKey(
  encryptedFileKey: string,
  mainKeyHex: string,
): Promise<string> {
  let b64 = encryptedFileKey;
  try {
    const p = JSON.parse(b64);
    if (typeof p === "string") b64 = p;
  } catch {}
  const bytes = b64ToBytes(b64);
  const iv = bytes.slice(0, IV_BYTES);
  const ct = bytes.slice(IV_BYTES);
  const key = await rawHexKey(mainKeyHex);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toAB(iv) as any },
    key,
    toAB(ct),
  );
  return new TextDecoder().decode(plain);
}

/** Decrypt an encrypted binary blob using a per-file key (hex). */
export async function decryptBlob(
  encryptedBuffer: ArrayBuffer,
  fileKeyHex: string,
): Promise<ArrayBuffer> {
  const bytes = new Uint8Array(encryptedBuffer);
  const iv = bytes.slice(0, IV_BYTES);
  const ct = bytes.slice(IV_BYTES);
  const key = await rawHexKey(fileKeyHex);
  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toAB(iv) as any },
    key,
    toAB(ct),
  );
}
