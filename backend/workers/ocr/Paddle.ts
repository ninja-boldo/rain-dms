import { PaddleOcrResult, PaddleOcrService } from "ppu-paddle-ocr";
import {
  parseRawPagesPaddleOcr,
  pdfToPngPages,
  saveImgToTemp,
  toArrayBuffer,
  uploadFiles,
} from "./utils";
import { Screenshot } from "pdf-parse";
import fs from "fs/promises";
import {
  FileTypes,
  OcrResult,
  PaddleRecognitionModel,
} from "../../utils/types/main";
require("dotenv").config();

export class PaddleJsOcr {
  private lang: string;
  private model: PaddleOcrService | null = null;
  private tempFolder: string | null = null;
  private modelBaseUrl: string =
    "https://media.githubusercontent.com/media/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models/main";
  private modelNameToUrl: { [modelName: string]: string } = {
    "PP-OCRv5-mobile-en": `${this.modelBaseUrl}/recognition/multi/en/v5/en_PP-OCRv5_mobile_rec_infer.ort`,
    "PP-OCRv5-mobile-de": `${this.modelBaseUrl}/recognition/multi/latin/v5/latin_PP-OCRv5_mobile_rec_infer.onnx`,
  };

  constructor(lang: string = "eng", tempFolder: string) {
    this.lang = lang;
    this.tempFolder = tempFolder;
  }

  async init(
    model: PaddleRecognitionModel = PaddleRecognitionModel.PP_OCRv5_mobile_de,
  ) {
    const service = new PaddleOcrService({
      recognition: { strategy: "per-box" },
    });
    await service.initialize();
    this.model = service;
    //this.model.changeRecognitionModel(this.modelNameToUrl[model.valueOf()]);

    return this;
  }

  async getOcr(
    filePath: string,
    isRemote: boolean = false,
  ): Promise<OcrResult> {
    if (!this.model) {
      throw new Error("OCR model not initialized. Call init() first.");
    }
    console.log("now running inference");

    const isPdf = filePath.toLowerCase().endsWith(".pdf");

    const imageFiles: Screenshot[] | string[] = isPdf
      ? await pdfToPngPages(filePath)
      : [filePath];

    const results = await Promise.all(
      imageFiles.map(async (img) => {
        try {
          let input: ArrayBuffer;
          let bannerImgPath: string | null = null;

          if (typeof img === "string") {
            bannerImgPath = img;
            const file = await fs.readFile(img);
            input = toArrayBuffer(file);
          } else {
            bannerImgPath = await saveImgToTemp(
              img.data,
              this.tempFolder,
              null,
              FileTypes.png,
            );
            const buffer = Buffer.from(img.data);
            input = toArrayBuffer(buffer);
          }
          const result = await this.model!.recognize(input);

          if (bannerImgPath === null) {
            throw Error(
              `the ingestion pipeline failed as it wasnt able to add a banner img to the corresponding page/document for filepath ${filePath}`,
            );
          }
          return { bannerImgPath, result };
        } catch (error) {
          console.error(
            `failed with this error: ${error} for img of type: ${typeof img}`,
          );
          throw error;
        }
      }),
    );

    const pagesRaw: { [imgFilePath: string]: PaddleOcrResult } = {};
    for (const res of results) {
      if (res) {
        pagesRaw[res.bannerImgPath] = res.result;
      }
    }

    const pagesParsed: OcrResult = await parseRawPagesPaddleOcr(
      pagesRaw,
      filePath,
    );
    if (isRemote) {
      const bannerImgs: string[] = pagesParsed.pages.map(
        (page) => page.bannerImgpath,
      );
      await uploadFiles(bannerImgs);
    }

    return pagesParsed;
  }
}
