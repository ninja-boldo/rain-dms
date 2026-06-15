import path from "path";
import { v4 as uuidv4 } from "uuid";
import { checkUserIsExisting } from "../trust/auth";

const USERS_REGISTERED: string[] = [];

const dockerHostnames: string[] = ["nginx"];

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

export const formatFilename = (
  filepath: string,
  basePathToRemove?: string | null | undefined,
): string => {
  const key =
    basePathToRemove && filepath.startsWith(basePathToRemove)
      ? filepath.slice(basePathToRemove.length)
      : filepath;

  const { dir, name, ext } = path.parse(key);

  const suffix = `-${uuidv4()}-${new Date().toISOString().replace(/:/g, "-")}`;
  const prefix = dir ? `${dir}/` : "";

  const allowedBytes = 1024 - Buffer.byteLength(prefix + suffix + ext, "utf8");

  let truncated = name;

  while (Buffer.byteLength(truncated, "utf8") > allowedBytes) {
    truncated = [...truncated].slice(0, -1).join("");
  }

  return `${prefix}${truncated}${suffix}${ext}`;
};

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

export function sanitizeS3Key(key: string): string {
  return key
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/")
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}._\-\/]/gu, "_");
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
