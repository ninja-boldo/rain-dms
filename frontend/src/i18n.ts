import { useSettingsStore } from "./store/settings";
import type { Lang } from "./store/settings";

// ── string tables ─────────────────────────────────────────────────────────────

const en = {
  // FileTree
  ft_noDocuments: "No documents.",
  ft_filterByPath: "Filter by path…",
  ft_clearFilter: "Clear",
  ft_collapseAll: "Collapse all",
  ft_expandAll: "Expand all",
  ft_toReview: "to review",
  ft_docs: "docs",
  ft_pathLabel: "path:",
  ft_copy: "copy",
  ft_copied: "✓ copied",
  ft_markTodo: "Mark as to-do",
  ft_markDone: "Mark as done",
  ft_showPath: "Show full S3 path",
  ft_openStats: "File stats",
  ft_pages: "p",
  ft_foldersToReview: (n: number) =>
    `★ ${n} folder${n !== 1 ? "s" : ""} to review`,
  ft_italicNote: "italic = simulated",

  // UploadModal
  ul_dropHere: "Drop files or folders here",
  ul_folderNote: "Folder structure is preserved under your username",
  ul_browseFiles: "Browse files",
  ul_browseFolder: "Browse folder",
  ul_upload: (n: number) => `Upload ${n} file${n !== 1 ? "s" : ""}`,
  ul_close: "Close",
  ul_pending: "pending",
  ul_hashing: "hashing…",
  ul_duplicate: "duplicate",
  ul_uploading: "uploading…",
  ul_done: "done",

  // SearchPage
  sr_placeholder: "Search… tag:label or -exclude",
  sr_search: "Search",
  sr_after: "After",
  sr_before: "Before",
  sr_filterByTag: "Filter by tag",
  sr_noResults: "No results found.",
  sr_results: (hits: number, distinct: number) =>
    `${hits} hit${hits !== 1 ? "s" : ""} across ${distinct} file${distinct !== 1 ? "s" : ""}`,
  sr_excluded: "excluded:",
  sr_page: "p.",
  sr_open: "Open",
  sr_groupByFile: "Group by file",
  sr_flat: "Flat",

  // MainPage
  main_allDocuments: "All documents",
  main_tagLabel: "Tag:",
  main_tags: "Tags",
  main_all: "All",
  main_filterByFilename: "Filter by name…",
  main_newestFirst: "Newest first",
  main_oldestFirst: "Oldest first",
  main_nameAZ: "Name A–Z",
  main_mostPages: "Most pages",
  main_noDocuments: "No documents yet.",
  main_noMatch: (f: string) => `No documents matching "${f}"`,
  main_refresh: "Refresh",
  main_grid: "Grid",
  main_tree: "Tree",
  main_documents: (n: number) =>
    `${n.toLocaleString()} document${n !== 1 ? "s" : ""}`,

  // SettingsPage
  st_language: "Language",
  st_langSub: "Interface language for labels and controls",
  st_english: "English",
  st_german: "Deutsch",
};

const de: typeof en = {
  ft_noDocuments: "Keine Dokumente.",
  ft_filterByPath: "Nach Pfad filtern…",
  ft_clearFilter: "Löschen",
  ft_collapseAll: "Alle einklappen",
  ft_expandAll: "Alle ausklappen",
  ft_toReview: "zu prüfen",
  ft_docs: "Dok.",
  ft_pathLabel: "Pfad:",
  ft_copy: "kopieren",
  ft_copied: "✓ kopiert",
  ft_markTodo: "Als zu erledigen markieren",
  ft_markDone: "Als erledigt markieren",
  ft_showPath: "Vollständigen S3-Pfad anzeigen",
  ft_openStats: "Dateistatistiken",
  ft_pages: "S.",
  ft_foldersToReview: (n: number) => `★ ${n} Ordner zu prüfen`,
  ft_italicNote: "kursiv = simuliert",

  ul_dropHere: "Dateien oder Ordner hierher ziehen",
  ul_folderNote: "Ordnerstruktur wird unter deinem Benutzernamen gespeichert",
  ul_browseFiles: "Dateien auswählen",
  ul_browseFolder: "Ordner auswählen",
  ul_upload: (n: number) => `${n} Datei${n !== 1 ? "en" : ""} hochladen`,
  ul_close: "Schließen",
  ul_pending: "ausstehend",
  ul_hashing: "wird gehasht…",
  ul_duplicate: "Duplikat",
  ul_uploading: "wird hochgeladen…",
  ul_done: "fertig",

  sr_placeholder: "Suchen… tag:Label oder -ausschließen",
  sr_search: "Suchen",
  sr_after: "Nach",
  sr_before: "Vor",
  sr_filterByTag: "Nach Tag filtern",
  sr_noResults: "Keine Ergebnisse gefunden.",
  sr_results: (hits: number, distinct: number) =>
    `${hits} Treffer in ${distinct} Datei${distinct !== 1 ? "en" : ""}`,
  sr_excluded: "ausgeschlossen:",
  sr_page: "S.",
  sr_open: "Öffnen",
  sr_groupByFile: "Nach Datei gruppieren",
  sr_flat: "Liste",

  main_allDocuments: "Alle Dokumente",
  main_tagLabel: "Tag:",
  main_tags: "Tags",
  main_all: "Alle",
  main_filterByFilename: "Nach Name filtern…",
  main_newestFirst: "Neueste zuerst",
  main_oldestFirst: "Älteste zuerst",
  main_nameAZ: "Name A–Z",
  main_mostPages: "Meiste Seiten",
  main_noDocuments: "Noch keine Dokumente.",
  main_noMatch: (f: string) => `Keine Dokumente für „${f}"`,
  main_refresh: "Aktualisieren",
  main_grid: "Raster",
  main_tree: "Baum",
  main_documents: (n: number) =>
    `${n.toLocaleString()} Dokument${n !== 1 ? "e" : ""}`,

  st_language: "Sprache",
  st_langSub: "Sprache für Beschriftungen und Steuerelemente",
  st_english: "English",
  st_german: "Deutsch",
};

const STRINGS: Record<Lang, typeof en> = { en, de };

export type I18nStrings = typeof en;

export function useI18n(): I18nStrings {
  const lang = useSettingsStore((s) => s.lang);
  return STRINGS[lang] ?? en;
}

export function getI18n(): I18nStrings {
  const lang = useSettingsStore.getState().lang;
  return STRINGS[lang] ?? en;
}
