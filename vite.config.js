import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  build: {
    minify: false,
    cssMinify: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  },
  esbuild: false
})