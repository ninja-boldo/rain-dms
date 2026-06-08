import Tesseract from "tesseract.js";
import { createScheduler, createWorker } from "tesseract.js";

export class TesseractOcr {
  private workerCount: number | null = null;
  private scheduler: Tesseract.Scheduler | null = null;
  private worker: Tesseract.Worker | null = null;
  private lang: string = "eng";

  constructor(ocrWorkers: number, lang: string) {
    this.workerCount = ocrWorkers;
    this.lang = lang;
    this.scheduler = createScheduler();
  }

  async init(ocrWorkers: number = 1, lang: string = "eng") {
    for (let i = 0; i < ocrWorkers; i++) {
      this.worker = await createWorker(this.lang);
      this.scheduler?.addWorker(this.worker);
    }
    return this;
  }

  async getDocumentOcr(filePath: string) {
    const isPdf = filePath.toLowerCase().endsWith(".pdf");
  }
}
