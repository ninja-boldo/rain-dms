import { expect, test } from "bun:test";
import { PaddleJsOcr } from "../workers/ocr/paddle/paddle-ocr";
import { OcrResult } from "../utils/types/main";
import { docToOcr } from "./helpers/docToOcr";
import { getUsernameFromConsumeRaw } from "../utils/other/pathHelpers";

const mockS3: boolean = true;

test("init paddle obj", async () => {
  const paddleObj: PaddleJsOcr = new PaddleJsOcr("./tempDir", mockS3, false);
  await paddleObj.init();
  paddleObj.shutdown();
});

test("ocr doesnt error", async () => {
  const paddleObj: PaddleJsOcr = new PaddleJsOcr("./tempDir", mockS3, true);
  await paddleObj.init();

  const res: OcrResult = await paddleObj.getOcr(
    "./tests/helpers/test.pdf",
    null,
    false,
  );
  expect(JSON.stringify(res)).toBe(JSON.stringify(docToOcr["test.pdf"]));

  paddleObj.shutdown();
}, 15000);


test("ocr pipeline username extraction works", () => {

  const filePathsToCheck: string[] = ["/consume/admin/info/abi/123378_313_Schreibwarensortiment.pdf"]
  const usernames: string[] = []
  filePathsToCheck.forEach( (filePath: string) => usernames.push(getUsernameFromConsumeRaw(filePath, "/consume")) )

  expect(usernames).toEqual(["admin"])
})