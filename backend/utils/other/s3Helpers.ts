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

const maxConcurrentUploadsS3 = pLimit(5);

export async function getS3Url(
  errorIfNotTrusted: boolean = true,
  forceNonLocalNoChecks: boolean = false,
) {
  const NginxBaseUrl: string = await getNginxBaseUrl(forceNonLocalNoChecks);
  if (forceNonLocalNoChecks !== true) {
    const isTrusted = await isServerTrusted(NginxBaseUrl, errorIfNotTrusted);
    if (isTrusted === false) {
      const errorMessage = `the nginx base Url ${NginxBaseUrl} doesnt seem to be trusted`;
      const notAbortAmendment =
        "but the function shouldnt error on this therefore continuing(errorIfNotTrusted = false)";
      if (errorIfNotTrusted === true) {
        throw new PermanentFailureError(errorMessage);
      } else {
        console.error(errorMessage + notAbortAmendment);
      }
    }
  }
  return `${NginxBaseUrl}/s3`;
}

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

    console.log("using this s3 endpoint url: ", S3_ENDPOINT);

    client.middlewareStack.add(
      (next) => async (args) => {
        const req = args.request as any;

        const baseUrl = `https://${req.hostname}${req.port ? `:${req.port}` : ""}`;

        const isTrusted = await isServerTrusted(baseUrl);
        if (isTrusted !== true) {
          throw new Error("the server doesnt seem to be trusted ");
        }

        getAuthHeader().forEach((value, key) => {
          req.headers[key] = value;
        });

        if (process.env.S3_VERBOSE === "true") {
          console.log("[S3_REQUEST]");
          console.log("  → method:", req.method);
          console.log("  → protocol:", req.protocol);
          console.log("  → hostname:", req.hostname);
          console.log("  → path:", req.path);

          const url = `${req.protocol}//${req.hostname}${req.path}`;
          console.log("  → url:", url);
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
    console.error("Error:", error);
    console.error("Raw response:", error?.$response);

    throw error; // preserve original SDK error
  }
}

export const uploadGenericS3 = async (
  client: S3Client,
  bucket: string,
  objectKey: string,
  fileData: any,
  spawnedTime: string, // upload start time in iso
  mimeType?: string,
  verbose: boolean = true,
): Promise<S3ReturnObj> => {
  if (!fileData) {
    throw new Error(`[S3_UPLOAD_ERROR] No file data provided.`);
  }

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
    throw new Error(
      `[S3_UPLOAD_ERROR] Unsupported data type. Must be Buffer, ArrayBuffer, or Uint8Array. Got: ${fileData?.constructor?.name}`,
    );
  }

  const byteLength = binaryPayload.byteLength;

  if (byteLength === 0) {
    throw new Error(
      `[S3_UPLOAD_ERROR] Refusing to upload 0-byte ghost file for key: "${objectKey}"`,
    );
  }

  const startTime = performance.now();
  const sizeMb = (byteLength / (1024 * 1024)).toFixed(2);

  if (verbose) {
    console.log(`[S3_UPLOAD_START]`);
    console.log(`  → Bucket : ${bucket}`);
    console.log(`  → Key    : ${objectKey}`);
    console.log(`  → Size   : ${sizeMb} MB`);
    console.log(`  → Type   : ${mimeType ?? "unknown"}`);
  }

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

    const duration = (performance.now() - startTime) / 1000;
    const speed = (parseFloat(sizeMb) / duration).toFixed(2);

    if (verbose) {
      console.log(`[S3_UPLOAD_SUCCESS]`);
      console.log(`  → Key    : ${objectKey}`);
      console.log(`  → Time   : ${duration.toFixed(3)}s`);
      console.log(`  → Speed  : ${speed} MB/s`);
    }
    return { s3Key: objectKey, spawnedTimeIso: spawnedTime };
  } catch (error: any) {
    console.error("=== S3 UPLOAD FAILED ===");

    console.error("name:", error?.name);
    console.error("message:", error?.message);
    console.error("code:", error?.Code ?? error?.code);
    console.error("stack:", error?.stack);

    console.error("metadata:", error?.$metadata);

    if (error?.$response) {
      console.error("status:", error.$response.statusCode);
      console.error("headers:", error.$response.headers);

      try {
        const body = await streamToString(error.$response.body);
        console.error("body:");
        console.error(body);
      } catch (e) {
        console.error("could not read response body:", e);
      }
    }

    throw error;
  }
};

async function streamToString(stream: any): Promise<string> {
  if (!stream) return "";

  const chunks: Buffer[] = [];

  for await (const chunk of stream as Readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

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
          const formattedFilename = await formatFilename(filepath);
          const objectKey = sanitizeS3Key(formattedFilename);
          const fileBuffer = await fs.promises.readFile(filepath);
          const spawnedTime: string = new Date().toISOString();

          const s3Obj: S3ReturnObj = await uploadGenericS3(
            client,
            bucket,
            objectKey,
            fileBuffer,
            spawnedTime,
          );
          return s3Obj;
        }),
      ),
    );
    if (deleteAfterUpload) {
      await Promise.all(files.map((f) => fs.promises.rm(f)));
    }
    return s3Objs;
  } catch (error: any) {
    console.error("========== S3 MULTI UPLOAD FAILED ==========");

    console.error("Name:", error?.name);
    console.error("Code:", error?.code || error?.Code);
    console.error("Message:", error?.message);
    console.error("Stack:\n", error?.stack);

    console.error("Metadata:", JSON.stringify(error?.$metadata, null, 2));

    console.error("Raw response (safe view):", {
      statusCode: error?.$response?.statusCode,
      headers: error?.$response?.headers,
    });

    if (error?.$response?.body) {
      try {
        const bodyText = await streamToString(error.$response.body);
        console.error("Response body:\n", bodyText);
      } catch (e) {
        console.error("Failed to read response body:", e);
      }
    }

    console.error("============================================");

    throw error;
  }
}

export const initBuckets = async (client: S3Client): Promise<void> => {
  const buckets = [BucketNames.userUploads, BucketNames.bannerImgs];

  await Promise.all(
    buckets.map(async (bucket) => {
      try {
        await client.send(
          new CreateBucketCommand({
            Bucket: bucket,
          }),
        );
      } catch (err: any) {
        const name = err?.name;
        const code = err?.Code || err?.code || err?.name;
        const status = err?.$metadata?.httpStatusCode;

        const ignored = new Set([
          "BucketAlreadyExists",
          "BucketAlreadyOwnedByYou",
          "BucketAlreadyOwnedByYouException",
          "Conflict",
          409,
        ]);

        // ignore if it's expected behavior
        if (ignored.has(name) || ignored.has(code) || ignored.has(status)) {
          return;
        }

        // Only log and throw if it's a genuine, unexpected error
        console.error("[S3_BUCKET_INIT_ERROR] Critical failure:", {
          bucket,
          name,
          code,
          status,
          message: err?.message,
          raw: err?.$response,
        });

        throw err;
      }
    }),
  );
};

export async function downloadFileS3(
  client: S3Client,
  key: string,
  outputPath: string,
  bucket: string = BucketNames.userUploads,
): Promise<string> {
  try {
    const response = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );

    if (!response.Body) {
      throw new Error("No response body returned from S3");
    }

    await pipeline(
      response.Body as unknown as NodeJS.ReadableStream,
      fs.createWriteStream(outputPath),
    );

    return outputPath;
  } catch (error: any) {
    console.error("download from s3 failed with this error:", error);
    console.error("Raw response:", error?.$response);

    throw error; // preserve original SDK error
  }
}

export async function streamUploadS3(
  s3: S3Client,
  objectKey: string,
  finalPath: string,
  spawnTime: string,
  bucketName: string,
) {
  const fileSize = (await fs.promises.stat(finalPath)).size;
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: bucketName,
      Key: objectKey,
      Body: fs.createReadStream(finalPath),
      ContentLength: fileSize,
      Metadata: { spawned_time: spawnTime },
    },
    queueSize: 4, // concurrent part uploads
    partSize: 5 * 1024 * 1024, // 5MB parts
    leavePartsOnError: false,
  });
  await upload.done();
}
/* ---------------------------
   TEMP IMAGE SAVE
----------------------------*/

export const saveImgToTemp = async (
  data: Uint8Array,
  filepathBase: string = `${process.env.ROOT_DIR}/temp/banner_imgs`,
  filename: string | null = null,
  fileExt: FileTypes,
): Promise<string> => {
  if (fileExt === FileTypes.pdf) throw new Error("PDF not allowed here");

  const name = filename ?? `${uuidv4()}_${Date.now()}`;
  const filepath = path.join(filepathBase, `${name}${fileExt}`);

  await fs.promises.mkdir(filepathBase, { recursive: true });
  await fs.promises.writeFile(filepath, Buffer.from(data));

  return filepath;
};
