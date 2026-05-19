import "./pdfjs-polyfill";
import { PaddleOcrResult, PaddleOcrService } from "ppu-paddle-ocr";
import { parseRawPagesPaddleOcr, pdfToImgPages, uploadFiles } from "./utils";
import { OcrResult, PaddleRecognitionModel } from "../../utils/types/main";
require("dotenv").config();
import { readFile } from "fs/promises";

// Runs at most `limit` async tasks concurrently.
// Preserves input order in the returned array.
async function pMap<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  limit: number,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

export class PaddleJsOcr {
  private lang: string;
  private model: PaddleOcrService | null = null;
  private tempFolder: string | null = null;
  // How many pages to OCR concurrently. PaddleOCR is CPU/GPU-bound;
  // going above 4 typically hurts throughput and risks OOM on large docs.
  private readonly ocrConcurrency: number;
  private modelBaseUrl: string =
    "https://media.githubusercontent.com/media/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models/main";
  private modelNameToUrl: { [modelName: string]: string } = {
    "PP-OCRv5-mobile-en": `${this.modelBaseUrl}/recognition/multi/en/v5/en_PP-OCRv5_mobile_rec_infer.ort`,
    "PP-OCRv5-mobile-de": `${this.modelBaseUrl}/recognition/multi/latin/v5/latin_PP-OCRv5_mobile_rec_infer.onnx`,
  };

  constructor(
    lang: string = "eng",
    tempFolder: string,
    ocrConcurrency: number = 3,
  ) {
    this.lang = lang;
    this.tempFolder = tempFolder;
    this.ocrConcurrency = ocrConcurrency;
  }

  async init(
    model: PaddleRecognitionModel = PaddleRecognitionModel.PP_OCRv5_mobile_de,
  ) {
    const service = new PaddleOcrService({
      recognition: { strategy: "per-box" },
    });
    await service.initialize();
    this.model = service;
    return this;
  }

  async getOcr(
    filePath: string,
    origServerPath: string | null = null,
    isRemote: boolean = false,
  ): Promise<OcrResult> {
    if (!this.model) {
      throw new Error("OCR model not initialized. Call init() first.");
    }

    const isPdf = filePath.toLowerCase().endsWith(".pdf");
    const imageFiles: string[] = isPdf
      ? await pdfToImgPages(filePath, this.tempFolder!)
      : [filePath];

    const ocrResults = await pMap(
      imageFiles,
      async (imgPath, i) => {
        console.log(`OCR page ${i + 1}/${imageFiles.length}: ${imgPath}`);
        try {
          const imageBuffer = await readFile(imgPath);
          
          const result = await this.model!.recognize(imageBuffer.buffer);
          return { bannerImgPath: imgPath, result } as {
            bannerImgPath: string;
            result: PaddleOcrResult;
          };
        } catch (error) {
          console.error(`OCR failed on page ${i + 1} (${imgPath}): ${error}`);
          throw error;
        }
      },
      this.ocrConcurrency,
    );

    // Build pagesRaw preserving page order (pMap already guarantees order).
    const pagesRaw: { [imgFilePath: string]: PaddleOcrResult } =
      Object.fromEntries(
        ocrResults.map(({ bannerImgPath, result }) => [bannerImgPath, result]),
      );

    const pagesParsed: OcrResult = await parseRawPagesPaddleOcr(
      pagesRaw,
      origServerPath ?? filePath,
    );

    if (isRemote) {
      const bannerImgs = pagesParsed.pages.map((page) => page.bannerImgpath);
      console.log("uploading banner imgs to remote server");
      await uploadFiles(bannerImgs);
    }

    return pagesParsed;
  }
}
