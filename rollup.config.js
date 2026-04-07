import terser from "@rollup/plugin-terser";
import { readFileSync } from "fs";
import { minify } from "html-minifier-terser";

function htmlPlugin() {
  return {
    name: "html",
    async generateBundle() {
      let html = readFileSync("index.html", "utf-8");
      html = html
        .replace('./dist/style.css', './style.css')
        .replace('./js/app.js', './app.js')
        .replace('type="module"', '');

      const minified = await minify(html, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
      });

      this.emitFile({ type: "asset", fileName: "index.html", source: minified });
    },
  };
}

export default {
  input: "js/app.js",
  output: {
    file: "dist/app.js",
    format: "iife",
  },
  plugins: [terser(), htmlPlugin()],
};
