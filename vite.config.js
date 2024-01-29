import { resolve } from "path";
import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        triangle: resolve(__dirname, "triangle/index.html"),
      },
    },
  },
  plugins: [glsl()],
});
