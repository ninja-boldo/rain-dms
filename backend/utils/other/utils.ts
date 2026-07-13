import "dotenv/config";
import { eq } from "drizzle-orm";

import fs from "fs";
import os from "os";

import path from "node:path";
import { QueueHandler } from "../helperClasses/QueueConnector";
import { documentsTable, fileKeyTempTable, usersTable } from "../../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { ApiPaths, OsType, S3ReturnObj } from "../types/main";
import { getApiBaseUrl, getClientIp } from "../trust/envHelpers";
import { getAuthHeader } from "../trust/auth";

const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];

const ALLOWED_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export function mockS3Objs(elementCount: number): S3ReturnObj[] {
  const objs: S3ReturnObj[] = [];
  for (let i = 0; i < elementCount; i++) {
    objs.push(mockS3Obj());
  }
  return objs;
}
export function mockS3Obj(): S3ReturnObj {
  return { s3Key: "asante", spawnedTimeIso: "karibo" };
}

export function detectOS(): OsType {
  const platform = os.platform();

  switch (platform) {
    case "linux":
      return OsType.Linux;

    case "win32":
      return OsType.Windows;

    case "darwin":
      return OsType.MacOS;

    default:
      return OsType.Unknown;
  }
}

export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  let i = 0;

  while (i < array.length) {
    // slice(start, end) extracts elements without mutating the original array
    chunks.push(array.slice(i, i + chunkSize));
    i += chunkSize;
  }

  return chunks;
}

export function isAllowedFile(file: File) {
  const lower = file.name.toLowerCase();

  const validExtension = ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));

  const validMime = ALLOWED_MIME.includes(file.type) || file.type === "";

  return validExtension && validMime;
}

export function streamFile(
  resolvedPath: string,
  contentType: string,
  disposition: "inline" | "attachment",
): Response {
  const filename = path.basename(resolvedPath);
  const readStream = fs.createReadStream(resolvedPath);
  readStream.on("error", (err) => {
    console.error(`Stream error for ${resolvedPath}:`, err.message);
    readStream.destroy();
  });
  return new Response(readStream as any, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}

export async function getQueueHandler(
  queueHandlerInternal: QueueHandler | null = null,
): Promise<QueueHandler> {
  if (!queueHandlerInternal) {
    queueHandlerInternal = await QueueHandler.create();
  }
  return queueHandlerInternal;
}

export async function serveFile(c: any): Promise<Response> {
  let filepath = c.req.query("filepath");
  const attachment = c.req.query("attachment") === "1";

  if (!filepath) return c.text("Missing filepath", 400);

  const REQUIRED_DIR = process.env.ROOT_DIR ?? "/var/dms";
  const resolvedPath = path.resolve(filepath);
  const allowedBase = path.resolve(REQUIRED_DIR);
  if (!resolvedPath.startsWith(allowedBase)) return c.text("Forbidden", 403);

  try {
    await fs.promises.access(resolvedPath);
  } catch {
    return c.text("File not found", 404);
  }

  let contentType = "application/octet-stream";
  const lower = resolvedPath.toLowerCase();
  if (lower.endsWith(".pdf")) contentType = "application/pdf";
  else if (lower.endsWith(".png")) contentType = "image/png";
  else if (lower.match(/\.jpe?g$/)) contentType = "image/jpeg";

  const workerIp = getClientIp(c);
  let fileBytes = 0;
  try {
    const stats = await fs.promises.stat(resolvedPath);
    fileBytes = stats.size;
  } catch {
    /* non-fatal */
  }

  const qh = await getQueueHandler();
  qh.recordAgentDownload(workerIp, path.basename(resolvedPath), fileBytes);

  return streamFile(
    resolvedPath,
    contentType,
    attachment ? "attachment" : "inline",
  );
}

export async function handleUpload(
  c: any,
  uploadBaseDir: string,
): Promise<Response> {
  try {
    const body = await c.req.parseBody({ all: true });
    const value = body["file"];

    const files = Array.isArray(value)
      ? value.filter((item): item is File => item instanceof File)
      : value instanceof File
        ? [value]
        : [];

    if (files.length === 0) return c.text("At least one file is required", 400);

    const validFiles = files.filter(isAllowedFile);
    if (validFiles.length === 0) return c.text("No valid files uploaded", 400);

    const savedFiles = [];
    for (const file of validFiles) {
      if (
        file.size === 0 ||
        (file.name.toLowerCase().endsWith(".pdf") && file.size < 100)
      ) {
        console.warn(
          `[Blocked Upload] Corrupted or empty file skipped: ${file.name}`,
        );
        continue;
      }

      const safeSubPath = file.name.replace(/\\/g, "/");
      const filePath = path.join(uploadBaseDir, safeSubPath);
      await mkdir(path.dirname(filePath), { recursive: true });
      const nodeReadable = Readable.fromWeb(file.stream() as any);
      await pipeline(nodeReadable, createWriteStream(filePath));

      savedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath,
      });
    }

    if (savedFiles.length === 0) {
      return c.text("Upload rejected: files were empty or corrupted.", 400);
    }

    return c.json({ count: savedFiles.length, files: savedFiles });
  } catch (error) {
    throw Error(
      "failed with this error: ",
      error ?? "couldnt resolve the error",
    );
  }
}

export function getConsumePath(): string {
  const defaultPath: string = "/consume";
  const envVar: string | undefined = process.env.CONSUME_PATH;
  if (envVar === undefined) {
    console.warn(
      "the env var CONSUME_PATH wasnt set/loaded therefore continuing with this default path: ",
      defaultPath,
    );
  }
  return envVar ?? defaultPath;
}

export const fileHashAlreadyExistingApi = async (
  fileHash: string,
): Promise<boolean> => {
  try {
    const url: string = `${await getApiBaseUrl()}${ApiPaths.checkHashExists}`;
    const res = await fetch(url, {
      headers: getAuthHeader(),
      method: "POST",
      body: JSON.stringify({ hash: fileHash }),
    });

    if (!res.ok) {
      throw new Error(`Hash check API failed: ${res.status} ${res.statusText}`);
    }
    const resJson = await res.json();
    return resJson.exists;
  } catch (error) {
    const url: string = `${await getApiBaseUrl()}${ApiPaths.checkHashExists}`;
    throw Error(`failed for this url: ${url} and with this error: ${error}`);
  }
};

export async function getEncryptedFileEncKeyApi(
  fileKey: string,
): Promise<string | null> {
  try {
    const url: string = `${await getApiBaseUrl()}${ApiPaths.getEncryptedFileEncKey}`;
    const res = await fetch(url, {
      headers: getAuthHeader(),
      method: "POST",
      body: JSON.stringify({ fileKey: fileKey }),
    });

    if (!res.ok) {
      throw new Error(`Hash check API failed: ${res.status} ${res.statusText}`);
    }
    const resJson = await res.json();
    return resJson.encrypted_encryption_key ?? null;
  } catch (error) {
    const url: string = `${await getApiBaseUrl()}${ApiPaths.getEncryptedFileEncKey}`;
    throw Error(`failed for this url: ${url} and with this error: ${error}`);
  }
}

export const fileHashExistsServer = async (
  db: NodePgDatabase<any>,
  fileHash: string,
): Promise<boolean> => {
  const cleanHash = String(fileHash).trim();

  const result = await db
    .select({ id: documentsTable.file_id })
    .from(documentsTable)
    .where(eq(documentsTable.fileHash, cleanHash))
    .limit(1);

  return result.length > 0;
};

export const getFileEncKeyDb = async (
  db: NodePgDatabase<any>,
  fileKey: string,
): Promise<string | null> => {
  const result = await db
    .select({ encKey: fileKeyTempTable.encryptionKey })
    .from(fileKeyTempTable)
    .where(eq(fileKeyTempTable.fileS3Key, fileKey))
    .limit(1);

  const key: string | null = result.length > 0 ? result[0].encKey : null;
  return key;
};

export async function dumpFileKeyPairInDb(
  db: NodePgDatabase<any>,
  fileKey: string,
  encryptionKey: string | null,
): Promise<boolean> {
  try {
    await db.insert(fileKeyTempTable).values({
      fileS3Key: fileKey,
      encryptionKey: encryptionKey ?? "null",
    });
    return true;
  } catch (error) {
    throw Error(
      `the dumpFileKeyPairInDb method failed with this error: ${JSON.stringify(error)}`,
    );
  }
}
