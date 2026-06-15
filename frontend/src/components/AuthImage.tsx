import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/auth";
import { apiUrlToS3Base, useSettingsStore } from "../store/settings";
import { decryptBlob, decryptFileKey } from "../utils/crypto";
import { handleUnauth } from "../api/client";

interface AuthImageProps {
  src: string;
  encryptedFileKey?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Called once the displayed image has its natural size. */
  onLoad?: (naturalWidth: number, naturalHeight: number) => void;
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
  if (/^https?:\/\//i.test(src)) return src;
  return `${s3Base.replace(/\/$/, "")}/${src.replace(/^\//, "")}`;
}

export default function AuthImage({
  src,
  encryptedFileKey,
  alt = "",
  className,
  style,
  onLoad,
}: AuthImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const prevUrl = useRef<string | null>(null);
  const mainKey = useAuthStore((s) => s.mainEncryptionKey);
  const token = useAuthStore((s) => s.token);
  const username = useAuthStore((s) => s.username);
  const apiBase = useSettingsStore((s) => s.apiUrl);
  const s3Base = apiUrlToS3Base(apiBase);

  useEffect(() => {
    if (!src) return;
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
  }, [src, encryptedFileKey, mainKey, s3Base, token, username]);

  useEffect(
    () => () => {
      if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
    },
    [],
  );

  if (error)
    return (
      <div
        className={className}
        style={{
          ...style,
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
        className={className}
        style={{
          ...style,
          background: "var(--bg-raised)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
    );

  return (
    <img
      src={objectUrl}
      alt={alt}
      className={className}
      style={style}
      draggable={false}
      onLoad={(e) => {
        const img = e.currentTarget;
        onLoad?.(img.naturalWidth, img.naturalHeight);
      }}
    />
  );
}
