import "dotenv/config";
import { eq } from "drizzle-orm";

import fs from "fs";
import jwt from "jsonwebtoken";

import path from "node:path";
import { QueueHandler } from "../workers/QueueConnector";
import { usersTable } from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { mkdir, createWriteStream } from "node:fs";

const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];

const ALLOWED_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export function isAllowedFile(file: File) {
  const lower = file.name.toLowerCase();

  const validExtension = ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));

  const validMime = ALLOWED_MIME.includes(file.type) || file.type === "";

  return validExtension && validMime;
}

export function isValidSecretToken(
  token: string,
  secrets: (string | undefined)[],
): boolean {
  for (const secret of secrets) {
    try {
      if (secret) {
        jwt.verify(token, secret);
        console.log("[isValidSecretToken] ✅ Token verified successfully");
        return true;
      }
    } catch (err: any) {
      console.log("[isValidSecretToken] ❌ Verification failed:", err.message);
    }
  }
  return false;
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

export async function isValidAuth(
  db: NodePgDatabase,
  token: string,
  username: string | undefined = undefined,
): Promise<boolean> {
  try {
    const secrets: string[] = [];

    if (process.env.CLUSTER_WORKER_SECRET) {
      secrets.push(process.env.CLUSTER_WORKER_SECRET);
    }

    if (username) {
      const rows = await db
        .select({ passwd: usersTable.password_hash })
        .from(usersTable)
        .where(eq(usersTable.username, username))
        .limit(1);

      if (rows[0]?.passwd) {
        secrets.push(rows[0].passwd);
      }
    }

    if (secrets.length === 0) {
      throw new Error("Server misconfiguration: no secrets configured");
    }

    return isValidSecretToken(token, secrets);
  } catch (error) {
    console.error("Authentication failed:", error);
    return false;
  }
}

export function getClientIp(c: any): string {
  const bunIp = c.env?.requestIP?.(c.req.raw)?.address;
  if (bunIp) return bunIp;
  return (
    c.req.header("x-real-ip") ||
    (c.req.header("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

export async function handleUpload(
  c: any,
  uploadBaseDir: string,
): Promise<Response> {
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
    await mkdir(path.dirname(filePath), { recursive: true }, (err) => {
      if (err) throw err;
    });
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
}
