import React, { useCallback, useRef, useState } from "react";
import styles from "./Dropzone.module.css";

const ACCEPTED = ["application/pdf", "image/png", "image/jpeg"];
const ACCEPTED_EXT = [".pdf", ".png", ".jpg", ".jpeg"];

interface Props {
  files: File[];
  onAdd: (files: File[]) => void;
  label: string;
  labelActive: string;
}

export default function Dropzone({ files, onAdd, label, labelActive }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = Array.from(e.dataTransfer.files).filter((f) =>
        ACCEPTED.includes(f.type),
      );
      if (dropped.length) onAdd(dropped);
    },
    [onAdd],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      onAdd(selected);
      e.target.value = "";
    }
  };

  return (
    <div
      className={`${styles.zone} ${dragging ? styles.dragging : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXT.join(",")}
        style={{ display: "none" }}
        onChange={handleChange}
      />

      <div className={styles.icon}>
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>

      <p className={styles.label}>{dragging ? labelActive : label}</p>
      <p className={styles.hint}>PDF · PNG · JPEG</p>

      {files.length > 0 && (
        <div className={styles.filePills}>
          {files.map((f, i) => (
            <span key={i} className={styles.pill}>
              {f.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
