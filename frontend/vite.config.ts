import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Uncomment to proxy API requests during dev (avoids CORS + mixed-content issues)
    // proxy: {
    //   '/api': {
    //     target: 'https://localhost:3000',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, ''),
    //     secure: false, // accept self-signed mkcert certs
    //   },
    // },
  },
});
