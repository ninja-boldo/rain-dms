# rain-dms frontend

React + Vite + TypeScript frontend for the rain-dms self-hosted document management system.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Configuration

### API URL

The default API URL is `https://localhost:3000`. Change it in **Settings → Connection** inside the app, or set it at build time:

```bash
VITE_API_URL=https://rain.dms.local npm run dev
```

### Self-signed TLS (mkcert)

The server uses mkcert certificates that browsers don't trust by default.
**You must trust the cert before the frontend can connect.** Two options:

1. **Easiest:** Visit `https://localhost:3000` directly in your browser, click through the warning and accept the cert permanently.

2. **Proper:** Install the mkcert CA into your system/browser trust store:
   ```bash
   mkcert -install
   ```

### Vite dev proxy (optional)

Uncomment the proxy block in `vite.config.ts` to proxy `/api` → the backend,
which avoids mixed-content and CORS issues during development.

## Encryption

On sign-in the server returns an `encrypted_encrytion_key` — the global AES-256 main key, encrypted with your plaintext password.

The frontend decrypts this in-browser using:

- **Key derivation:** SHA-256 of your password → 32-byte AES key
- **Cipher:** AES-256-GCM
- **Wire format:** `base64( iv[12] || ciphertext || gcm_tag[16] )`

The decrypted key lives **in memory only** (Zustand state, never localStorage).

If your server's `encryptTxt` uses a different IV size or key derivation scheme, adjust `IV_BYTES` and `passwordToKey()` in `src/utils/crypto.ts`.

Per-file keys work the same way: stored encrypted with the main key, decrypted client-side on demand before rendering images or downloading files.

## Features

| Feature             | Notes                                               |
| ------------------- | --------------------------------------------------- |
| Sign in / sign up   | JWT stored in localStorage                          |
| Document grid       | Paginated, tag-filtered, banner thumbnails          |
| File tree view      | Toggle from grid; built from `fileS3Key` paths      |
| Full-text search    | `tag:foo`, `-exclude`, date range filters           |
| Document viewer     | Page strip, page-by-page navigation                 |
| OCR overlay         | Bounding boxes over page images with text tooltip   |
| Upload              | Drag-drop, SHA-256 dedup check before upload        |
| Delete              | Two-step confirm                                    |
| Stats dashboard     | Worker status, queue depth, OCR coverage, sparkline |
| Dark / light theme  | Toggled in sidebar or Settings, persisted           |
| Client-side decrypt | AES-256-GCM for encrypted images and files          |

## Project structure

```
src/
  api/client.ts          All API calls + fetchBinary for auth'd image loading
  store/auth.ts          JWT + username (persisted) + mainEncryptionKey (memory only)
  store/settings.ts      Theme + API URL (persisted)
  utils/crypto.ts        AES-256-GCM decrypt helpers
  utils/hash.ts          SHA-256 file hashing for dedup
  components/
    Layout.tsx           Sidebar + outlet
    AuthImage.tsx        Fetches images with auth headers, optionally decrypts
    DocumentCard.tsx     Grid card with stacked-pages hover effect
    FileTree.tsx         Recursive tree from fileS3Key paths
    UploadModal.tsx      Drag-drop upload with hash dedup
  pages/
    LoginPage.tsx
    MainPage.tsx         Grid/tree, tag filter, pagination
    SearchPage.tsx       Full search with facets
    DocumentPage.tsx     Viewer + OCR overlay + download + delete
    StatsPage.tsx        Dashboard: workers, queues, metrics
    SettingsPage.tsx     Theme, API URL, encryption status
```

## Building for production

```bash
npm run build
# output → dist/
```

Serve `dist/` with nginx or any static host. Make sure to redirect all routes to `index.html` for client-side routing:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```
