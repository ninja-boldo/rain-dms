import React, { useCallback, useRef, useState } from "react";
import styles from "./Dropzone.module.css";

const ACCEPTED_EXTS = [".pdf", ".png", ".jpg", ".jpeg"];
const ACCEPTED_MIME = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "application/octet-stream"];

function isAccepted(file: File): boolean {
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  if (ACCEPTED_EXTS.includes(ext)) return true;
  if (ACCEPTED_MIME.includes(file.type)) return true;
  return false;
}

// Recursively traverse a FileSystemDirectoryEntry
async function traverseEntry(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile) {
    return new Promise((res) => {
      (entry as FileSystemFileEntry).file(
        (f) => res(isAccepted(f) ? [f] : []),
        () => res([]),
      );
    });
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const allEntries: FileSystemEntry[] = [];
    await new Promise<void>((res) => {
      function readBatch() {
        reader.readEntries((batch) => {
          if (!batch.length) return res();
          allEntries.push(...batch);
          readBatch();
        }, () => res());
      }
      readBatch();
    });
    const nested = await Promise.all(allEntries.map(traverseEntry));
    return nested.flat();
  }
  return [];
}

interface Props {
  files: File[];
  onAdd: (files: File[]) => void;
  label: string;
  labelActive: string;
}

export default function Dropzone({ files, onAdd, label, labelActive }: Props) {
  const [dragging, setDragging] = useState(false);
  const [draggingFolder, setDraggingFolder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      setDraggingFolder(false);

      // Use DataTransferItem API for folder support
      const items = Array.from(e.dataTransfer.items);
      const hasFolder = items.some((item) => {
        const entry = item.webkitGetAsEntry?.();
        return entry?.isDirectory;
      });

      if (hasFolder) {
        const allFiles: File[] = [];
        for (const item of items) {
          const entry = item.webkitGetAsEntry?.();
          if (entry) {
            const found = await traverseEntry(entry);
            allFiles.push(...found);
          }
        }
        if (allFiles.length) onAdd(allFiles);
      } else {
        const dropped = Array.from(e.dataTransfer.files).filter(isAccepted);
        if (dropped.length) onAdd(dropped);
      }
    },
    [onAdd],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Detect if dragging contains a directory
    const hasFolder = Array.from(e.dataTransfer.items).some((item) => {
      const entry = item.webkitGetAsEntry?.();
      return entry?.isDirectory;
    });
    setDragging(true);
    setDraggingFolder(hasFolder);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(isAccepted);
      if (selected.length) onAdd(selected);
      e.target.value = "";
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(isAccepted);
      if (selected.length) onAdd(selected);
      e.target.value = "";
    }
  };

  const isActive = dragging;
  const activeLabel = draggingFolder ? "Drop folder to upload" : labelActive;

  return (
    <div
      className={`${styles.zone} ${isActive ? styles.dragging : ""} ${draggingFolder ? styles.draggingFolder : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={() => { setDragging(false); setDraggingFolder(false); }}
      onDrop={handleDrop}
      role="region"
      aria-label="File drop zone"
    >
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTS.join(",")}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore — webkitdirectory is not in standard TS types
        webkitdirectory=""
        multiple
        style={{ display: "none" }}
        onChange={handleFolderChange}
      />

      <div className={styles.icon}>
        {draggingFolder ? (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
          </svg>
        ) : (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        )}
      </div>

      <p className={styles.label}>{isActive ? activeLabel : label}</p>
      <p className={styles.hint}>PDF · PNG · JPEG</p>

      <div className={styles.btnRow}>
        <button
          type="button"
          className={styles.browseBtn}
          onClick={() => fileInputRef.current?.click()}
        >
          Browse Files
        </button>
        <button
          type="button"
          className={`${styles.browseBtn} ${styles.browseBtnFolder}`}
          onClick={() => folderInputRef.current?.click()}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
          </svg>
          Browse Folder
        </button>
      </div>
    </div>
  );
}
