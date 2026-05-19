export interface Document {
  filepath: string;
  created_at: string;
  assigned_tags: string[];
  banner_img: string;
}

export interface SearchHit {
  id: number;
  filepath: string;
  created_at: string;
  assigned_tags: string[];
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
