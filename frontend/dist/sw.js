/**
 * rain.dms service worker — v1.4.0
 * Injects Authorization + X-Username on all authenticated backend paths.
 */

/// <reference lib="webworker" />

const SW_VERSION = "1.4.0";

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

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only intercept same-origin backend paths
  const isS3Path = url.pathname.startsWith("/s3/");

  const isBackendPath =
    url.pathname.startsWith("/auth/") ||
    isS3Path ||
    url.pathname.startsWith("/main_page") ||
    url.pathname.startsWith("/search") ||
    url.pathname.startsWith("/pages") ||
    url.pathname.startsWith("/upload/") ||
    url.pathname.startsWith("/download/") ||
    url.pathname.startsWith("/delete/") ||
    url.pathname.startsWith("/stats") ||
    url.pathname.startsWith("/workers") ||
    url.pathname.startsWith("/queue-peek") ||
    url.pathname.startsWith("/worker-download-stats");

  if (!isBackendPath) return;

  const publicPaths = [
    "/auth/signin",
    "/auth/signup",
    "/auth/validate-jwt",
    "/stats",
    "/worker-download-stats",
  ];
  if (publicPaths.some((p) => url.pathname === p)) return;
  if (!authToken) return;

  event.respondWith(
    (async () => {
      const originalHeaders = new Headers(event.request.headers);
      originalHeaders.set("Authorization", authToken);
      originalHeaders.set("username", authUsername ?? "");
      originalHeaders.set("X-Username", authUsername ?? ""); // both casings for compat

      // Upgrade no-cors → cors so custom headers are allowed on image requests
      const targetMode =
        event.request.mode === "no-cors" ? "cors" : event.request.mode;

      const requestInit = {
        headers: originalHeaders,
        method: event.request.method,
        mode: targetMode,
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
        requestInit.body = event.request.body;
        requestInit.duplex = event.request.duplex ?? "half";
      }

      return fetch(new Request(event.request.url, requestInit));
    })(),
  );
});
