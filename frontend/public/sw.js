/**
 * rain.dms service worker — v1.5.0
 * Injects Authorization + X-Username on all authenticated backend paths.
 */
const SW_VERSION = "1.5.0";

let authToken = null;
let authUsername = null;

self.addEventListener("message", (event) => {
  const { type, token, username } = event.data ?? {};
  if (type === "SET_AUTH") {
    authToken = token ?? null;
    authUsername = username ?? null;
  } else if (type === "CLEAR_AUTH") {
    authToken = null;
    authUsername = null;
  } else if (type === "PING") {
    event.ports[0]?.postMessage({ type: "PONG", version: SW_VERSION });
  }
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

const PUBLIC_PATHS = new Set([
  "/auth/signin",
  "/auth/signup",
  "/auth/validate-jwt",
  "/stats",
  "/worker-download-stats",
]);

const BACKEND_PREFIXES = [
  "/s3/",
  "/auth/",
  "/main_page",
  "/search",
  "/pages",
  "/upload",
  "/download",
  "/delete/",
  "/stats",
  "/workers",
  "/dashboard",
  "/queue-peek",
  "/worker-download-stats",
  "/tags",
  "/document",
  "/check/",
];

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const path = url.pathname;

  const isBackend = BACKEND_PREFIXES.some((p) => path.startsWith(p));
  if (!isBackend) return;
  if (PUBLIC_PATHS.has(path)) return;
  if (!authToken) return;

  event.respondWith(
    (async () => {
      const headers = new Headers(event.request.headers);
      headers.set("x-auth-token", authToken);
      headers.set("Authorization", authToken);
      headers.set("username", authUsername ?? "");
      headers.set("X-Username", authUsername ?? "");

      const mode = event.request.mode === "no-cors" ? "cors" : event.request.mode;
      const init = {
        headers,
        method: event.request.method,
        mode,
        credentials: event.request.credentials,
        cache: event.request.cache,
        redirect: event.request.redirect,
        referrer: event.request.referrer,
        referrerPolicy: event.request.referrerPolicy,
        integrity: event.request.integrity,
        keepalive: event.request.keepalive,
        signal: event.request.signal,
      };
      if (!["GET", "HEAD"].includes(event.request.method)) {
        init.body = event.request.body;
        init.duplex = event.request.duplex ?? "half";
      }
      return fetch(new Request(event.request.url, init));
    })(),
  );
});
