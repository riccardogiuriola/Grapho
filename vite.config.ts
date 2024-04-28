import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path, { resolve } from 'path';
import { crx, defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

const rootDir = resolve(__dirname);
const isDev = process.env.__DEV__ === 'true';
const isProduction = !isDev;

const manifest = defineManifest({
  manifest_version: 3,
  name: "Grapho",
  version: pkg.version,
  icons: {
    "16": "src/assets/grapho-icon.png",
    "48": "src/assets/grapho-icon.png",
    "128": "src/assets/grapho-icon.png"
  },
  content_scripts: [
    {
      js: ["src/content-script.ts"],
      matches: ["<all_urls>"],
      run_at: "document_start",
    },
  ],
  devtools_page: "src/devtools.html",
});

const viteManifestHackIssue846: Plugin & { renderCrxManifest: (manifest: any, bundle: any) => void } = {
  // Workaround from https://github.com/crxjs/chrome-extension-tools/issues/846#issuecomment-1861880919.
  name: 'manifestHackIssue846',
  renderCrxManifest(_manifest, bundle) {
    bundle['manifest.json'] = bundle['.vite/manifest.json']
    bundle['manifest.json'].fileName = 'manifest.json'
    delete bundle['.vite/manifest.json']
  },
}

export default defineConfig({
  build: {
    outDir: resolve(rootDir, 'dist'),
    /** Can slow down build speed. */
    // sourcemap: isDev,
    minify: isProduction,
    modulePreload: false,
    reportCompressedSize: isProduction,
    emptyOutDir: !isDev,
    rollupOptions: {
      input: {
        devtools: resolve(rootDir, 'src/devtools.html'),
        panel: resolve(rootDir, 'src/main.html'),
      },
    },
  },
  plugins: [react(), viteManifestHackIssue846, crx({ manifest })],
  optimizeDeps: {
    entries: ["src/*.html"],
  },
})
