import { sign } from "jsonwebtoken";

const TOKEN_TTL_S = 3600;
let _tokenExpiresAt = Date.now();
let _cachedToken = "";

export function getAuthHeader(): Headers {
  const secret =
    process.env.CLUSTER_WORKER_SECRET ?? "celestialisabadplaceholder";
  console.log("using this secret: ", secret)
  const now = Math.floor(Date.now() / 1000);

  // Regenerate token dynamically if it is close to expiring
  if (!_cachedToken || now >= _tokenExpiresAt - 60) {
    _tokenExpiresAt = now + TOKEN_TTL_S;
    _cachedToken = sign(
      {
        exp: _tokenExpiresAt,
        role: "worker",
        iss: "rain-dms-watcher",
      },
      secret,
    );
  }

  const h = new Headers();
  // Pass the secure token via a custom channel so it doesn't conflict with S3 signatures
  h.append("X-Auth-Token", _cachedToken);
  return h;
}

console.log(JSON.stringify(getAuthHeader()));

import { S3Client, PutObjectCommand, CreateBucketCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync } from "fs";


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const client = new S3Client({
  region: "us-east-1",
  endpoint: "https://localhost:7443/s3",
  forcePathStyle: true, 
  credentials: {
    accessKeyId: "rain-dms",
    secretAccessKey: "rain-dms",
  },
  
});

client.middlewareStack.add(
  (next) => async (args) => {
    const req = args.request;

    console.log({
      protocol: req.protocol,
      hostname: req.hostname,
      port: req.port,
      path: req.path,
    });

    return next(args);
  },
  { step: "finalizeRequest" }
);
client.middlewareStack.add(
  (next) => async (args) => {
    const req = args.request as any;
    const authHeaders = getAuthHeader();

    authHeaders.forEach((value, key) => {
      req.headers[key] = value;
    });

    return next(args);
  },
  { step: "finalizeRequest", priority: "low", name: "authHeaderMiddleware" }
);

const usedBucket = "uploads"
try{
await client.send(
  new CreateBucketCommand({
    Bucket: usedBucket,
  })
);}
catch{
console.log("bucket already existing")
}

try {
  const result = await client.send(
    new PutObjectCommand({
      Bucket: usedBucket,
      Key: "hallo.txt",
      Body: readFileSync("./hallo.txt"),
      ContentType: "text/plain",
    })
  );

  console.log(result);
} catch (err) {
  console.dir(err, { depth: null });
}


const response = await client.send(
  new GetObjectCommand({
    Bucket: "uploads",
    Key: "hallo.txt",
  })
);

const content = await response.Body.transformToString();

console.log(content);