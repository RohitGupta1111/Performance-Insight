import { defineConfig } from 'vite'

export default defineConfig(({mode}) => ({
  build: {
    lib: {
      entry: "src/web-vitals-script.js",
      name: "WebVitals",
      fileName: () => "web-vital-bundle-script.js"
    },
    rollupOptions: {
      output: {
        format: "iife"
      }
    },
    emptyOutDir: false,
    minify: mode === "production",
    sourcemap: mode === "development"
  }
}));
