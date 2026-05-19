const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];

const ALLOWED_MIME = ["application/pdf", "image/png", "image/jpeg"];

export function isAllowedFile(file: File) {
  const lower = file.name.toLowerCase();

  const validExtension = ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));

  const validMime = ALLOWED_MIME.includes(file.type) || file.type === "";

  return validExtension && validMime;
}
