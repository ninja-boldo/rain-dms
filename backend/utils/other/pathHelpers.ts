import path from "path";
import { v4 as uuidv4 } from "uuid";
import { checkUserIsExisting } from "../trust/auth";

const USERS_REGISTERED: string[] = [];

export const changeFilenameForPath = (
  filepath: string | undefined,
  newFilename: string,
) => {
  if (!filepath) return newFilename;
  return path.join(path.dirname(filepath), newFilename);
};

export const getFilename = (p: string | undefined) => {
  if (!p) return "";
  return path.parse(p).name;
};

export const getExtension = (p: string | undefined) => {
  if (!p) return "";
  return path.parse(p).ext.slice(1);
};

/* ---------------------------
   URL / AUTH HELPERS
----------------------------*/

export const sanitizeUrl = (url: string): string => {
  return `https://${url.replace(/^(?:https?:\/\/?)+/gi, "")}`;
};

const MAX_KEY_BYTES = 175; // leave headroom under the 255 filer limit for uuid+timestamp+ext

function truncateToByteBudget(name: string, budget: number): string {
  let out = name;
  while (Buffer.byteLength(out, "utf8") > budget) out = out.slice(0, -1);
  return out;
}

export async function formatFilename(finalPath: string, tempFolder: string): Promise<string> {
  const ext = path.extname(finalPath);
  const base = path.basename(finalPath, ext);
  const uuid = uuidv4();
  const ts = new Date().toISOString().replace(/[:.]/g, "-");

  // reserve room for "-<uuid>-<ts><ext>"
  const suffixLen = Buffer.byteLength(`-${uuid}-${ts}${ext}`, "utf8");
  const safeBase = truncateToByteBudget(base, MAX_KEY_BYTES - suffixLen);

  return `${safeBase}-${uuid}-${ts}${ext}`;
}

export function prependImgKey(imgKey: string): string {
  const s3Prepend = "/s3/";
  if (!imgKey.startsWith(s3Prepend)) {
    return `${s3Prepend}${imgKey}`;
  }
  return imgKey;
}

function replaceUmlauts(str: string): string {
  const umlautMap: Record<string, string> = {
    ä: "ae",
    ö: "oe",
    ü: "ue",
    Ä: "Ae",
    Ö: "Oe",
    Ü: "Ue",
    ß: "ss",
  };
  return str.replace(/[äöüÄÖÜß]/g, (match) => umlautMap[match]);
}

export function sanitizeFilePath(
  inputPath: string,
  maxNameBytes: number = 200,
  appendUuid: boolean = false,
): string {
  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath);
  const name = path.basename(inputPath, ext);

  let sanitizedName = name
    .replace(/\s+/g, "_")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  sanitizedName = replaceUmlauts(sanitizedName);

  if (appendUuid) sanitizedName += "-" + uuidv4();

  const extBytes = Buffer.byteLength(ext, "utf8");
  const allowed = maxNameBytes - extBytes;

  let truncated = sanitizedName || "unnamed";
  while (Buffer.byteLength(truncated, "utf8") > allowed) {
    truncated = [...truncated].slice(0, -1).join("");
  }

  return path.join(dir, truncated + ext);
}

export function sanitizeS3Key(key: string, maxLen = 255): string {
  const sanitized = key
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/")
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}._\-\/]/gu, "_");

  return sanitized
}


export const isFilepath = (s: string) => !s.startsWith("http");

export function getUsernameFromConsumeRaw(filePath: string): string {
  // for each user upload there will be a subfolder for uploads where they can place their stuff
  const consumePath: string | undefined = process.env.CONSUME_PATH;
  if (consumePath === undefined) {
    throw Error("CONSUME_PATH doesnt seem to be loaded/set as an env var");
  }

  filePath = removePathPrefix(filePath, consumePath); // remove consumePath from filepath
  return filePath.trim().length > 0 ? path.parse(filePath).root : ""; // return the first root folder after consume
}

export function removePathPrefix(filePath: string, prefix: string): string {
  const result = filePath.startsWith(prefix)
    ? filePath.slice(prefix.length)
    : filePath;
  return result;
}

export async function getUsernameFromConsumeDbChecked(
  username: string,
): Promise<string> {
  const allegedUsername: string = getUsernameFromConsumeRaw(username);
  if (USERS_REGISTERED.includes(allegedUsername)) {
    return allegedUsername;
  }
  const isExisting = await checkUserIsExisting(allegedUsername);
  if (isExisting === true) {
    return allegedUsername;
  } else {
    return "";
  }
}
