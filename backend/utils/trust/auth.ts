import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { documentsTable, usersTable } from "../../db/schema";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import jwt, { sign } from "jsonwebtoken";
import {
  getApiBaseUrl,
  getClusterSecret,
  getIsDebugAuthEnabled,
} from "./envHelpers";
import { ApiPaths } from "../types/main";
import type { Context } from "hono";

type BlankEnv = Record<string, any>;

export async function isValidAuthUser(
  db: NodePgDatabase,
  tokenToVerify: string,
  username: string | null,
): Promise<boolean> {
  if (username === null) {
    if (getIsDebugAuthEnabled())
      console.log("[AUTH-DEBUG] User validation failed: Username is null.");
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
        if (getIsDebugAuthEnabled()) {
          console.log(
            `[AUTH-DEBUG] User validation failed: User '${username}' not found in DB. Timing attack mitigation triggered.`,
          );
        }
        return false;
      }
      if (getIsDebugAuthEnabled())
        console.log(`[AUTH-DEBUG] User validation succeeded for: ${username}`);
      return true;
    } catch (jwtError: any) {
      if (getIsDebugAuthEnabled()) {
        console.error(
          `[AUTH-DEBUG] User JWT Verification failed for '${username}':`,
          jwtError.message,
        );
      }
    }
    return false;
  } catch (error) {
    console.error(
      "Authentication failed due to database or structural execution failure:",
      error,
    );
    return false;
  }
}

export async function isValidAuthWorker(
  tokenToVerify: string,
): Promise<boolean> {
  const CLUSTER_SECRET = getClusterSecret();

  if (getIsDebugAuthEnabled()) {
    console.log("[AUTH-DEBUG] Starting Worker Validation...");
    console.log("[AUTH-DEBUG] Token Payload provided:", tokenToVerify);
    console.log(
      "[AUTH-DEBUG] Active Cluster Secret length:",
      CLUSTER_SECRET ? CLUSTER_SECRET.length : 0,
    );
  }

  try {
    jwt.verify(tokenToVerify, CLUSTER_SECRET); // errors if not a valid match
    if (getIsDebugAuthEnabled())
      console.log(
        "[AUTH-DEBUG] Worker Token validation verified successfully.",
      );
    return true;
  } catch (jwtError: any) {
    if (getIsDebugAuthEnabled()) {
      console.error(
        "[AUTH-DEBUG] Worker JWT Verification failed outright! Reason:",
        jwtError.message,
      );

      // Additional sanity troubleshooting check for token payloads
      try {
        const decoded = jwt.decode(tokenToVerify);
        console.error(
          "[AUTH-DEBUG] Malformed Token Payload Breakdown:",
          decoded,
        );
      } catch {
        console.error(
          "[AUTH-DEBUG] Failed to even decode string framework safely.",
        );
      }
    }
  }
  return false;
}

export async function isValidAuth(
  db: NodePgDatabase,
  tokenToVerify: string,
  username: string | null,
) {
  if ((await isValidAuthWorker(tokenToVerify)) === true) {
    return true;
  }

  if (username === null) {
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
    .select({ id: usersTable.username })
    .from(usersTable)
    .where(eq(usersTable.username, username))
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

export function getAuthTokenFromReq(c: Context<BlankEnv, "*", any>): string {
  let token = c.req.header("X-Auth-Token") ?? c.req.header("Authorization");

  if (!token) {
    throw Error("couldnt find a valid auth header");
  }

  token = token.replace(/^bearer\s+/i, "");
  return token;
}

export function getUsernameFromReq(
  c: Context<BlankEnv, "*", any>,
): string | null {
  const username = c.req.header("X-Username") ?? c.req.header("username");
  return username === undefined ? null : username;
}

export function getUserIdFromAuthToken(token: string): number {
  const payload = jwt.decode(token) as {
    role: string;
    userId: string;
  };

  return parseInt(payload.userId);
}

export function getUserIdFromReq(c: Context<BlankEnv, "*", any>): number {
  const token: string = getAuthTokenFromReq(c);
  return getUserIdFromAuthToken(token);
}

let _cachedToken: string | null = null;
let _tokenExpiresAt = 0;

const TOKEN_TTL_S = 600;

export function getAuthHeader(): Headers {
  const secret = getClusterSecret();
  const now = Math.floor(Date.now() / 1000);

  if (!_cachedToken || now >= _tokenExpiresAt - 60) {
    _tokenExpiresAt = now + TOKEN_TTL_S;
    const newToken: string = sign(
      {
        iat: now,
        exp: _tokenExpiresAt,
        role: "worker",
        iss: "rain-dms-watcher",
      },
      secret,
    );

    _cachedToken = newToken;
  }

  const h = new Headers();
  h.append("Authorization", `Bearer ${_cachedToken}`);
  return h;
}
