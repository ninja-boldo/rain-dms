import { PermanentFailureError } from "../helperClasses/QueueConnector";

const ip = require("ip");
const dockerHostnames: string[] = ["nginx"];

let BASE_API_URL: string | null = null;
let isDockerNetAccessible: boolean | null = null;
let isLanAccessible: boolean | null = null;

export function getEncryptAtRestIsTrue(): boolean {
  const ENCRYPT_AT_REST = process.env.ENCRYPT_AT_REST;
  if (ENCRYPT_AT_REST === undefined) {
    throw Error("the ENCRYPT_AT_REST env var doesnt seem to be set/loaded");
  }
  if (ENCRYPT_AT_REST.trim() === "false") {
    return false;
  }
  return true; // default to do encryption
}

export function getMainEncryptionKey(): string {
  // this is meant to encrypt all file keys while not being able to be used
  // as access token
  const MAIN_ENCRYPTION_KEY = process.env.MAIN_ENCRYPTION_KEY;
  if (MAIN_ENCRYPTION_KEY === undefined) {
    throw Error("the MAIN_ENCRYPTION_KEY env var doesnt seem to be set/loaded");
  }
  return MAIN_ENCRYPTION_KEY;
}

export function getClusterSecret(): string {
  const CLUSTER_SECRET = process.env.CLUSTER_WORKER_SECRET;
  if (CLUSTER_SECRET === undefined) {
    throw Error(
      "the CLUSTER_WORKER_SECRET env var doesnt seem to be set/loaded",
    );
  }
  return CLUSTER_SECRET;
}

export function getServerIp(): string {
  const SERVER_IP = process.env.SERVER_IP;
  if (SERVER_IP === undefined) {
    throw Error("the SERVER_IP env var doesnt seem to be set/loaded");
  }
  return SERVER_IP;
}

export function getNginxPort(): string {
  const NGINX_PORT = process.env.NGINX_PORT;
  if (NGINX_PORT === undefined) {
    throw Error("the NGINX_PORT env var doesnt seem to be set/loaded");
  }
  return NGINX_PORT;
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

function isLocalUrl(urlString: string) {
  try {
    const myUrl = new URL(urlString);

    // Extract hostname (this removes https://, ports, and paths)
    const hostname = myUrl.hostname.trim().toLowerCase();

    // check hostname / ip
    let isPrivateIp: boolean = false;
    try {
      isPrivateIp = ip.isPrivate(hostname);
    } catch {}
    const isTrustedHostname = dockerHostnames.includes(hostname);

    return isPrivateIp === true || isTrustedHostname === true;
  } catch (error) {
    console.warn("got this error: ", error);
    // If the string isn't a valid URL, handling the error gracefully
    return false;
  }
}

export async function isServerTrusted(
  BASE_URL: string,
  verbose: boolean = false,
  errorOnNonLocal: boolean = true,
): Promise<boolean> {
  if (errorOnNonLocal === true && isLocalUrl(BASE_URL) === false) {
    console.error(`the base url doesnt seem to be local: ${BASE_URL}`);
    return false;
  }

  const uuidString = process.env.SERVER_IDENT_HEX_STRING;
  if (uuidString === undefined) {
    console.error(
      "you gotta set the SERVER_IDENT_HEX_STRING in the .env to make sure you com with the correct server",
    );
    return false;
  }

  const urlIdent: string = `${BASE_URL}/identify/self`;

  if (verbose === true)
    console.log(`urlBase: ${BASE_URL}, urlIdent: ${urlIdent}`);

  try {
    const resIdent = await fetch(urlIdent);

    if (!resIdent.ok) {
      console.error(`Server returned an error status: ${resIdent.status}`);
      return false;
    }

    let data: { status: string; identity: string; hex: string };
    try {
      data = await resIdent.json();
    } catch (jsonError) {
      console.error("Server responded, but payload was not valid JSON");
      return false;
    }

    if (data.status !== "ok" || data.hex !== uuidString) {
      console.error(
        "the identity url check failed and this probably isnt the right server you wanted to com with.",
        "\nExpected Hex:",
        uuidString,
        "\nReceived Payload:",
        data,
      );
      return false;
    }

    if (verbose === true)
      console.log("🚀 Server identity verified successfully!");
    return true;
  } catch (error) {
    throw new PermanentFailureError(
      `Failed to connect or communicate with Nginx: ${error}`,
    );
  }
}

export async function getNginxBaseUrl(
  forceNonLocalNoChecks: boolean = false,
): Promise<string> {
  if (BASE_API_URL !== null) {
    return BASE_API_URL;
  }
  const dockerIp: string = "nginx"; // to ensure intra docker net resolution
  const lanIp: string = getServerIp();
  const lanNginxPort: string = getNginxPort();

  const dockerUrl: string = `https://${dockerIp}:443`;
  const lanUrl: string = `https://${lanIp}:${lanNginxPort}`;
  if (forceNonLocalNoChecks === true) {
    return lanUrl;
  }

  isDockerNetAccessible =
    isDockerNetAccessible === null
      ? await isUrlAccessible(dockerUrl)
      : isDockerNetAccessible;
  isLanAccessible =
    isLanAccessible === null ? await isUrlAccessible(lanUrl) : isLanAccessible; // dont send lan request if not needed

  if (isDockerNetAccessible === true) {
    BASE_API_URL = dockerUrl;
  } else if (isLanAccessible === true) {
    BASE_API_URL = lanUrl;
  } else {
    throw new PermanentFailureError(
      `neither the local docker url: ${dockerUrl} nor the lan url: ${lanUrl} are accessible. Are you connected to at least one of these networks?`,
    );
  }
  return BASE_API_URL;
}

export async function getApiBaseUrl(): Promise<string> {
  const nginxUrl: string = await getNginxBaseUrl();
  return `${nginxUrl}/api`;
}

async function isUrlAccessible(url: string) {
  try {
    const res = await fetch(url, { method: "HEAD" });

    if (!res.ok) {
      console.warn(`[URL CHECK FAILED] ${url}`, {
        status: res.status,
        statusText: res.statusText,
      });
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[URL CHECK ERROR] ${url}`, err);
    return false;
  }
}
