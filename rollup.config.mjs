import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

const dev = process.env.ROLLUP_WATCH === "true";

export default {
  input: "src/zappi-card.ts",
  output: {
    file: "dist/zappi-card.js",
    format: "es",
    sourcemap: dev,
  },
  plugins: [nodeResolve(), typescript(), !dev && terser({ format: { comments: false } })],
};
