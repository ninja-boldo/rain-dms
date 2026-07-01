import { PaddleJsOcr } from "./paddle/paddle-ocr";

console.log("now creating paddle obj");
const paddle = new PaddleJsOcr("stuff", true);
console.log("initing paddle obj");
await paddle.init();
try {
  console.log("starting ocr...");
  await paddle.getOcr(
    "/Users/bennetjollenbeck/Desktop/programming/web/react/family_projects/rain-dms/test_documents/01019.pdf",
    null,
    false,
  );

  console.log("starting ocr second run...");
  await paddle.getOcr(
    "/Users/bennetjollenbeck/Desktop/programming/web/react/family_projects/rain-dms/test_documents/01019.pdf",
    null,
    false,
  );
} finally {
  await paddle.shutdown();
}
