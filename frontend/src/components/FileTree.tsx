import { useNavigate } from "react-router-dom";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { CSSProperties } from "react";
import type { Document } from "../api/client";
import { deleteDocument } from "../api/client";
import { reportSuccess } from "../store/toast";
import { useI18n } from "../i18n";

export type FileTreeSortKey =
  | "alpha"
  | "name_asc"
  | "date_desc"
  | "date_asc"
  | "pages_desc";

/* ── types ─────────────────────────────────────────────────────────────────── */

interface TreeNode {
  name: string;
  fullPath: string;
  children: Map<string, TreeNode>;
  doc?: Document;
  isSimulated?: boolean;
  docCount: number; // recursive leaf count, set in buildTagTree
}

/* ── build tag tree ─────────────────────────────────────────────────────────── */

function buildTagTree(docs: Document[], simPaths: string[]): TreeNode {
  const root: TreeNode = {
    name: "",
    fullPath: "",
    children: new Map(),
    docCount: 0,
  };

  for (const doc of docs) {
    if (!doc?.fileS3Key) continue;
    const tags = doc.assigned_tags?.length ? doc.assigned_tags : ["Untagged"];
    let node = root;
    for (let i = 0; i < tags.length; i++) {
      const t = tags[i];
      if (!node.children.has(t)) {
        node.children.set(t, {
          name: t,
          fullPath: tags.slice(0, i + 1).join("/"),
          children: new Map(),
          docCount: 0,
        });
      }
      node = node.children.get(t)!;
    }
    const leafKey = `__doc__${doc.fileS3Key}`;
    node.children.set(leafKey, {
      name: cleanFileName(doc.fileS3Key.split("/").pop() ?? doc.fileS3Key),
      fullPath: doc.fileS3Key,
      children: new Map(),
      doc,
      docCount: 1,
    });
  }

  for (const path of simPaths) {
    const parts = path
      .split("/")
      .map((p) => p.trim())
      .filter(Boolean);
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (!node.children.has(p)) {
        node.children.set(p, {
          name: p,
          fullPath: parts.slice(0, i + 1).join("/"),
          children: new Map(),
          isSimulated: true,
          docCount: 0,
        });
      }
      node = node.children.get(p)!;
    }
  }

  // Compute recursive docCounts bottom-up
  function countDocs(n: TreeNode): number {
    if (n.doc) return 1;
    let sum = 0;
    for (const c of n.children.values()) sum += countDocs(c);
    n.docCount = sum;
    return sum;
  }
  countDocs(root);

  return root;
}

/* ── helpers ────────────────────────────────────────────────────────────────── */

function cleanFileName(name: string): string {
  return name
    .replace(
      /-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}(\.[^.]+)$/i,
      "$1",
    )
    .replace(
      /-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[\.\dZ]*(\.[^.]+)$/i,
      "$1",
    );
}

function compareBySort(a: Document, b: Document, key: FileTreeSortKey): number {
  switch (key) {
    case "alpha":
    case "name_asc":
      return cleanFileName(a.fileS3Key).localeCompare(
        cleanFileName(b.fileS3Key),
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        },
      );
    case "date_desc":
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case "date_asc":
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    case "pages_desc":
      return (b.page_count ?? 0) - (a.page_count ?? 0);
  }
}

const smallBtn: CSSProperties = {
  background: "none",
  border: "1px solid var(--border-soft)",
  borderRadius: 4,
  cursor: "pointer",
  color: "var(--text-3)",
  fontSize: "0.66rem",
  padding: "2px 7px",
  whiteSpace: "nowrap",
  fontFamily: "JetBrains Mono, monospace",
};

function loadTodo(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem("rain-dms-todo") ?? "[]"));
  } catch {
    return new Set();
  }
}
function saveTodo(s: Set<string>) {
  localStorage.setItem("rain-dms-todo", JSON.stringify([...s]));
}

/* ── NodeRow ────────────────────────────────────────────────────────────────── */

interface NodeRowProps {
  node: TreeNode;
  depth: number;
  todo: Set<string>;
  onToggleTodo: (path: string) => void;
  filter: string;
  sortKey: FileTreeSortKey;
  pathFilter: string;
  selectedPath: string | null;
  onSelect: (doc: Document | null) => void;
  openSet: Set<string>;
  onToggleOpen: (path: string) => void;
  pickMode: boolean;
  picked: Set<string>;
  onTogglePick: (key: string) => void;
}

function nodeMatchesFilter(node: TreeNode, filter: string): boolean {
  if (!filter) return true;
  const f = filter.toLowerCase();
  if (node.name.toLowerCase().includes(f)) return true;
  if (node.doc?.fileS3Key.toLowerCase().includes(f)) return true;
  for (const c of node.children.values())
    if (nodeMatchesFilter(c, filter)) return true;
  return false;
}

function nodeMatchesPathFilter(node: TreeNode, q: string): boolean {
  if (!q) return true;
  const f = q.toLowerCase();
  if (node.doc?.fileS3Key.toLowerCase().includes(f)) return true;
  for (const c of node.children.values())
    if (nodeMatchesPathFilter(c, f)) return true;
  return false;
}

function NodeRow({
  node,
  depth,
  todo,
  onToggleTodo,
  filter,
  sortKey,
  pathFilter,
  selectedPath,
  onSelect,
  openSet,
  onToggleOpen,
  pickMode,
  picked,
  onTogglePick,
}: NodeRowProps) {
  const nav = useNavigate();
  const t = useI18n();
  const isLeaf = !!node.doc;
  const open = isLeaf ? false : openSet.has(node.fullPath);
  const [hovered, setHovered] = useState(false);
  const [showPath, setShowPath] = useState(false);
  const [copied, setCopied] = useState(false);
  const isTodo = todo.has(node.fullPath);
  const isSimulated = !!node.isSimulated && !isLeaf;
  const isSelected = selectedPath === node.doc?.fileS3Key;
  const isPicked = isLeaf && !!node.doc && picked.has(node.doc.fileS3Key);

  if (filter && !nodeMatchesFilter(node, filter)) return null;
  if (pathFilter && !nodeMatchesPathFilter(node, pathFilter)) return null;

  const INDENT = 20;
  const rowPadLeft = 8 + depth * INDENT;
  // Guide line x-pos: center of the chevron/icon area at this depth
  const guideX = 8 + depth * INDENT + 7;

  const sortedChildren = [...node.children.values()].sort((a, b) => {
    const al = !!a.doc,
      bl = !!b.doc;
    if (sortKey === "alpha" || sortKey === "name_asc") {
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    }
    if (al !== bl) return al ? 1 : -1;
    if (al && bl && a.doc && b.doc) return compareBySort(a.doc, b.doc, sortKey);
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });

  function copyPath(path: string) {
    navigator.clipboard?.writeText(path).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      },
      () => undefined,
    );
  }

  const rowBg = isPicked
    ? "var(--accent-glow)"
    : isSelected
      ? "var(--accent-glow)"
      : hovered
        ? "var(--bg-hover)"
        : "transparent";

  return (
    <div style={{ position: "relative" }}>
      {/* Row */}
      <div
        className="tree-row"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
          if (isLeaf && node.doc) {
            if (pickMode) {
              onTogglePick(node.doc.fileS3Key);
            } else {
              onSelect(node.doc);
              nav(`/document?filepath=${encodeURIComponent(node.doc.fileS3Key)}`);
            }
          } else {
            onToggleOpen(node.fullPath);
            onSelect(null);
          }
        }}
        onContextMenu={(e) => {
          if (!isLeaf || !node.doc) return;
          e.preventDefault();
          onSelect(node.doc);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          paddingLeft: rowPadLeft,
          paddingRight: 6,
          paddingTop: 3,
          paddingBottom: 3,
          borderRadius: 5,
          cursor: isLeaf ? "pointer" : "default",
          background: rowBg,
          userSelect: "none",
          position: "relative",
        }}
      >
        {/* Chevron */}
        {!isLeaf && node.children.size > 0 ? (
          <Chevron open={open} />
        ) : (
          <span style={{ width: 9, flexShrink: 0 }} />
        )}

        {/* Pick checkbox (leaves only, select mode) */}
        {pickMode && isLeaf && (
          <span
            style={{
              width: 13,
              height: 13,
              borderRadius: 3,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isPicked ? "var(--accent)" : "transparent",
              border: `1.5px solid ${isPicked ? "var(--accent)" : "var(--border)"}`,
              color: "var(--accent-fg)",
              fontSize: "0.55rem",
              fontWeight: 700,
            }}
          >
            {isPicked ? "✓" : ""}
          </span>
        )}

        {/* Icon */}
        {isLeaf ? (
          <FileIco />
        ) : (
          <FolderIco open={open} simulated={isSimulated} />
        )}

        {/* Label */}
        <span
          style={{
            flex: 1,
            fontSize: isLeaf ? "0.76rem" : "0.8rem",
            fontFamily: isLeaf ? "JetBrains Mono, monospace" : undefined,
            fontWeight: isLeaf ? 400 : depth === 0 ? 600 : 500,
            color: isLeaf
              ? isSelected
                ? "var(--accent)"
                : "var(--text-1)"
              : isSimulated
                ? "var(--text-3)"
                : depth === 0
                  ? "var(--text-1)"
                  : "var(--text-2)",
            fontStyle: isSimulated ? "italic" : "normal",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            letterSpacing: isLeaf ? "0" : "-0.01em",
          }}
        >
          {node.name}
        </span>

        {/* Folder doc count */}
        {!isLeaf && node.docCount > 0 && (
          <span
            style={{
              fontSize: "0.6rem",
              color: isTodo ? "var(--warn)" : "var(--text-3)",
              background: isTodo ? "rgba(251,191,36,0.1)" : "var(--bg-raised)",
              border: `1px solid ${isTodo ? "rgba(251,191,36,0.25)" : "var(--border-soft)"}`,
              borderRadius: 10,
              padding: "0 5px",
              lineHeight: "16px",
              flexShrink: 0,
              fontFamily: "JetBrains Mono, monospace",
              minWidth: 20,
              textAlign: "center",
            }}
          >
            {node.docCount}
          </span>
        )}

        {/* Leaf page count */}
        {isLeaf && (
          <span
            style={{
              fontSize: "0.6rem",
              color: "var(--text-3)",
              flexShrink: 0,
            }}
          >
            {node.doc!.page_count}
            {t.ft_pages}
          </span>
        )}

        {/* Hover actions */}
        {hovered && (
          <div
            style={{ display: "flex", gap: 1, flexShrink: 0, marginLeft: 2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {!isLeaf && (
              <IconBtn
                title={isTodo ? t.ft_markDone : t.ft_markTodo}
                onClick={() => onToggleTodo(node.fullPath)}
                active={isTodo}
                activeColor="var(--warn)"
              >
                {isTodo ? "★" : "☆"}
              </IconBtn>
            )}
            {isLeaf && (
              <>
                <IconBtn
                  title={t.ft_showPath}
                  onClick={() => setShowPath((v) => !v)}
                  active={showPath}
                >
                  ⓘ
                </IconBtn>
                <IconBtn
                  title={t.ft_openStats}
                  onClick={() =>
                    node.doc &&
                    nav(
                      `/file-stats?filepath=${encodeURIComponent(node.doc.fileS3Key)}`,
                    )
                  }
                >
                  ⎙
                </IconBtn>
                {showPath && (
                  <IconBtn
                    title={copied ? t.ft_copied : t.ft_copy}
                    onClick={() => copyPath(node.doc!.fileS3Key)}
                    active={copied}
                    activeColor="var(--accent)"
                  >
                    {copied ? "✓" : "⎘"}
                  </IconBtn>
                )}
              </>
            )}
          </div>
        )}

        {/* Path tooltip */}
        {showPath && isLeaf && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              bottom: "calc(100% + 4px)",
              left: rowPadLeft,
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "5px 9px",
              fontSize: "0.61rem",
              fontFamily: "JetBrains Mono, monospace",
              color: "var(--text-2)",
              wordBreak: "break-all",
              maxWidth: 320,
              zIndex: 50,
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              pointerEvents: "none",
              lineHeight: 1.6,
            }}
          >
            {node.doc!.fileS3Key}
          </div>
        )}
      </div>

      {/* Todo label */}
      {!isLeaf && isTodo && open && (
        <div style={{ paddingLeft: rowPadLeft + INDENT, paddingBottom: 2 }}>
          <span
            style={{
              fontSize: "0.58rem",
              color: "var(--warn)",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            ★ {t.ft_toReview}
          </span>
        </div>
      )}

      {/* Guide line + children */}
      {!isLeaf && open && sortedChildren.length > 0 && (
        <>
          {/* Vertical guide line */}
          <div
            style={{
              position: "absolute",
              left: guideX,
              top: 26,
              bottom: 4,
              width: 1,
              background: "var(--border-soft)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          {sortedChildren.map((c) => (
            <NodeRow
              key={c.fullPath + c.name}
              node={c}
              depth={depth + 1}
              todo={todo}
              onToggleTodo={onToggleTodo}
              filter={filter}
              sortKey={sortKey}
              pathFilter={pathFilter}
              selectedPath={selectedPath}
              onSelect={onSelect}
              openSet={openSet}
              onToggleOpen={onToggleOpen}
              pickMode={pickMode}
              picked={picked}
              onTogglePick={onTogglePick}
            />
          ))}
        </>
      )}
    </div>
  );
}

/* ── icons ──────────────────────────────────────────────────────────────────── */

function IconBtn({
  children,
  title,
  onClick,
  active,
  activeColor,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  active?: boolean;
  activeColor?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        background: active ? "var(--accent-glow)" : "none",
        border: "none",
        cursor: "pointer",
        color: active ? (activeColor ?? "var(--accent)") : "var(--text-3)",
        fontSize: "0.65rem",
        padding: "2px 4px",
        borderRadius: 3,
        lineHeight: 1,
        transition: "color 0.1s, background 0.1s",
      }}
    >
      {children}
    </button>
  );
}

function FileIco() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, opacity: 0.8 }}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function FolderIco({ open, simulated }: { open: boolean; simulated: boolean }) {
  const c = simulated ? "var(--text-3)" : "var(--text-2)";
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill={open ? "var(--accent-glow)" : "none"}
      stroke={open ? "var(--accent)" : c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--text-3)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        flexShrink: 0,
        transform: open ? "rotate(90deg)" : "none",
        transition: "transform 0.13s",
      }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ── public component ───────────────────────────────────────────────────────── */

interface FileTreeProps {
  documents: Document[];
  simulatedTagPaths?: string[];
  filter?: string;
  sortKey: FileTreeSortKey;
  selectedPath?: string | null;
  onSelect?: (doc: Document | null) => void;
  /** Called after a bulk delete completes so the parent can refresh its document list. */
  onChanged?: () => void;
}

export default function FileTree({
  documents,
  simulatedTagPaths = [],
  filter = "",
  sortKey,
  selectedPath = null,
  onSelect,
  onChanged,
}: FileTreeProps) {
  const t = useI18n();
  const [todo, setTodo] = useState<Set<string>>(() => loadTodo());
  const [pathFilter, setPathFilter] = useState("");
  const pathFilterRef = useRef<HTMLInputElement>(null);

  // Multi-select + bulk delete
  const [pickMode, setPickMode] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function togglePick(key: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }
  function selectAllVisible() {
    setPicked(new Set(documents.map((d) => d.fileS3Key)));
  }
  function clearPicked() {
    setPicked(new Set());
    setDeleteConfirm(false);
  }
  function togglePickMode() {
    setPickMode((v) => !v);
    clearPicked();
  }
  async function bulkDeletePicked() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setDeleting(true);
    const keys = [...picked];
    let ok = 0;
    for (const key of keys) {
      try {
        await deleteDocument(key);
        ok++;
      } catch {
        /* apiFetch already surfaces a toast with the real error */
      }
    }
    setDeleting(false);
    clearPicked();
    setPickMode(false);
    if (ok > 0) reportSuccess(t.toast_success, `${ok}/${keys.length}`);
    onChanged?.();
  }

  // Track which folders are open (by fullPath)
  const [openSet, setOpenSet] = useState<Set<string>>(() => new Set());

  const root = useMemo(
    () => buildTagTree(documents, simulatedTagPaths),
    [documents, simulatedTagPaths],
  );

  // Auto-open first two levels on first mount / data change
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current || root.children.size === 0) return;
    didInit.current = true;
    const toOpen = new Set<string>();
    for (const child of root.children.values()) {
      if (!child.doc) {
        toOpen.add(child.fullPath);
        // Open second level too if small enough
        if (child.children.size <= 8) {
          for (const grandchild of child.children.values()) {
            if (!grandchild.doc) toOpen.add(grandchild.fullPath);
          }
        }
      }
    }
    setOpenSet(toOpen);
  }, [root]);

  const toggleOpen = useCallback((path: string) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  function collapseAll() {
    setOpenSet(new Set());
  }

  function expandAll() {
    const allFolders = new Set<string>();
    function collect(node: TreeNode) {
      if (!node.doc && node.fullPath) allFolders.add(node.fullPath);
      for (const c of node.children.values()) collect(c);
    }
    collect(root);
    setOpenSet(allFolders);
  }

  const toggleTodo = useCallback((path: string) => {
    setTodo((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      saveTodo(next);
      return next;
    });
  }, []);

  const selectedDoc = useMemo(
    () =>
      selectedPath
        ? (documents.find((d) => d.fileS3Key === selectedPath) ?? null)
        : null,
    [documents, selectedPath],
  );

  function handleSelect(doc: Document | null) {
    onSelect?.(doc);
  }

  if (root.children.size === 0) {
    return (
      <div
        style={{
          padding: "40px 20px",
          textAlign: "center",
          color: "var(--text-3)",
        }}
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
          style={{ marginBottom: 10, opacity: 0.4 }}
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
        <p style={{ margin: 0, fontSize: "0.82rem" }}>{t.ft_noDocuments}</p>
      </div>
    );
  }

  const todoCount = todo.size;

  const sortedRoots = [...root.children.values()].sort((a, b) => {
    const al = !!a.doc,
      bl = !!b.doc;
    if (sortKey === "alpha" || sortKey === "name_asc")
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    if (al !== bl) return al ? 1 : -1;
    const at = todo.has(a.fullPath),
      bt = todo.has(b.fullPath);
    if (at !== bt) return at ? -1 : 1;
    if (al && bl && a.doc && b.doc) return compareBySort(a.doc, b.doc, sortKey);
    return a.name.localeCompare(b.name);
  });

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          padding: "6px 8px",
          borderBottom: "1px solid var(--border-soft)",
          display: "flex",
          flexDirection: "column",
          gap: 5,
          flexShrink: 0,
        }}
      >
        {/* Path filter */}
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-3)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: "absolute",
                left: 7,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={pathFilterRef}
              value={pathFilter}
              onChange={(e) => setPathFilter(e.target.value)}
              placeholder={t.ft_filterByPath}
              className="input"
              style={{
                paddingLeft: 24,
                fontSize: "0.74rem",
                fontFamily: "JetBrains Mono, monospace",
              }}
            />
            {pathFilter && (
              <button
                onClick={() => setPathFilter("")}
                title={t.ft_clearFilter}
                style={{
                  position: "absolute",
                  right: 4,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-3)",
                  cursor: "pointer",
                  fontSize: "0.68rem",
                  padding: "0 5px",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Expand/Collapse all */}
          <button
            onClick={collapseAll}
            title={t.ft_collapseAll}
            style={{
              background: "none",
              border: "1px solid var(--border-soft)",
              borderRadius: 4,
              cursor: "pointer",
              color: "var(--text-3)",
              fontSize: "0.62rem",
              padding: "3px 6px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <CollapseIco />
          </button>
          <button
            onClick={expandAll}
            title={t.ft_expandAll}
            style={{
              background: "none",
              border: "1px solid var(--border-soft)",
              borderRadius: 4,
              cursor: "pointer",
              color: "var(--text-3)",
              fontSize: "0.62rem",
              padding: "3px 6px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <ExpandIco />
          </button>
          <button
            onClick={togglePickMode}
            title={t.ft_select}
            style={{
              background: pickMode ? "var(--accent-glow)" : "none",
              border: `1px solid ${pickMode ? "var(--accent)" : "var(--border-soft)"}`,
              borderRadius: 4,
              cursor: "pointer",
              color: pickMode ? "var(--accent)" : "var(--text-3)",
              fontSize: "0.62rem",
              padding: "3px 7px",
              whiteSpace: "nowrap",
              flexShrink: 0,
              fontWeight: pickMode ? 600 : 400,
            }}
          >
            ☑ {t.ft_select}
          </button>
        </div>

        {/* Bulk select action bar */}
        {pickMode && (
          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              padding: "2px 2px 0",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "0.68rem",
                color: "var(--text-2)",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {t.ft_selected(picked.size)}
            </span>
            <button onClick={selectAllVisible} style={smallBtn}>
              {documents.length}
            </button>
            <button onClick={clearPicked} style={smallBtn} disabled={picked.size === 0}>
              ✕
            </button>
            {picked.size > 0 && (
              <button
                onClick={bulkDeletePicked}
                disabled={deleting}
                style={{
                  ...smallBtn,
                  color: "var(--danger)",
                  borderColor: "rgba(248,113,113,0.35)",
                  background: deleteConfirm ? "rgba(248,113,113,0.15)" : undefined,
                  marginLeft: "auto",
                }}
              >
                {deleting
                  ? t.main_deleting
                  : deleteConfirm
                    ? t.ft_confirmDelete(picked.size)
                    : t.ft_delete(picked.size)}
              </button>
            )}
            {deleteConfirm && (
              <button onClick={() => setDeleteConfirm(false)} style={smallBtn}>
                {t.main_cancel}
              </button>
            )}
          </div>
        )}

        {/* Selected doc breadcrumb */}
        {selectedDoc && <SelectedBreadcrumb doc={selectedDoc} />}

        {/* Metadata row */}
        {(todoCount > 0 || simulatedTagPaths.length > 0) && (
          <div
            style={{
              display: "flex",
              gap: 10,
              fontSize: "0.63rem",
              color: "var(--text-3)",
              paddingLeft: 2,
            }}
          >
            {todoCount > 0 && (
              <span style={{ color: "var(--warn)" }}>
                {t.ft_foldersToReview(todoCount)}
              </span>
            )}
            {simulatedTagPaths.length > 0 && (
              <span>
                <em>italic</em> ={" "}
                {t.ft_italicNote.split(" = ")[1] ?? "simulated"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tree body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 4px 8px" }}>
        {sortedRoots.map((c) => (
          <NodeRow
            key={c.fullPath + c.name}
            node={c}
            depth={0}
            todo={todo}
            onToggleTodo={toggleTodo}
            filter={filter}
            sortKey={sortKey}
            pathFilter={pathFilter}
            selectedPath={selectedPath}
            onSelect={handleSelect}
            openSet={openSet}
            onToggleOpen={toggleOpen}
            pickMode={pickMode}
            picked={picked}
            onTogglePick={togglePick}
          />
        ))}
      </div>
    </div>
  );
}

/* ── SelectedBreadcrumb ────────────────────────────────────────────────────── */

function SelectedBreadcrumb({ doc }: { doc: Document }) {
  const t = useI18n();
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(doc.fileS3Key).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      },
      () => undefined,
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "var(--bg-raised)",
        border: "1px solid var(--border-soft)",
        borderRadius: 6,
        padding: "4px 8px",
        fontSize: "0.64rem",
        fontFamily: "JetBrains Mono, monospace",
      }}
      title={doc.fileS3Key}
    >
      <span style={{ color: "var(--text-3)", flexShrink: 0 }}>
        {t.ft_pathLabel}
      </span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: "var(--text-2)",
        }}
      >
        {doc.fileS3Key}
      </span>
      <button
        onClick={copy}
        title={copied ? t.ft_copied : t.ft_copy}
        style={{
          background: copied ? "var(--accent-glow)" : "transparent",
          border: `1px solid ${copied ? "var(--accent)" : "var(--border)"}`,
          color: copied ? "var(--accent)" : "var(--text-2)",
          borderRadius: 4,
          padding: "1px 7px",
          cursor: "pointer",
          fontSize: "0.63rem",
          flexShrink: 0,
        }}
      >
        {copied ? t.ft_copied : t.ft_copy}
      </button>
    </div>
  );
}

/* ── collapse/expand icons ────────────────────────────────────────────────── */

function CollapseIco() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ExpandIco() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
