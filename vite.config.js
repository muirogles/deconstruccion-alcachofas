import { defineConfig } from 'vite';

// Relative base so the build works under any GitHub Pages path (repo can be renamed)
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
});
