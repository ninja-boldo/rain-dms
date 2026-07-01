import {
  CreateBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { PermanentFailureError } from "../helperClasses/QueueConnector";
import { getNginxBaseUrl, isServerTrusted } from "../trust/envHelpers";
import { BucketNames, FileTypes, S3ReturnObj } from "../types/main";
import { getAuthHeader } from "../trust/auth";
import { formatFilename, sanitizeS3Key } from "./pathHelpers";
import pLimit from "p-limit";
import fs from "fs";
import { pipeline } from "stream/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";

// Throttle concurrent S3 tasks to prevent connection starvation
const maxConcurrentUploadsS3 = pLimit(5);

// Total internal execution tries before passing out a permanent hard error
const MAX_S3_TRIES = 3;

/**
 * Validates that proxy/gateway responses aren't leaking HTML/XML error pages.
 */
const detectAndThrowIfHtmlOrXml = (bodyText: string, context: string) => {
  if (!bodyText) return;
  const lowerBody = bodyText.trim().toLowerCase();
  const isHtml =
    lowerBody.startsWith("<!doctype html") ||
    lowerBody.startsWith("<html") ||
    lowerBody.includes("<html");
  const isXml =
    lowerBody.startsWith("<?xml") || lowerBody.startsWith("<error>");

  if (isHtml || isXml) {
    const type = isHtml ? "HTML" : "XML";

    console.error(
      `\n=== 🚨 [${context}] CAUGHT UNEXPECTED ${type} RESPONSE 🚨 ===`,
    );
    console.error(`--- Full Payload Received ---`);
    console.error(bodyText);
    console.error(
      "=========================================================\n",
    );

    throw new PermanentFailureError(
      `[${context}] Critical Error: Server returned an unexpected ${type} proxy response instead of data. \n\n--- RAW ${type} START ---\n${bodyText}\n--- RAW ${type} END ---\n`,
    );
  }
};

/**
 * Consumes a readable stream and transforms it into a standard UTF-8 string
 */
export async function streamToString(stream: any): Promise<string> {
  if (!stream) return "";
  const chunks: Buffer[] = [];
  for await (const chunk of stream as Readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

/**
 * Helper to extract comprehensive context from an AWS S3 client SDK error response
 */
async function formatRawAwsError(error: any): Promise<string> {
  let details = `Error Name: ${error?.name || "Unknown"}\nMessage: ${error?.message || "No message"}`;
  if (error?.$response) {
    const resp = error.$response;
    details += `\nHTTP Status Code: ${resp.statusCode}`;
    details += `\nHeaders: ${JSON.stringify(resp.headers || {})}`;
    if (resp.body) {
      const bodyText = await streamToString(resp.body).catch(
        () => "Unreadable stream body",
      );
      details += `\nRaw Server Body Output:\n${bodyText}`;
    }
  }
  return details;
}

/**
 * Resolves the Nginx base URL and enforces ecosystem trust boundaries
 */
export async function getS3Url(
  errorIfNotTrusted: boolean = true,
  forceNonLocalNoChecks: boolean = false,
) {
  const NginxBaseUrl: string = await getNginxBaseUrl(forceNonLocalNoChecks);
  if (forceNonLocalNoChecks !== true) {
    const isTrusted = await isServerTrusted(NginxBaseUrl, errorIfNotTrusted);
    if (isTrusted === false) {
      const errorMessage = `The nginx base Url ${NginxBaseUrl} does not seem to be trusted.`;
      if (errorIfNotTrusted === true) {
        throw new PermanentFailureError(
          `[S3_TRUST_FAILURE] Execution aborted: ${errorMessage}`,
        );
      } else {
        console.error(
          `${errorMessage} but errorIfNotTrusted is false; proceeding cautiously.`,
        );
      }
    }
  }
  return `${NginxBaseUrl}/s3`;
}

/**
 * Generates an authorized S3 Client instance bundled with validation middleware
 */
export async function getS3Client(): Promise<S3Client> {
  try {
    const S3_ENDPOINT = await getS3Url();
    const client = new S3Client({
      region: "us-east-1",
      endpoint: S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY ?? "rain-dms",
        secretAccessKey: process.env.S3_SECRET_KEY ?? "rain-dms",
      },
    });

    client.middlewareStack.add(
      (next) => async (args) => {
        const req = args.request as any;
        getAuthHeader().forEach((value, key) => {
          req.headers[key] = value;
        });
        if (process.env.S3_VERBOSE === "true") {
          console.log(
            `[S3_REQUEST] ${req.method} → ${req.protocol}//${req.hostname}${req.path}`,
          );
        }
        return next(args);
      },
      {
        step: "finalizeRequest",
        priority: "high",
        name: "authAndTrustMiddleware",
      },
    );
    return client;
  } catch (error: any) {
    throw new PermanentFailureError(
      `[S3_CLIENT_INIT_FAILED] Could not construct S3 Client. Raw message: ${error?.message || error}`,
    );
  }
}

/**
 * Uploads raw memory buffers/typed arrays directly to a targeted S3 key with 3 internal retries
 */
export const uploadGenericS3 = async (
  client: S3Client,
  bucket: string,
  objectKey: string,
  fileData: any,
  spawnedTime: string,
  mimeType?: string,
  verbose: boolean = true,
): Promise<S3ReturnObj> => {
  if (!fileData)
    throw new PermanentFailureError(`[S3_UPLOAD_ERROR] No file data provided.`);

  let binaryPayload: Uint8Array;
  if (fileData instanceof Uint8Array) {
    binaryPayload = fileData;
  } else if (fileData instanceof ArrayBuffer) {
    binaryPayload = new Uint8Array(fileData);
  } else if (Buffer.isBuffer(fileData)) {
    binaryPayload = new Uint8Array(fileData);
  } else if (
    fileData &&
    typeof fileData === "object" &&
    fileData.buffer instanceof ArrayBuffer
  ) {
    binaryPayload = new Uint8Array(
      fileData.buffer,
      fileData.byteOffset,
      fileData.byteLength,
    );
  } else {
    throw new PermanentFailureError(
      `[S3_UPLOAD_ERROR] Unsupported data type variant provided: ${fileData?.constructor?.name}`,
    );
  }

  const byteLength = binaryPayload.byteLength;
  if (byteLength === 0) {
    throw new PermanentFailureError(
      `[S3_UPLOAD_ERROR] Refusing to upload 0-byte ghost file for key: "${objectKey}"`,
    );
  }

  for (let attempt = 1; attempt <= MAX_S3_TRIES; attempt++) {
    const startTime = performance.now();
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: objectKey,
          Body: binaryPayload,
          ContentLength: byteLength,
          ...(mimeType && { ContentType: mimeType }),
        }),
      );

      if (verbose) {
        const duration = (performance.now() - startTime) / 1000;
        console.log(
          `[S3_UPLOAD_SUCCESS] Key: ${objectKey} | Attempt ${attempt}/${MAX_S3_TRIES} | ${duration.toFixed(3)}s`,
        );
      }
      return { s3Key: objectKey, spawnedTimeIso: spawnedTime };
    } catch (error: any) {
      const bodyText = error?.$response?.body
        ? await streamToString(error.$response.body).catch(() => "")
        : "";
      detectAndThrowIfHtmlOrXml(
        bodyText,
        `S3_GENERIC_UPLOAD_ATTEMPT_${attempt}`,
      );

      console.warn(
        `[S3_UPLOAD_WARNING] Attempt ${attempt}/${MAX_S3_TRIES} failed for key "${objectKey}". Status Code: ${error?.$response?.statusCode || "N/A"} | Error: ${error?.message || error}`,
      );

      if (attempt === MAX_S3_TRIES) {
        const rawResponseData = await formatRawAwsError(error);
        throw new PermanentFailureError(
          `[S3_UPLOAD_FAILED] PutObjectCommand exhausted all ${MAX_S3_TRIES} retries for bucket "${bucket}" on key "${objectKey}". \n=== RAW SERVER RESPONSES ===\n${rawResponseData}\n============================`,
        );
      }

      await new Promise((res) => setTimeout(res, 300 * attempt));
    }
  }
  throw new PermanentFailureError(
    "[S3_UPLOAD_FAILED] Unreachable breakout context achieved.",
  );
};

/**
 * Mass uploads local file paths concurrently utilizing an engine-level throttle
 */
export async function uploadManyS3(
  client: S3Client,
  files: string[],
  deleteAfterUpload: boolean = false,
  bucket: string,
): Promise<S3ReturnObj[]> {
  try {
    const s3Objs: S3ReturnObj[] = await Promise.all(
      files.map((filepath) =>
        maxConcurrentUploadsS3(async () => {
          const fileBuffer = await fs.promises
            .readFile(filepath)
            .catch((fsErr) => {
              throw new PermanentFailureError(
                `[S3_MULTI_UPLOAD_FS_ERROR] Failed reading local file path "${filepath}". System Code: ${fsErr.code || "UNKNOWN"} | Message: ${fsErr.message}`,
              );
            });

          const formattedFilename = await formatFilename(filepath);
          const objectKey = sanitizeS3Key(formattedFilename);
          const spawnedTime: string = new Date().toISOString();
          return await uploadGenericS3(
            client,
            bucket,
            objectKey,
            fileBuffer,
            spawnedTime,
            undefined,
            false,
          );
        }),
      ),
    );

    if (deleteAfterUpload) {
      await Promise.all(files.map((f) => fs.promises.rm(f).catch(() => null)));
    }
    return s3Objs;
  } catch (error: any) {
    if (error instanceof PermanentFailureError) throw error;

    if (error?.$response?.body) {
      const bodyText = await streamToString(error.$response.body).catch(
        () => "",
      );
      detectAndThrowIfHtmlOrXml(bodyText, "S3_MULTI_UPLOAD");
    }
    const rawResponseData = await formatRawAwsError(error);
    throw new PermanentFailureError(
      `[S3_MULTI_UPLOAD_FAILED] Batch processing completely failed after inside execution limits. \n=== RAW SERVER RESPONSES ===\n${rawResponseData}\n============================`,
    );
  }
}

/**
 * Ensures required ecosystem S3 buckets exist safely during app bootstrap
 */
export const initBuckets = async (client: S3Client): Promise<void> => {
  const buckets = [BucketNames.userUploads, BucketNames.bannerImgs];
  await Promise.all(
    buckets.map(async (bucket) => {
      try {
        await client.send(new CreateBucketCommand({ Bucket: bucket }));
      } catch (err: any) {
        const name = err?.name;
        const code = err?.Code || err?.code || err?.name;
        const ignored = new Set([
          "BucketAlreadyExists",
          "BucketAlreadyOwnedByYou",
          "BucketAlreadyOwnedByYouException",
          "Conflict",
          409,
        ]);

        if (ignored.has(name) || ignored.has(code)) return;

        throw new PermanentFailureError(
          `[S3_BUCKET_INIT_ERROR] Handshake failed for initialization of bucket "${bucket}". Code: ${code} | Message: ${err?.message}`,
        );
      }
    }),
  );
};

/**
 * Downloads a specified object directly to the host storage system filesystem with 3 internal retries
 */
export async function downloadFileS3(
  client: S3Client,
  key: string,
  outputPath: string,
  bucket: string = BucketNames.userUploads,
): Promise<string> {
  for (let attempt = 1; attempt <= MAX_S3_TRIES; attempt++) {
    try {
      const response = await client.send(
        new GetObjectCommand({ Bucket: bucket, Key: key }),
      );

      if (!response.Body) {
        throw new Error(`S3 API returned an empty body payload context.`);
      }

      const contentType = response.ContentType || "";

      if (
        contentType.includes("text/html") ||
        contentType.includes("application/xml") ||
        contentType.includes("text/xml")
      ) {
        const bodyText = await streamToString(response.Body);
        detectAndThrowIfHtmlOrXml(
          bodyText,
          `S3_DOWNLOAD_CONTENT_TYPE_ATTEMPT_${attempt}`,
        );
      }

      await pipeline(
        response.Body as unknown as NodeJS.ReadableStream,
        fs.createWriteStream(outputPath),
      );
      return outputPath;
    } catch (error: any) {
      if (error instanceof PermanentFailureError) throw error;

      if (error?.$response?.body) {
        const bodyText = await streamToString(error.$response.body).catch(
          () => "",
        );
        detectAndThrowIfHtmlOrXml(
          bodyText,
          `S3_DOWNLOAD_ERROR_BODY_ATTEMPT_${attempt}`,
        );
      }

      console.warn(
        `[S3_DOWNLOAD_WARNING] Attempt ${attempt}/${MAX_S3_TRIES} failed for key "${key}". Status Code: ${error?.$response?.statusCode || "N/A"} | Error: ${error?.message || error}`,
      );

      if (attempt === MAX_S3_TRIES) {
        const rawResponseData = await formatRawAwsError(error);
        throw new PermanentFailureError(
          `[S3_DOWNLOAD_COMMAND_FAILED] GetObject call failed comprehensively after ${MAX_S3_TRIES} tries for key "${key}" on bucket "${bucket}". \n=== RAW SERVER RESPONSES ===\n${rawResponseData}\n============================`,
        );
      }
      await new Promise((res) => setTimeout(res, 300 * attempt));
    }
  }
  throw new PermanentFailureError(
    "[S3_DOWNLOAD_FAILED] Unreachable breakout context achieved.",
  );
}

/**
 * Handles large asset processing uploads seamlessly through multipart chunk pipelines with 3 internal retries
 */
export async function streamUploadS3(
  s3: S3Client,
  objectKey: string,
  finalPath: string,
  spawnTime: string,
  bucketName: string,
) {
  let fileSize: number;
  try {
    fileSize = (await fs.promises.stat(finalPath)).size;
  } catch (statError: any) {
    throw new PermanentFailureError(
      `[S3_STREAM_UPLOAD_PRECHECK_FAILED] Cannot locate target source file to upload at "${finalPath}". System code: ${statError.code || "UNKNOWN"} | Message: ${statError.message}`,
    );
  }

  for (let attempt = 1; attempt <= MAX_S3_TRIES; attempt++) {
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: bucketName,
        Key: objectKey,
        Body: fs.createReadStream(finalPath),
        ContentLength: fileSize,
        Metadata: { spawned_time: spawnTime },
      },
      queueSize: 4,
      partSize: 5 * 1024 * 1024,
      leavePartsOnError: false,
    });

    try {
      await upload.done();
      return;
    } catch (error: any) {
      if (error?.$response?.body) {
        const bodyText = await streamToString(error.$response.body).catch(
          () => "",
        );
        detectAndThrowIfHtmlOrXml(
          bodyText,
          `S3_STREAM_UPLOAD_ATTEMPT_${attempt}`,
        );
      }

      console.warn(
        `[S3_STREAM_UPLOAD_WARNING] Attempt ${attempt}/${MAX_S3_TRIES} failed for stream key "${objectKey}". Error: ${error?.message || error}`,
      );

      if (attempt === MAX_S3_TRIES) {
        const rawResponseData = await formatRawAwsError(error);
        throw new PermanentFailureError(
          `[S3_STREAM_UPLOAD_FAILED] Multipart manager execution completely failed after ${MAX_S3_TRIES} tries for key "${objectKey}" in bucket "${bucketName}". \n=== RAW SERVER RESPONSES ===\n${rawResponseData}\n============================`,
        );
      }
      await new Promise((res) => setTimeout(res, 300 * attempt));
    }
  }
}

/**
 * Saves arbitrary buffer streams securely into host local temp directories
 */
export const saveImgToTemp = async (
  data: Uint8Array,
  filepathBase: string = `${process.env.ROOT_DIR}/temp/banner_imgs`,
  filename: string | null = null,
  fileExt: FileTypes,
): Promise<string> => {
  if (fileExt === FileTypes.pdf) {
    throw new PermanentFailureError(
      "[VALIDATION_ERROR] Security policy violation: PDF files are strictly rejected here.",
    );
  }

  const name = filename ?? `${uuidv4()}_${Date.now()}`;
  const filepath = path.join(filepathBase, `${name}${fileExt}`);

  try {
    await fs.promises.mkdir(filepathBase, { recursive: true });
    await fs.promises.writeFile(filepath, Buffer.from(data));
    return filepath;
  } catch (fsWriteErr: any) {
    throw new PermanentFailureError(
      `[TEMP_DISK_WRITE_FAILED] Local filesystem I/O operation crashed. Key: "${filepath}". System Code: ${fsWriteErr.code || "UNKNOWN"} | Message: ${fsWriteErr.message}`,
    );
  }
};
