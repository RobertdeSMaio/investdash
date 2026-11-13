import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Cross-Origin-Opener-Policy": "same-origin",
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: false,
  },
  server: {
    host: "localhost",
    headers: securityHeaders,
    proxy: {
      "/api": {
        target: "https://investdash-back.vercel.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    host: "localhost",
    headers: securityHeaders,
  },
});
