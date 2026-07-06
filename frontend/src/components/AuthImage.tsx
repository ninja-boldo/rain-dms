import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/auth";
import { apiUrlToS3Base, useSettingsStore } from "../store/settings";
import { decryptBlob, decryptFileKey } from "../utils/crypto";
import { applyUrlSubstitutions } from "../utils/urlSubstitution";
import { handleUnauth } from "../api/client";

interface AuthImageProps {
  src: string;
  encryptedFileKey?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Called once the displayed image has its natural size. */
  onLoad?: (naturalWidth: number, naturalHeight: number) => void;
  /** Skip the viewport check and fetch immediately — for images already known to be visible (e.g. the open document viewer). */
  eager?: boolean;
}

/** Detect MIME type from decrypted bytes (magic bytes) or filename fallback. */
function detectMime(bytes: Uint8Array, hintUrl: string): string {
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
    return "image/webp";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return "image/jpeg";
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return "image/png";
  const inner = hintUrl.replace(/\.enc$/i, "");
  const ext = inner.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    webp: "image/webp",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
  };
  return map[ext] ?? "image/jpeg";
}

/**
 * Turn any banner / s3 path into a fetchable URL.
 *  - Absolute http(s) URLs are returned as-is.
 *  - Relative paths like "app/temp/.../page.webp" are routed to the nginx
 *    /s3/banner-imgs/ proxy so the browser never has to talk to SeaweedFS.
 */
function resolveUrl(src: string, s3Base: string): string {
  if (!src) return src;
  if (/^https?:\/\//i.test(src)) return applyUrlSubstitutions(src);
  return applyUrlSubstitutions(
    `${s3Base.replace(/\/$/, "")}/${src.replace(/^\//, "")}`,
  );
}

export default function AuthImage({
  src,
  encryptedFileKey,
  alt = "",
  className,
  style,
  onLoad,
  eager = false,
}: AuthImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const prevUrl = useRef<string | null>(null);
  const mainKey = useAuthStore((s) => s.mainEncryptionKey);
  const token = useAuthStore((s) => s.token);
  const username = useAuthStore((s) => s.username);
  const apiBase = useSettingsStore((s) => s.apiUrl);
  const s3Base = apiUrlToS3Base(apiBase);
  // Re-run the fetch whenever substitutions change so accepting the
  // one-time CORS-fix prompt immediately repairs already-broken images.
  const urlSubstitutions = useSettingsStore((s) => s.urlSubstitutions);

  // Lazy-mount: don't even attempt the authenticated fetch+decrypt until the
  // placeholder actually scrolls near the viewport. Search/grid/tree views
  // can have hundreds of thumbnails on screen at once — firing every fetch
  // immediately was both slow and, under load, made images look permanently
  // "stuck" mid-load. rootMargin gives a head start so images are usually
  // ready by the time they're actually visible.
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(eager);

  useEffect(() => {
    if (eager || inView) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [eager, inView]);

  useEffect(() => {
    if (!src || !inView) return;
    let cancelled = false;

    async function load() {
      setError(false);
      try {
        const url = resolveUrl(src, s3Base);

        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = token;
        if (username) {
          headers["X-Username"] = username;
          headers["username"] = username;
        }

        const res = await fetch(url, { headers });
        if (!res.ok) {
          handleUnauth(res.status);
          throw new Error(`HTTP ${res.status} for ${url}`);
        }

        let buffer = await res.arrayBuffer();

        if (encryptedFileKey && mainKey) {
          try {
            const fileKeyHex = await decryptFileKey(encryptedFileKey, mainKey);
            buffer = await decryptBlob(buffer, fileKeyHex);
          } catch (e) {
            console.warn("[AuthImage] decryption failed:", e, { src });
          }
        }

        if (cancelled) return;

        const decrypted = new Uint8Array(buffer);
        const mime = detectMime(decrypted, src);
        const blob = new Blob([buffer], { type: mime });
        const blobUrl = URL.createObjectURL(blob);

        if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
        prevUrl.current = blobUrl;
        setObjectUrl(blobUrl);
      } catch (e) {
        console.warn("[AuthImage] load failed:", e, { src });
        if (!cancelled) setError(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [
    src,
    inView,
    encryptedFileKey,
    mainKey,
    s3Base,
    token,
    username,
    urlSubstitutions,
  ]);

  useEffect(
    () => () => {
      if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
    },
    [],
  );

  if (error)
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          ...style,
          minHeight: (style as any)?.minHeight ?? "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-raised)",
          color: "var(--text-3)",
          fontSize: "0.7rem",
        }}
      >
        —
      </div>
    );

  if (!objectUrl)
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          ...style,
          minHeight:
            (style as any)?.minHeight ?? (style as any)?.height ?? "100%",
          minWidth: (style as any)?.minWidth ?? (style as any)?.width,
          background: "var(--bg-raised)",
          animation: inView
            ? "authimg-shimmer 1.6s linear infinite"
            : undefined,
          backgroundImage: inView
            ? "linear-gradient(90deg, var(--bg-raised) 0%, var(--bg-hover) 50%, var(--bg-raised) 100%)"
            : undefined,
          backgroundSize: "200% 100%",
        }}
      />
    );

  return (
    <img
      ref={containerRef as any}
      src={objectUrl}
      alt={alt}
      className={className}
      style={style}
      draggable={false}
      loading="lazy"
      decoding="async"
      onLoad={(e) => {
        const img = e.currentTarget;
        onLoad?.(img.naturalWidth, img.naturalHeight);
      }}
    />
  );
}
