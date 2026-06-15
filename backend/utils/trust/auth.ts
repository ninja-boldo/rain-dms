import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { documentsTable, usersTable } from "../../db/schema";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import jwt, { sign } from "jsonwebtoken";
import { getApiBaseUrl, getClusterSecret } from "./envHelpers";
import { ApiPaths } from "../types/main";

export async function isValidAuthUser(
  db: NodePgDatabase,
  tokenToVerify: string,
  username: string | null,
): Promise<boolean> {
  if (username === null) {
    return false;
  }
  try {
    const rows = await db
      .select({ passwd: usersTable.password_hash })
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    let randToken: string | null = null;
    let passwordHash: string = "";
    if (rows.length > 0) {
      passwordHash = rows[0].passwd;
    } else {
      randToken = crypto.randomBytes(32).toString("hex");
      passwordHash = randToken;
    }

    try {
      jwt.verify(tokenToVerify, passwordHash); // errors if not valid match
      if (passwordHash === randToken) {
        // to prevent timing attacks etc.
        return false;
      }
      return true;
    } catch {}
    return false;
  } catch (error) {
    console.error("Authentication failed:", error);
    return false;
  }
}

export async function isValidAuthWorker(
  tokenToVerify: string,
): Promise<boolean> {
  const CLUSTER_SECRET = getClusterSecret();
  try {
    jwt.verify(tokenToVerify, CLUSTER_SECRET); // errors if not a valid match
    return true;
  } catch {}
  return false;
}

export async function isValidAuth(
  db: NodePgDatabase,
  tokenToVerify: string,
  username: string | undefined,
) {
  if ((await isValidAuthWorker(tokenToVerify)) === true) {
    return true;
  }

  if (username === undefined) {
    return false;
  }
  if ((await isValidAuthUser(db, tokenToVerify, username)) === true) {
    return true;
  }
  return false;
}

export function isValidSecretToken(
  token: string,
  secrets: (string | undefined)[],
): boolean {
  for (const secret of secrets) {
    try {
      if (secret) {
        jwt.verify(token, secret);
        //console.log("[isValidSecretToken] ✅ Token verified successfully");
        return true;
      }
    } catch (err: any) {
      console.log("[isValidSecretToken] ❌ Verification failed:", err.message);
    }
  }
  return false;
}

export const usernameExistsServer = async (
  db: NodePgDatabase<any>,
  username: string,
): Promise<boolean> => {
  const cleanHash = String(username).trim();

  const result = await db
    .select({ id: documentsTable.file_id })
    .from(documentsTable)
    .where(eq(documentsTable.fileHash, cleanHash))
    .limit(1);

  return result.length > 0;
};

export async function checkUserIsExisting(username: string): Promise<boolean> {
  try {
    const url: string = `${await getApiBaseUrl()}${ApiPaths.checkUserExists}`;
    const res = await fetch(url, {
      headers: getAuthHeader(),
      method: "POST",
      body: JSON.stringify({ username: username }),
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
}

let _cachedToken: string | null = null;
let _tokenExpiresAt = 0;
const TOKEN_TTL_S = 60;

export function getAuthHeader(): Headers {
  const secret =
    process.env.CLUSTER_WORKER_SECRET ?? "celestialisabadplaceholder";
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
