import { build } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import react from "@vitejs/plugin-react-swc";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const main = path.join(dirname, "..", "src/webview", "main.tsx");

async function run() {
    await build({
        plugins: [react()],
        build: {
            outDir: "./dist/webview",
            rollupOptions: {
                input: main,
                output: {
                    format: "cjs",
                    entryFileNames: `[name].js`,
                    chunkFileNames: `[name].js`,
                    assetFileNames: `[name].[ext]`,
                },
            },
        },
        css: {
            postcss: {
                plugins: [tailwindcss, autoprefixer],
            },
        },
    });
}

run();
