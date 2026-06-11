/**
 * AuthImg — loads images via authenticated fetch so auth headers are always
 * sent explicitly, regardless of SW lifecycle state.
 */
import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../../lib/AppContext";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: React.ReactNode;
  skeletonClass?: string;
}

export default function AuthImg({ src, alt, className, fallback, skeletonClass, style, onLoad, ...rest }: Props) {
  const { getAuthHeaders } = useApp();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "err">("loading");
  const prevSrc = useRef("");
  const blobRef = useRef<string | null>(null);

  useEffect(() => {
    if (!src || src === prevSrc.current) return;
    prevSrc.current = src;
    let dead = false;

    setStatus("loading");
    setBlobUrl(null);

    fetch(src, { headers: getAuthHeaders() })
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.blob(); })
      .then((blob) => {
        if (dead) return;
        if (blobRef.current) URL.revokeObjectURL(blobRef.current);
        const url = URL.createObjectURL(blob);
        blobRef.current = url;
        setBlobUrl(url);
        setStatus("ok");
      })
      .catch(() => { if (!dead) setStatus("err"); });

    return () => { dead = true; };
  }, [src]);

  // Clean up blob URL on unmount
  useEffect(() => () => { if (blobRef.current) URL.revokeObjectURL(blobRef.current); }, []);

  if (status === "loading") {
    return (
      <div className={skeletonClass ?? className} style={{ background: "var(--bg-overlay)", position: "relative", overflow: "hidden", ...(style ?? {}) }}>
        <style>{`@keyframes _authShimmer{to{transform:translateX(200%)}}`}</style>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent 0%,var(--border-accent) 50%,transparent 100%)", animation: "_authShimmer 1.4s infinite", transform: "translateX(-100%)" }} />
      </div>
    );
  }

  if (status === "err") {
    if (fallback !== undefined) return <>{fallback}</>;
    return (
      <div className={className} style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-overlay)", color: "var(--text-muted)", ...(style ?? {}) }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
    );
  }

  return <img src={blobUrl!} alt={alt} className={className} style={style} onLoad={onLoad} {...rest} />;
}
