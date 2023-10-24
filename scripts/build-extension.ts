import { build } from "esbuild";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const _dirname = dirname(fileURLToPath(import.meta.url));
const extensionPath = join(_dirname, "..", "src", "extension.ts");

async function buildExtension() {
    const prompt = "Building extension";

    console.time(prompt);

    await build({
        entryPoints: [extensionPath],
        bundle: true,
        outdir: "dist",
        minify: true,
        platform: "node",
        format: "cjs",
        external: ["vscode", "@interledger/open-payments"],
    });

    console.timeEnd(prompt);
}

buildExtension();
