import fs from "fs";
import { imgToWebp, pdfToImgPages } from "../../utils/other/pdf";
import { getS3Client, uploadManyS3 } from "../../utils/other/s3Helpers";
import { S3Client } from "@aws-sdk/client-s3";
import { BucketNames, S3ReturnObj } from "../../utils/types/main";

export class ImageHandler {
  tempPath: string = "/tmp/rain-dms/imgs";
  IMG_DPI: number = 150;
  convertWebpInplace: boolean = true;
  webpQuality: number = 90;
  openImgPaths: string[] = [];
  protected s3: S3Client | null = null;

  constructor(tempPath: string, dpi: number = 150) {
    fs.mkdirSync(tempPath, { recursive: true });
    this.tempPath = tempPath;
    this.IMG_DPI = dpi;
  }

  async init() {
    this.s3 = await getS3Client();
  }

  private popLastXImages(imagesToPop: number) {
    if (imagesToPop >= this.openImgPaths.length) {
      console.error(
        "you cant pop more from the imgs array than there are elements. array emptied normally now and has 0 elements",
      );
      this.openImgPaths = [];
      return;
    }
    this.openImgPaths = this.openImgPaths.slice(0, -imagesToPop);
  }

  async imgToWebp(imgPath: string, inplace: boolean = this.convertWebpInplace) {
    const resArr: string[] = await this.ImgsToWebp([imgPath], inplace);
    const webpPath: string = resArr[0];

    return webpPath;
  }

  private async ImgsToWebp(
    imgPaths: string[],
    inplace: boolean = this.convertWebpInplace,
  ): Promise<string[]> {
    const webpPaths: string[] = await Promise.all(
      imgPaths.map(async (filePath) => {
        return await imgToWebp(filePath, inplace, this.webpQuality);
      }),
    );

    this.openImgPaths.push(...webpPaths);
    return webpPaths;
  }

  async convertPdfToImgs(
    pdfPath: string,
    convertToWebp: boolean = true,
  ): Promise<string[]> {
    let imgPaths: string[] = await pdfToImgPages(
      pdfPath,
      this.tempPath,
      this.IMG_DPI,
    );

    if (convertToWebp === true) {
      imgPaths = await this.ImgsToWebp(imgPaths);
      return imgPaths;
    }
    this.openImgPaths.push(...imgPaths);
    return imgPaths;
  }

  async uploadToS3Single(imgPath: string): Promise<S3ReturnObj> {
    const res: S3ReturnObj[] = await this.uploadToS3Many([imgPath]);
    return res[0];
  }

  async uploadToS3Many(imgPaths: string[]): Promise<S3ReturnObj[]> {
    if (this.s3 === null) {
      throw Error("failed to init s3 Client");
    }
    const s3Objects: S3ReturnObj[] = await uploadManyS3(
      this.s3,
      imgPaths,
      true,
      BucketNames.bannerImgs,
    );
    return s3Objects;
  }

  async clearDanglingImages() {
    await Promise.all(
      this.openImgPaths.map((filePath) => fs.promises.rm(filePath)),
    );
    this.openImgPaths = [];
  }

  async [Symbol.asyncDispose](): Promise<void> {
    await this.clearDanglingImages();
  }
}
