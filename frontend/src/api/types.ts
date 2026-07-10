// ── OCR types (must match server src/utils/types/main.ts) ────────────────────

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBoxOcr {
  upLeftPoint: Point;
  downRightPoint: Point;
}

export interface BoxOcr {
  text: string;
  confidence: number | null;
  boundingBox: BoundingBoxOcr;
  words?: BoxOcr[];
}

export interface LineOcr {
  boxes: BoxOcr[];
}

export interface PageOcr {
  pageNumber: number;
  lines: LineOcr[];
  bannerImgpath: string;
}

export interface OcrResult {
  pages: PageOcr[];
  originalFilePath: string;
  fileHash: string;
}

// Flat normalized format (alternative DB storage form)
export interface RawBlockNormalized {
  text: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// ── Document / API types ──────────────────────────────────────────────────────

export interface Document {
  user_id?: number;
  fileS3Key: string;
  created_at: string;
  assigned_tags: string[];
  banner_img: string;
  spawned_time?: string;
  page_count: number;
  file_id?: number;
  encrypted_file_key?: string;
}

/** pagesTable.ocr is stored as PageOcr (the whole page object) or LineOcr[] */
export interface Page {
  pageIdx: number;
  banner_img: string;
  ocr: PageOcr | LineOcr[] | RawBlockNormalized[] | null;
}

export interface MainPageResponse {
  data: Document[];
  totalCount: number;
  pageCount: number;
}

export interface SearchResponse {
  hits: any[];
  /** True total matches for the query+filters on the server, independent of
   * how many were actually returned (capped by `limit`). */
  estimatedTotalHits: number;
  total_documents: number;
  tag_facets: Record<string, number>;
  excludedTerms: string[];
  cleanQuery: string;
  /** Server-side search time reported by Meilisearch, in milliseconds. */
  processing_time_ms?: number;
  sort?: string;
  /** False if a sort was requested but the index doesn't have that
   * attribute registered as sortable yet, in which case relevance order
   * was used instead. */
  sort_applied?: boolean;
}

export interface TagEntry {
  tag: string;
  doc_count: number;
}
