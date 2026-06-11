import React, { useState, useCallback } from "react";
import { useApp } from "../lib/AppContext";
import Dropzone from "../components/upload/Dropzone";
import styles from "./Upload.module.css";

interface UploadResult {
  filename: string;
  ok: boolean;
  error?: string;
}

// A File that may carry webkitRelativePath
type RichFile = File & { webkitRelativePath?: string };

function getRelativeDir(file: RichFile): string | null {
  const rel = file.webkitRelativePath;
  if (!rel) return null;
  const parts = rel.split("/");
  return parts.length > 2 ? parts.slice(0, -1).join("/") : parts[0];
}

function groupByFolder(files: RichFile[]): Record<string, RichFile[]> {
  const map: Record<string, RichFile[]> = {};
  for (const f of files) {
    const dir = getRelativeDir(f) ?? "";
    if (!map[dir]) map[dir] = [];
    map[dir].push(f);
  }
  return map;
}

export default function Upload() {
  const { t, settings, getAuthHeaders } = useApp();
  const [files, setFiles] = useState<RichFile[]>([]);
  const [uploadDir, setUploadDir] = useState(settings.uploadDir || "");
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const handleAdd = useCallback((added: File[]) => {
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...(added as RichFile[]).filter((f) => !existing.has(f.name + f.size))];
    });
    setResults([]);
  }, []);

  const handleRemove = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setResults([]);
    setProgress(0);
    const newResults: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i] as RichFile;
      const fd = new FormData();
      fd.append("file", file);

      // Determine target directory: explicit override > folder from webkitRelativePath > settings default
      const relDir = getRelativeDir(file);
      const effectiveDir = uploadDir.trim() || relDir || "";
      if (effectiveDir) fd.append("uploadDir", effectiveDir);

      try {
        const res = await fetch(`${settings.serverUrl}/upload/consume`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: fd,
        });
        if (res.ok) {
          newResults.push({ filename: file.name, ok: true });
        } else {
          const body = await res.json().catch(() => ({}));
          newResults.push({
            filename: file.name,
            ok: false,
            error: body?.error ?? `HTTP ${res.status}`,
          });
        }
      } catch (e: any) {
        newResults.push({ filename: file.name, ok: false, error: e.message });
      }
      setProgress(((i + 1) / files.length) * 100);
      setResults([...newResults]);
    }
    setUploading(false);
    if (newResults.every((r) => r.ok)) setFiles([]);
  };

  const successCount = results.filter((r) => r.ok).length;
  const failCount = results.filter((r) => !r.ok).length;

  const groups = groupByFolder(files);
  const folderCount = Object.keys(groups).filter(Boolean).length;
  const hasFolders = folderCount > 0;

  const toggleFolder = (dir: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(dir)) next.delete(dir);
      else next.add(dir);
      return next;
    });
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t.upload.title}</h1>
        <p className={styles.subtitle}>{t.upload.subtitle}</p>
      </div>

      <div className={styles.body}>
        <Dropzone
          files={[]}
          onAdd={handleAdd}
          label={t.upload.dropzone}
          labelActive={t.upload.dropzoneActive}
        />

        {files.length > 0 && (
          <div className={styles.fileList}>
            <div className={styles.fileListHeader}>
              <span>
                {t.upload.selectedFiles} ({files.length})
                {hasFolders && (
                  <span className={styles.folderBadge}>
                    {folderCount} folder{folderCount > 1 ? "s" : ""}
                  </span>
                )}
              </span>
              <button
                className={styles.clearBtn}
                onClick={() => { setFiles([]); setResults([]); }}
              >
                {t.upload.clearAll}
              </button>
            </div>

            {hasFolders ? (
              // Grouped by folder view
              Object.entries(groups).map(([dir, groupFiles]) => {
                const isRoot = !dir;
                const isExpanded = isRoot || expandedFolders.has(dir);
                return (
                  <div key={dir || "__root__"} className={styles.folderGroup}>
                    {!isRoot && (
                      <button
                        className={styles.folderHeader}
                        onClick={() => toggleFolder(dir)}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          style={{ transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                        </svg>
                        <span className={styles.folderName}>{dir}</span>
                        <span className={styles.folderCount}>{groupFiles.length} files</span>
                      </button>
                    )}
                    {isExpanded && groupFiles.map((f, relIdx) => {
                      const idx = files.indexOf(f);
                      const result = results.find((r) => r.filename === f.name);
                      return (
                        <FileRow key={relIdx} file={f} result={result} onRemove={() => handleRemove(idx)} uploading={uploading} isNested={!isRoot} />
                      );
                    })}
                  </div>
                );
              })
            ) : (
              // Flat list
              files.map((f, i) => {
                const result = results.find((r) => r.filename === f.name);
                return (
                  <FileRow key={i} file={f} result={result} onRemove={() => handleRemove(i)} uploading={uploading} isNested={false} />
                );
              })
            )}
          </div>
        )}

        <div className={styles.pathRow}>
          <label className={styles.pathLabel}>{t.upload.uploadPath}</label>
          <input
            className={styles.pathInput}
            type="text"
            placeholder={hasFolders ? "Override folder path (optional)" : t.upload.uploadPathPlaceholder}
            value={uploadDir}
            onChange={(e) => setUploadDir(e.target.value)}
            spellCheck={false}
          />
          {hasFolders && !uploadDir && (
            <p className={styles.pathHint}>
              Folder structure from the dragged directory will be preserved automatically.
            </p>
          )}
        </div>

        {uploading && (
          <div className={styles.progressWrap}>
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />
            <span className={styles.progressLabel}>{Math.round(progress)}%</span>
          </div>
        )}

        {results.length > 0 && !uploading && (
          <div className={`${styles.summary} ${failCount === 0 ? styles.summaryOk : styles.summaryFail}`}>
            {failCount === 0
              ? `✓ ${successCount} ${t.upload.success}`
              : `${successCount} ok · ${failCount} ${t.upload.error}`}
          </div>
        )}

        <button
          className={styles.uploadBtn}
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
        >
          {uploading
            ? t.upload.uploading
            : `${t.upload.uploadBtn} (${files.length})`}
        </button>
      </div>
    </div>
  );
}

function FileRow({
  file,
  result,
  onRemove,
  uploading,
  isNested,
}: {
  file: RichFile;
  result: UploadResult | undefined;
  onRemove: () => void;
  uploading: boolean;
  isNested: boolean;
}) {
  return (
    <div className={`${styles.fileRow} ${isNested ? styles.fileRowNested : ""}`}>
      <span className={styles.fileExt}>
        {file.name.split(".").pop()?.toUpperCase()}
      </span>
      <span className={styles.fileName} title={file.webkitRelativePath || file.name}>
        {file.name}
      </span>
      <span className={styles.fileSize}>
        {file.size >= 1024 * 1024
          ? (file.size / 1024 / 1024).toFixed(1) + " MB"
          : (file.size / 1024).toFixed(0) + " KB"}
      </span>
      {result ? (
        <span className={result.ok ? styles.statusOk : styles.statusFail}>
          {result.ok ? "✓" : `✗ ${result.error}`}
        </span>
      ) : (
        <button
          className={styles.removeBtn}
          onClick={onRemove}
          disabled={uploading}
        >
          ×
        </button>
      )}
    </div>
  );
}
