import React, { useState } from "react";
import { useApp } from "../lib/AppContext";
import Dropzone from "../components/upload/Dropzone";
// @ts-ignore - CSS module type declarations are not available in this project setup
import styles from "./Upload.module.css";

type Status = "idle" | "uploading" | "success" | "error";

export default function Upload() {
  const { t, settings } = useApp();
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"consume" | "temp">("consume");

  const addFiles = (newFiles: File[]) => {
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...newFiles.filter((f) => !existing.has(f.name))];
    });
    setStatus("idle");
  };

  const removeFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleUpload = async () => {
    if (!files.length) return;
    setStatus("uploading");
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("file", f));

      const endpoint = mode === "consume" ? "/upload/consume" : "/upload/temp";
      const res = await fetch(`${settings.serverUrl}${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setStatus("success");
        setMessage(
          `${data.count} Datei${data.count !== 1 ? "en" : ""} erfolgreich hochgeladen`,
        );
        setFiles([]);
      } else {
        const err = await res.text();
        setStatus("error");
        setMessage(`Fehler: ${err}`);
      }
    } catch (e: any) {
      setStatus("error");
      setMessage(`Fehler: ${e.message}`);
    }
  };

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

      <Dropzone
        files={files}
        onAdd={addFiles}
        label={t.upload.dropzone}
        labelActive={t.upload.dropzoneActive}
      />

      {files.length > 0 && (
        <div className={styles.fileList}>
          <div className={styles.fileListHeader}>
            <span className={styles.fileCount}>
              {files.length} {t.upload.selectedFiles}
            </span>
            <button className={styles.clearAll} onClick={() => setFiles([])}>
              {t.upload.clearAll}
            </button>
          </div>
          {files.map((f, i) => (
            <div key={i} className={styles.fileRow}>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{f.name}</span>
                <span className={styles.fileSize}>
                  {(f.size / 1024).toFixed(0)} KB
                </span>
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
            <span className={styles.spinner} /> Wird hochgeladen...
          </>
        ) : (
          `${files.length > 0 ? files.length + " Datei" + (files.length !== 1 ? "en" : "") + " " : ""}hochladen`
        )}
      </button>
    </div>
  );
}
