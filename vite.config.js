import { resolve } from "path";
import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        triangle: resolve(__dirname, "triangle/index.html"),
        cube: resolve(__dirname, "cube/index.html"),
        pointLight: resolve(__dirname, "point-light/index.html"),
      },
    },
  },
  plugins: [glsl()],
});
