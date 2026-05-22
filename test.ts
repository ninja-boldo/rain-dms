import { bench, run } from "mitata";

export const getImgDirAmendment = (filepath: string): string => {
  // an img is saved like this in the temp folder ..../temp/[docu-uuid]/page-x.jpg
  // and this is meant to return this part [docu-uuid]/page-x.jpg so you build the uploads url for nginx

  let lastSlash = filepath.lastIndexOf("/");
  if (lastSlash === -1) return filepath;

  const secondLastSlash = filepath.lastIndexOf("/", lastSlash - 1);
  if (secondLastSlash === -1) return filepath.slice(lastSlash + 1);

  return filepath.slice(secondLastSlash + 1);
};

bench("getImgDirAmendment", () => {
  getImgDirAmendment(
    "/Users/bennetjollenbeck/Desktop/programming/web/react/family_projects/rain-dms/temp/2d95c0f5-4ed7-4427-9044-d5680a9916aa/page-1.jpg",
  );
});

await run();
