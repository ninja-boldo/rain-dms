export interface OcrBox {
  text: string;
  confidence: number;
  boundingBox: {
    upLeftPoint: { x: number; y: number };
    downRightPoint: { x: number; y: number };
  };
}

export interface OcrData {
  lines: Array<{ boxes: OcrBox[] }>;
  bannerImgpath?: string;
}

export interface Document {
  filepath: string;
  created_at: string;
  assigned_tags: string[] | string | null;
  banner_img: string;
}

export interface SearchHit {
  id: number;
  filepath: string;
  created_at: string;
  assigned_tags: string[] | string | null;
  ocr: OcrData | null;
  banner_img: string;
  pageIdx?: number;
}

export interface SearchResponse {
  hits: SearchHit[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}

export type Theme = "light" | "dark";
export type Language = "de" | "en";

// Normalized page for viewer
export interface DocPage {
  pageIdx: number;
  banner_img: string;
  ocr: OcrData | null;
}
