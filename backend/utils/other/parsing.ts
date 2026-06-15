import { LineOcr, PageOcr } from "../types/main";

function boundingBoxFromPoints(
  points: number[][],
): LineOcr["boxes"][0]["boundingBox"] {
  if (points.length === 0)
    return { upLeftPoint: { x: 0, y: 0 }, downRightPoint: { x: 0, y: 0 } };

  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);

  return {
    upLeftPoint: { x: Math.min(...xs), y: Math.min(...ys) },
    downRightPoint: { x: Math.max(...xs), y: Math.max(...ys) },
  };
}

export function mapRawResultToPage(
  rawRes: any,
  pageNumber: number,
  bannerImgpath: string,
): PageOcr {
  const rawElements: any[] = rawRes?.ocrElements ?? rawRes?.elements ?? [];

  const lines: LineOcr[] = rawElements.map(
    (el): LineOcr => ({
      boxes: [
        {
          text: el.text ?? el.content ?? "",
          confidence: el.confidence?.recognition ?? null,
          boundingBox: boundingBoxFromPoints(el.geometry?.points ?? []),
        },
      ],
    }),
  );

  return { pageNumber, lines, bannerImgpath };
}
