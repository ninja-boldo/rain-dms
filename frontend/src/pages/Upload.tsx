import React, { useState, useRef } from "react";
import { useApp } from "../lib/AppContext";
import styles from "./Upload.module.css";

type Status = "idle" | "uploading" | "success" | "error";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];
const ALLOWED_EXT = /\.(pdf|png|jpg|jpeg|webp)$/i;

function isAllowedFile(f: File): boolean {
  return ALLOWED_TYPES.includes(f.type) || ALLOWED_EXT.test(f.name);
}

export default function Upload() {
  const { t, settings, getAuthHeaders } = useApp();
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"consume" | "temp">("consume");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: File[]) => {
    const valid = newFiles.filter(isAllowedFile);
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...valid.filter((f) => !existing.has(f.name + f.size))];
    });
    setStatus("idle");
    if (valid.length < newFiles.length) {
      const skipped = newFiles.length - valid.length;
      setMessage(
        `${skipped} Datei${skipped !== 1 ? "en" : ""} übersprungen (nur PDF, PNG, JPEG erlaubt)`,
      );
      setStatus("error");
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    }
  };

  const removeFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const items = Array.from(e.dataTransfer.files);
    addFiles(items);
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setStatus("uploading");
    setMessage("");
    try {
      const formData = new FormData();

      files.forEach((f) => formData.append("file", f));
      const endpoint = mode === "consume" ? "/upload/consume" : "/upload/temp";
      const res = await fetch(`${settings.serverUrl}${endpoint}`, {
        method: "POST",
        body: formData,
        headers: getAuthHeaders(),
      });
      console.warn(`res: ${res}`);

      if (res.ok) {
        const data = await res.json();
        setStatus("success");
        setMessage(
          `${data.count} Datei${data.count !== 1 ? "en" : ""} erfolgreich hochgeladen`,
        );
        setFiles([]);
      } else {
        const errText = await res.text();
        setStatus("error");
        setMessage(`Fehler ${res.status}: ${errText || res.statusText}`);
      }
    } catch (e: any) {
      setStatus("error");
      setMessage(`Netzwerkfehler: ${e.message} — Server erreichbar?`);
    }
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);
  const fmtSize = (bytes: number) =>
    bytes > 1024 * 1024
      ? (bytes / 1024 / 1024).toFixed(1) + " MB"
      : (bytes / 1024).toFixed(0) + " KB";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t.upload.title}</h1>
        <p className={styles.subtitle}>{t.upload.subtitle}</p>
      </header>

      {/* Mode selector */}
      <div className={styles.modeRow}>
        <button
          className={`${styles.modeBtn} ${mode === "consume" ? styles.modeBtnActive : ""}`}
          onClick={() => setMode("consume")}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          In Archiv aufnehmen
        </button>
        <button
          className={`${styles.modeBtn} ${mode === "temp" ? styles.modeBtnActive : ""}`}
          onClick={() => setMode("temp")}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Temporär (temp/)
        </button>
      </div>

      {/* Drop zone */}
      <div
        className={`${styles.dropzone} ${dragging ? styles.dropzoneActive : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--accent)", opacity: 0.8 }}
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className={styles.dropzoneLabel}>
          {dragging ? t.upload.dropzoneActive : t.upload.dropzone}
        </p>
        <p className={styles.dropzoneHint}>PDF · PNG · JPEG</p>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          style={{ display: "none" }}
          onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
          onClick={(e) => e.stopPropagation()}
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore — webkitdirectory is not in the standard types
          webkitdirectory=""
          multiple
          style={{ display: "none" }}
          onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Folder upload button separate */}
      <div className={styles.altUploadRow}>
        <button
          className={styles.folderBtn}
          onClick={(e) => {
            e.stopPropagation();
            folderInputRef.current?.click();
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Ordner hochladen
        </button>
        <span className={styles.altHint}>
          Alle PDFs, PNGs und JPEGs im Ordner werden hinzugefügt
        </span>
      </div>

      {files.length > 0 && (
        <div className={styles.fileList}>
          <div className={styles.fileListHeader}>
            <span className={styles.fileCount}>
              {files.length} {t.upload.selectedFiles} · {fmtSize(totalSize)}
            </span>
            <button className={styles.clearAll} onClick={() => setFiles([])}>
              {t.upload.clearAll}
            </button>
          </div>
          <div className={styles.fileRows}>
            {files.map((f, i) => (
              <div key={i} className={styles.fileRow}>
                <div className={styles.fileInfo}>
                  <span className={styles.fileExt}>
                    {f.name.split(".").pop()?.toUpperCase()}
                  </span>
                  <span className={styles.fileName}>{f.name}</span>
                  <span className={styles.fileSize}>{fmtSize(f.size)}</span>
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeFile(i)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === "success" && (
        <div className={styles.successMsg}>{message}</div>
      )}
      {status === "error" && <div className={styles.errorMsg}>{message}</div>}

      <button
        className={styles.uploadBtn}
        disabled={!files.length || status === "uploading"}
        onClick={handleUpload}
      >
        {status === "uploading" ? (
          <>
            <span className={styles.spinner} /> Wird hochgeladen…
          </>
        ) : (
          `${files.length > 0 ? `${files.length} Datei${files.length !== 1 ? "en" : ""} ` : ""}hochladen`
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
