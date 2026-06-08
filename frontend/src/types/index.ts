export interface Document {
  filepath: string;
  created_at: string;
  assigned_tags: string[];
  banner_img: string;
  page_count?: number;
}

export interface SearchHit {
  id: string;
  file_id: number;
  filepath: string;
  pageIdx: number;
  created_at: string;
  assigned_tags: string[];
  searchable_text?: string;
  ocr: {
    lines: Array<{
      boxes: Array<{
        text: string;
        confidence: number;
        boundingBox: {
          upLeftPoint: { x: number; y: number };
          downRightPoint: { x: number; y: number };
        };
      }>;
    }>;
  };
  banner_img: string;
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
