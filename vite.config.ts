import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";


export default defineConfig(({ mode }) => ({
  server: {
    host: mode === 'development' ? "localhost" : "0.0.0.0",
    port: mode === 'development' ? 3000 : 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Production optimizations
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  }
}));
